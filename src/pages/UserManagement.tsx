import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { ROLE_DISPLAY, VISIBLE_ROLES } from "@/lib/constants";
import { PlusCircle, Trash2, Send, RefreshCw, Search, Users } from "lucide-react";
import type { Enums } from "@/integrations/supabase/types";

interface InviteRow {
  email: string;
  role: Enums<"app_role">;
}

const ROLE_BADGE_CLASSES: Record<string, string> = {
  admin: "bg-purple-100 text-purple-800 border-purple-200",
  pm: "bg-blue-100 text-blue-800 border-blue-200",
  submitter: "bg-green-100 text-green-800 border-green-200",
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  admin: "Full access + user management",
  pm: "Classify & triage requests",
  submitter: "Submit & track requests",
};

export default function UserManagement() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [invites, setInvites] = useState<InviteRow[]>([{ email: "", role: "submitter" }]);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");

  const { data: users = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase.from("profiles").select("*");
      if (profilesError) throw profilesError;
      const { data: roles, error: rolesError } = await supabase.from("user_roles").select("user_id, role");
      if (rolesError) throw rolesError;
      return profiles.map((p) => ({
        ...p,
        user_roles: roles.filter((r) => r.user_id === p.user_id),
      }));
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

  const sendInvitations = async (emailsToSend?: InviteRow[]) => {
    const valid = (emailsToSend ?? invites).filter((inv) => inv.email.trim());
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
      if (!emailsToSend) setInvites([{ email: "", role: "submitter" }]);
      qc.invalidateQueries({ queryKey: ["invitations"] });
    } catch (err: any) {
      toast({ title: "Failed to send invitations", description: err.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const resendInvitation = (email: string, role: Enums<"app_role">) => {
    sendInvitations([{ email, role }]);
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return !q || (u.display_name?.toLowerCase().includes(q)) || (u.email?.toLowerCase().includes(q));
  });

  const RoleBadge = ({ role }: { role: string }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="outline" className={ROLE_BADGE_CLASSES[role] ?? ""}>
          {ROLE_DISPLAY[role] ?? role}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs">{ROLE_DESCRIPTIONS[role] ?? role}</p>
      </TooltipContent>
    </Tooltip>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-semibold text-foreground">User Management</h1>
      </div>

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
            <Button size="sm" onClick={() => sendInvitations()} disabled={sending || invites.every((inv) => !inv.email.trim())}>
              <Send className="mr-2 h-4 w-4" /> Send Invitations
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Pending Invitations</CardTitle></CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell>{inv.email}</TableCell>
                      <TableCell><RoleBadge role={inv.role} /></TableCell>
                      <TableCell>
                        <Badge variant={inv.status === "accepted" ? "default" : "secondary"} className="capitalize">
                          {inv.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(inv.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {inv.status === "pending" && (
                          <Button variant="ghost" size="sm" disabled={sending} onClick={() => resendInvitation(inv.email, inv.role)}>
                            <RefreshCw className="mr-1 h-3 w-3" /> Resend
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Users */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Active Users</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name or email" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
        </CardHeader>
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
                {filteredUsers.map((u) => {
                  const currentRole = (u.user_roles as any)?.[0]?.role ?? "submitter";
                  return (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.display_name ?? "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{u.email}</TableCell>
                      <TableCell><RoleBadge role={currentRole} /></TableCell>
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
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      {search ? "No users match your search" : "No users found"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
