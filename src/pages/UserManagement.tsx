import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { ROLE_DISPLAY, VISIBLE_ROLES } from "@/lib/constants";
import {
  PlusCircle, Trash2, Send, RefreshCw, Search, Users, UserPlus,
  Mail, CheckCircle2, XCircle, Copy, Inbox,
} from "lucide-react";
import type { Enums } from "@/integrations/supabase/types";

// ---------- constants ----------
interface InviteRow { email: string; role: Enums<"app_role"> }

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

function getInitials(name?: string | null, email?: string | null) {
  if (name) return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  if (email) return email[0].toUpperCase();
  return "?";
}

function isValidEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
}

// ---------- sub-components ----------
function RoleBadge({ role }: { role: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="outline" className={ROLE_BADGE_CLASSES[role] ?? ""}>{ROLE_DISPLAY[role] ?? role}</Badge>
      </TooltipTrigger>
      <TooltipContent><p className="text-xs">{ROLE_DESCRIPTIONS[role] ?? role}</p></TooltipContent>
    </Tooltip>
  );
}

function SkeletonRows({ cols, rows = 4 }: { cols: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

function EmptyState({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-muted p-4 mb-4"><Icon className="h-8 w-8 text-muted-foreground" /></div>
      <h3 className="text-lg font-medium text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
    </div>
  );
}

// ---------- main ----------
export default function UserManagement() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [tab, setTab] = useState("members");
  const [invites, setInvites] = useState<InviteRow[]>([{ email: "", role: "submitter" }]);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [roleDialog, setRoleDialog] = useState<{ userId: string; name: string; from: string; to: string } | null>(null);
  const [revokeDialog, setRevokeDialog] = useState<{ id: string; email: string } | null>(null);
  const [bulkRole, setBulkRole] = useState<Enums<"app_role"> | "">("");
  const [bulkDialog, setBulkDialog] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const lastInputRef = useRef<HTMLInputElement>(null);

  // queries
  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: profiles, error: pe } = await supabase.from("profiles").select("*");
      if (pe) throw pe;
      const { data: roles, error: re } = await supabase.from("user_roles").select("user_id, role");
      if (re) throw re;
      return profiles.map((p) => ({ ...p, user_roles: roles.filter((r) => r.user_id === p.user_id) }));
    },
  });

  const { data: invitations = [], isLoading: loadingInvitations } = useQuery({
    queryKey: ["invitations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("invitations").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // mutations
  const updateRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: Enums<"app_role"> }) => {
      await supabase.from("user_roles").delete().eq("user_id", userId);
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-users"] }); toast({ title: "Role updated" }); },
  });

  const revokeInvitation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("invitations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["invitations"] }); toast({ title: "Invitation revoked" }); },
  });

  // invite helpers
  const addInviteRow = () => { setInvites((prev) => [...prev, { email: "", role: "submitter" }]); setTimeout(() => lastInputRef.current?.focus(), 50); };
  const removeInviteRow = (i: number) => setInvites((prev) => prev.filter((_, idx) => idx !== i));
  const updateInvite = (i: number, field: keyof InviteRow, value: string) => {
    setInvites((prev) => { const u = [...prev]; (u[i] as any)[field] = value; return u; });
  };

  const existingEmails = new Set([...users.map((u) => u.email?.toLowerCase()), ...invitations.map((i) => i.email.toLowerCase())]);

  const sendInvitations = async (emailsToSend?: InviteRow[]) => {
    const valid = (emailsToSend ?? invites).filter((inv) => inv.email.trim() && isValidEmail(inv.email));
    if (valid.length === 0) return;
    setSending(true);
    try {
      const res = await supabase.functions.invoke("invite-user", { body: { invites: valid } });
      if (res.error) throw res.error;
      const result = res.data as { sent: number; errors: string[] };
      toast({ title: `${result.sent} invitation(s) sent`, description: result.errors.length > 0 ? result.errors.join(", ") : undefined });
      if (!emailsToSend) {
        setInvites([{ email: "", role: "submitter" }]);
        setInviteSuccess(true);
        setTimeout(() => { setInviteSuccess(false); setTab("invitations"); }, 1500);
      }
      qc.invalidateQueries({ queryKey: ["invitations"] });
    } catch (err: any) {
      toast({ title: "Failed to send invitations", description: err.message, variant: "destructive" });
    } finally { setSending(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.ctrlKey && !e.metaKey) { e.preventDefault(); addInviteRow(); }
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); sendInvitations(); }
  };

  // role change confirmation
  const confirmRoleChange = (userId: string, name: string, from: string, to: string) => {
    if (from === to) return;
    setRoleDialog({ userId, name, from, to });
  };

  // bulk
  const applyBulkRole = () => {
    if (!bulkRole) return;
    selected.forEach((userId) => updateRole.mutate({ userId, role: bulkRole as Enums<"app_role"> }));
    setSelected(new Set());
    setBulkRole("");
    setBulkDialog(false);
  };

  const toggleSelect = (userId: string) => setSelected((prev) => {
    const next = new Set(prev);
    next.has(userId) ? next.delete(userId) : next.add(userId);
    return next;
  });
  const toggleAll = () => setSelected((prev) => prev.size === filteredUsers.length ? new Set() : new Set(filteredUsers.map((u) => u.user_id)));

  // filters
  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return !q || u.display_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });

  const pendingCount = invitations.filter((i) => i.status === "pending").length;

  // copy signup link
  const copySignupLink = () => {
    const url = `${window.location.origin}/auth`;
    navigator.clipboard.writeText(url);
    toast({ title: "Signup link copied to clipboard" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-semibold text-foreground">User Management</h1>
          <Badge variant="secondary" className="ml-1">{users.length} users</Badge>
        </div>
        <Button onClick={() => setTab("invite")} className="gap-2">
          <UserPlus className="h-4 w-4" /> Invite Users
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card className="p-4 flex items-center gap-3">
          <div className="rounded-full bg-primary/10 p-2"><Users className="h-4 w-4 text-primary" /></div>
          <div><div className="text-2xl font-bold text-foreground">{users.length}</div><div className="text-xs text-muted-foreground">Active Users</div></div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="rounded-full bg-amber-100 p-2"><Mail className="h-4 w-4 text-amber-600" /></div>
          <div><div className="text-2xl font-bold text-foreground">{pendingCount}</div><div className="text-xs text-muted-foreground">Pending Invites</div></div>
        </Card>
        <Card className="p-4 flex items-center gap-3 hidden sm:flex">
          <div className="rounded-full bg-green-100 p-2"><CheckCircle2 className="h-4 w-4 text-green-600" /></div>
          <div><div className="text-2xl font-bold text-foreground">{invitations.filter((i) => i.status === "accepted").length}</div><div className="text-xs text-muted-foreground">Accepted</div></div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="members" className="gap-1.5">
            <Users className="h-3.5 w-3.5" /> Team Members
            <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">{users.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="invitations" className="gap-1.5">
            <Mail className="h-3.5 w-3.5" /> Invitations
            {pendingCount > 0 && <Badge className="ml-1 text-xs px-1.5 py-0 bg-amber-500">{pendingCount}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="invite" className="gap-1.5">
            <UserPlus className="h-3.5 w-3.5" /> Invite New
          </TabsTrigger>
        </TabsList>

        {/* TAB: Team Members */}
        <TabsContent value="members" className="animate-in fade-in-50 duration-300">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search by name or email" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                </div>
                {selected.size > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{selected.size} selected</span>
                    <Select value={bulkRole} onValueChange={(v) => setBulkRole(v as Enums<"app_role">)}>
                      <SelectTrigger className="w-32"><SelectValue placeholder="Bulk role" /></SelectTrigger>
                      <SelectContent>{VISIBLE_ROLES.map((r) => <SelectItem key={r} value={r}>{ROLE_DISPLAY[r]}</SelectItem>)}</SelectContent>
                    </Select>
                    <Button size="sm" disabled={!bulkRole} onClick={() => setBulkDialog(true)}>Apply</Button>
                  </div>
                )}
              </div>
              <div className="border rounded-lg overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10"><Checkbox checked={selected.size === filteredUsers.length && filteredUsers.length > 0} onCheckedChange={toggleAll} /></TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Current Role</TableHead>
                      <TableHead>Change Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingUsers ? <SkeletonRows cols={5} /> : filteredUsers.length === 0 ? (
                      <TableRow><TableCell colSpan={5}><EmptyState icon={Users} title={search ? "No results" : "No users yet"} description={search ? "Try a different search term" : "Invite your first team member to get started"} /></TableCell></TableRow>
                    ) : filteredUsers.map((u) => {
                      const currentRole = (u.user_roles as any)?.[0]?.role ?? "submitter";
                      return (
                        <TableRow key={u.id} data-state={selected.has(u.user_id) ? "selected" : undefined}>
                          <TableCell><Checkbox checked={selected.has(u.user_id)} onCheckedChange={() => toggleSelect(u.user_id)} /></TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs bg-primary/10 text-primary">{getInitials(u.display_name, u.email)}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{u.display_name ?? "—"}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{u.email}</TableCell>
                          <TableCell><RoleBadge role={currentRole} /></TableCell>
                          <TableCell>
                            <Select value={currentRole} onValueChange={(v) => confirmRoleChange(u.user_id, u.display_name ?? u.email ?? "User", currentRole, v)}>
                              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                              <SelectContent>{VISIBLE_ROLES.map((r) => <SelectItem key={r} value={r}>{ROLE_DISPLAY[r]}</SelectItem>)}</SelectContent>
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
        </TabsContent>

        {/* TAB: Invitations */}
        <TabsContent value="invitations" className="animate-in fade-in-50 duration-300">
          <Card>
            <CardContent className="pt-6">
              {loadingInvitations ? (
                <div className="border rounded-lg overflow-auto"><Table><TableHeader><TableRow><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead>Sent</TableHead><TableHead className="w-28">Actions</TableHead></TableRow></TableHeader><TableBody><SkeletonRows cols={5} /></TableBody></Table></div>
              ) : invitations.length === 0 ? (
                <EmptyState icon={Inbox} title="No invitations yet" description="Send your first invitation from the Invite New tab" />
              ) : (
                <div className="border rounded-lg overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Sent</TableHead>
                        <TableHead className="w-28">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invitations.map((inv) => (
                        <TableRow key={inv.id}>
                          <TableCell className="font-medium">{inv.email}</TableCell>
                          <TableCell><RoleBadge role={inv.role} /></TableCell>
                          <TableCell>
                            <Badge variant={inv.status === "accepted" ? "default" : "secondary"} className="capitalize gap-1">
                              {inv.status === "accepted" ? <CheckCircle2 className="h-3 w-3" /> : inv.status === "pending" ? <Mail className="h-3 w-3" /> : null}
                              {inv.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">{new Date(inv.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {inv.status === "pending" && (
                                <>
                                  <Tooltip><TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" disabled={sending} onClick={() => sendInvitations([{ email: inv.email, role: inv.role }])}>
                                      <RefreshCw className="h-3.5 w-3.5" />
                                    </Button>
                                  </TooltipTrigger><TooltipContent>Resend</TooltipContent></Tooltip>
                                  <Tooltip><TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setRevokeDialog({ id: inv.id, email: inv.email })}>
                                      <XCircle className="h-3.5 w-3.5" />
                                    </Button>
                                  </TooltipTrigger><TooltipContent>Revoke</TooltipContent></Tooltip>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Invite New */}
        <TabsContent value="invite" className="animate-in fade-in-50 duration-300">
          <Card>
            <CardContent className="pt-6 space-y-4">
              {inviteSuccess ? (
                <div className="flex flex-col items-center justify-center py-12 animate-in zoom-in-50 duration-300">
                  <div className="rounded-full bg-green-100 p-4 mb-4"><CheckCircle2 className="h-10 w-10 text-green-600" /></div>
                  <h3 className="text-lg font-medium text-foreground">Invitations Sent!</h3>
                  <p className="text-sm text-muted-foreground">Redirecting to invitations…</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">Add email addresses below. Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">Enter</kbd> to add another row, <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">Ctrl+Enter</kbd> to send all.</p>
                  {invites.map((inv, i) => {
                    const trimmed = inv.email.trim();
                    const isDuplicate = trimmed && existingEmails.has(trimmed.toLowerCase());
                    const isInvalid = trimmed && !isValidEmail(trimmed);
                    return (
                      <div key={i} className="space-y-1" onKeyDown={handleKeyDown}>
                        <div className="flex gap-3 items-center">
                          <div className="flex-1 relative">
                            <Input
                              ref={i === invites.length - 1 ? lastInputRef : undefined}
                              placeholder="Email address"
                              type="email"
                              value={inv.email}
                              onChange={(e) => updateInvite(i, "email", e.target.value)}
                              className={isDuplicate || isInvalid ? "border-destructive focus-visible:ring-destructive" : ""}
                            />
                          </div>
                          <Select value={inv.role} onValueChange={(v) => updateInvite(i, "role", v)}>
                            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                            <SelectContent>{VISIBLE_ROLES.map((r) => <SelectItem key={r} value={r}>{ROLE_DISPLAY[r]}</SelectItem>)}</SelectContent>
                          </Select>
                          {invites.length > 1 && (
                            <Button variant="ghost" size="icon" onClick={() => removeInviteRow(i)}><Trash2 className="h-4 w-4" /></Button>
                          )}
                        </div>
                        {isDuplicate && <p className="text-xs text-destructive pl-1">This email already exists</p>}
                        {isInvalid && <p className="text-xs text-destructive pl-1">Invalid email format</p>}
                      </div>
                    );
                  })}
                  <div className="flex gap-3 flex-wrap">
                    <Button variant="outline" size="sm" onClick={addInviteRow}><PlusCircle className="mr-2 h-4 w-4" /> Add Another</Button>
                    <Button size="sm" onClick={() => sendInvitations()} disabled={sending || invites.every((inv) => !inv.email.trim() || !isValidEmail(inv.email))}>
                      <Send className="mr-2 h-4 w-4" /> Send Invitations
                    </Button>
                    <Button variant="ghost" size="sm" onClick={copySignupLink}><Copy className="mr-2 h-4 w-4" /> Copy Signup Link</Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Role change dialog */}
      <AlertDialog open={!!roleDialog} onOpenChange={(o) => !o && setRoleDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Role</AlertDialogTitle>
            <AlertDialogDescription>
              Change <span className="font-medium text-foreground">{roleDialog?.name}</span>'s role from{" "}
              <span className="font-medium">{ROLE_DISPLAY[roleDialog?.from ?? ""]}</span> to{" "}
              <span className="font-medium">{ROLE_DISPLAY[roleDialog?.to ?? ""]}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (roleDialog) { updateRole.mutate({ userId: roleDialog.userId, role: roleDialog.to as Enums<"app_role"> }); setRoleDialog(null); } }}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Revoke invitation dialog */}
      <AlertDialog open={!!revokeDialog} onOpenChange={(o) => !o && setRevokeDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Invitation</AlertDialogTitle>
            <AlertDialogDescription>
              Revoke the invitation for <span className="font-medium text-foreground">{revokeDialog?.email}</span>? They will no longer be able to use this invite.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => { if (revokeDialog) { revokeInvitation.mutate(revokeDialog.id); setRevokeDialog(null); } }}>
              Revoke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk role dialog */}
      <AlertDialog open={bulkDialog} onOpenChange={setBulkDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bulk Role Change</AlertDialogTitle>
            <AlertDialogDescription>
              Change the role of {selected.size} user(s) to <span className="font-medium">{ROLE_DISPLAY[bulkRole] ?? bulkRole}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={applyBulkRole}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
