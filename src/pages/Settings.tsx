import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ROLE_DISPLAY, VISIBLE_ROLES } from "@/lib/constants";
import { PlusCircle, Trash2, Send } from "lucide-react";
import type { Enums } from "@/integrations/supabase/types";

interface InviteRow {
  email: string;
  role: Enums<"app_role">;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [invites, setInvites] = useState<InviteRow[]>([{ email: "", role: "submitter" }]);
  const [sending, setSending] = useState(false);

  const { data: users = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*, user_roles(role)");
      if (error) throw error;
      return data;
    },
  });

  const { data: invitations = [] } = useQuery({
    queryKey: ["invitations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("invitations").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: Enums<"app_role"> }) => {
      await supabase.from("user_roles").delete().eq("user_id", userId);
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "Role updated" });
    },
  });

  const addInviteRow = () => setInvites([...invites, { email: "", role: "submitter" }]);
  const removeInviteRow = (i: number) => setInvites(invites.filter((_, idx) => idx !== i));
  const updateInvite = (i: number, field: keyof InviteRow, value: string) => {
    const updated = [...invites];
    (updated[i] as any)[field] = value;
    setInvites(updated);
  };

  const sendInvitations = async () => {
    const valid = invites.filter((inv) => inv.email.trim());
    if (valid.length === 0) return;

    setSending(true);
    try {
      const res = await supabase.functions.invoke("invite-user", {
        body: { invites: valid },
      });
      if (res.error) throw res.error;

      const result = res.data as { sent: number; errors: string[] };
      toast({
        title: `${result.sent} invitation(s) sent`,
        description: result.errors.length > 0 ? result.errors.join(", ") : undefined,
      });
      setInvites([{ email: "", role: "submitter" }]);
      qc.invalidateQueries({ queryKey: ["invitations"] });
    } catch (err: any) {
      toast({ title: "Failed to send invitations", description: err.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Settings</h1>

      {/* Invite Users */}
      <Card>
        <CardHeader><CardTitle className="text-base">Invite Users</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {invites.map((inv, i) => (
            <div key={i} className="flex gap-3 items-center">
              <Input
                placeholder="Email address"
                type="email"
                value={inv.email}
                onChange={(e) => updateInvite(i, "email", e.target.value)}
                className="flex-1"
              />
              <Select value={inv.role} onValueChange={(v) => updateInvite(i, "role", v)}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {VISIBLE_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>{ROLE_DISPLAY[r]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {invites.length > 1 && (
                <Button variant="ghost" size="icon" onClick={() => removeInviteRow(i)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={addInviteRow}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Another
            </Button>
            <Button size="sm" onClick={sendInvitations} disabled={sending || invites.every((inv) => !inv.email.trim())}>
              <Send className="mr-2 h-4 w-4" /> Send Invitations
            </Button>
          </div>

          {invitations.length > 0 && (
            <div className="border rounded-lg overflow-auto mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell>{inv.email}</TableCell>
                      <TableCell>{ROLE_DISPLAY[inv.role] ?? inv.role}</TableCell>
                      <TableCell className="capitalize">{inv.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Role Management */}
      <Card>
        <CardHeader><CardTitle className="text-base">User Role Management</CardTitle></CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Current Role</TableHead>
                  <TableHead>Change Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => {
                  const currentRole = (u.user_roles as any)?.[0]?.role ?? "submitter";
                  return (
                    <TableRow key={u.id}>
                      <TableCell>{u.display_name ?? "—"}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{ROLE_DISPLAY[currentRole] ?? currentRole}</TableCell>
                      <TableCell>
                        <Select value={currentRole} onValueChange={(v) => updateRole.mutate({ userId: u.user_id, role: v as Enums<"app_role"> })}>
                          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {VISIBLE_ROLES.map((r) => (
                              <SelectItem key={r} value={r}>{ROLE_DISPLAY[r]}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
