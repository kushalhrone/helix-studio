import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CategoryBadge } from "@/components/CategoryBadge";
import { UrgencyBadge } from "@/components/UrgencyBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { useToast } from "@/hooks/use-toast";
import { CATEGORY_CONFIG } from "@/lib/constants";
import { RequestFilters, defaultFilters, applyFilters, type FilterValues } from "@/components/RequestFilters";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Enums, Tables } from "@/integrations/supabase/types";

export default function SprintBoard() {
  const { user, isPmOrAdmin } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showNewSprint, setShowNewSprint] = useState(false);
  const [interruptModal, setInterruptModal] = useState<{ request: Tables<"requests">; sprintId: string } | null>(null);
  const [newSprint, setNewSprint] = useState({ name: "", start_date: "", end_date: "" });
  const [interruptForm, setInterruptForm] = useState({ reason: "", category_confirmation: "" as Enums<"request_category"> | "", deprioritised_items: "" });
  const [tab, setTab] = useState("all");
  const [filters, setFilters] = useState<FilterValues>(defaultFilters);

  const { data: sprints = [] } = useQuery({
    queryKey: ["sprints"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sprints").select("*").order("start_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: requests = [] } = useQuery({
    queryKey: ["requests-sprint"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("requests")
        .select("*")
        .eq("is_deleted", false)
        .in("status", ["sprint_candidate", "in_sprint", "done"]);
      if (error) throw error;
      return data;
    },
  });

  const customers = useMemo(() => [...new Set(requests.map((r) => r.source_customer))].sort(), [requests]);

  const tabFiltered = useMemo(() => {
    if (tab === "in-progress") return requests.filter((r) => r.status === "in_sprint");
    return requests;
  }, [requests, tab]);

  const filtered = applyFilters(tabFiltered, filters);

  const createSprint = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("sprints").insert({
        name: newSprint.name,
        start_date: newSprint.start_date,
        end_date: newSprint.end_date,
        created_by: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sprints"] });
      setShowNewSprint(false);
      setNewSprint({ name: "", start_date: "", end_date: "" });
      toast({ title: "Sprint created" });
    },
  });

  const moveToSprint = useMutation({
    mutationFn: async ({ requestId, sprintId }: { requestId: string; sprintId: string }) => {
      const { error } = await supabase.from("requests").update({ sprint_id: sprintId, status: "in_sprint" as Enums<"request_status"> }).eq("id", requestId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["requests-sprint"] });
      toast({ title: "Moved to sprint" });
    },
  });

  const createInterrupt = useMutation({
    mutationFn: async () => {
      if (!interruptModal || !interruptForm.category_confirmation) return;
      const { error } = await supabase.from("sprint_interrupts").insert({
        request_id: interruptModal.request.id,
        sprint_id: interruptModal.sprintId,
        reason: interruptForm.reason,
        category_confirmation: interruptForm.category_confirmation as Enums<"request_category">,
        deprioritised_items: interruptForm.deprioritised_items,
        created_by: user!.id,
      });
      if (error) throw error;
      await supabase.from("requests").update({ sprint_id: interruptModal.sprintId, status: "in_sprint" as Enums<"request_status"> }).eq("id", interruptModal.request.id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["requests-sprint"] });
      qc.invalidateQueries({ queryKey: ["interrupts"] });
      setInterruptModal(null);
      setInterruptForm({ reason: "", category_confirmation: "", deprioritised_items: "" });
      toast({ title: "Sprint interrupt logged" });
    },
  });

  const activeSprint = sprints.find((s) => s.status === "active");
  const sprintCandidates = filtered.filter((r) => r.status === "sprint_candidate");
  const inSprint = filtered.filter((r) => r.status === "in_sprint");
  const done = filtered.filter((r) => r.status === "done");

  // Group by customer for the "by-customer" tab
  const customerGroups = useMemo(() => {
    if (tab !== "by-customer") return {};
    const groups: Record<string, typeof filtered> = {};
    filtered.forEach((r) => {
      if (!groups[r.source_customer]) groups[r.source_customer] = [];
      groups[r.source_customer].push(r);
    });
    return groups;
  }, [tab, filtered]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Sprint Board</h1>
        {isPmOrAdmin && (
          <Button onClick={() => setShowNewSprint(true)}>New Sprint</Button>
        )}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All Requests</TabsTrigger>
          <TabsTrigger value="by-customer">By Customer</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
        </TabsList>
      </Tabs>

      <RequestFilters filters={filters} onChange={setFilters} customers={customers} showStatus={false} />

      {/* Sprint creation dialog */}
      <Dialog open={showNewSprint} onOpenChange={setShowNewSprint}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Sprint</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Sprint Name</Label>
              <Input value={newSprint.name} onChange={(e) => setNewSprint({ ...newSprint, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={newSprint.start_date} onChange={(e) => setNewSprint({ ...newSprint, start_date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" value={newSprint.end_date} onChange={(e) => setNewSprint({ ...newSprint, end_date: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => createSprint.mutate()} disabled={!newSprint.name || !newSprint.start_date || !newSprint.end_date}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Interrupt modal */}
      <Dialog open={!!interruptModal} onOpenChange={() => setInterruptModal(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Log Sprint Interrupt</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Interrupting sprint with: <strong>{interruptModal?.request.title}</strong>
            </p>
            <div className="space-y-2">
              <Label>Reason *</Label>
              <Textarea value={interruptForm.reason} onChange={(e) => setInterruptForm({ ...interruptForm, reason: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Confirm Category *</Label>
              <Select value={interruptForm.category_confirmation} onValueChange={(v) => setInterruptForm({ ...interruptForm, category_confirmation: v as Enums<"request_category"> })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {(["production_bug", "client_commitment", "usability_issue"] as const).map((key) => (
                    <SelectItem key={key} value={key}>{CATEGORY_CONFIG[key].emoji} {CATEGORY_CONFIG[key].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>What gets deprioritised? *</Label>
              <Textarea value={interruptForm.deprioritised_items} onChange={(e) => setInterruptForm({ ...interruptForm, deprioritised_items: e.target.value })} required placeholder="List items being pushed out" />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => createInterrupt.mutate()}
              disabled={!interruptForm.reason || !interruptForm.category_confirmation || !interruptForm.deprioritised_items}
            >
              Log Interrupt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* By Customer View */}
      {tab === "by-customer" ? (
        <div className="space-y-4">
          {Object.entries(customerGroups).sort(([a], [b]) => a.localeCompare(b)).map(([customer, items]) => (
            <Card key={customer}>
              <CardHeader><CardTitle className="text-base">{customer} ({items.length})</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {items.map((r) => (
                  <div key={r.id} className="flex items-center justify-between border rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <p className="font-medium text-sm">{r.title}</p>
                      <StatusBadge status={r.status} />
                    </div>
                    <div className="flex gap-2">
                      <UrgencyBadge urgency={r.urgency} />
                      <CategoryBadge category={r.category} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
          {Object.keys(customerGroups).length === 0 && (
            <p className="text-muted-foreground text-center py-8">No requests found</p>
          )}
        </div>
      ) : (
        /* Board columns */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Sprint Candidates ({sprintCandidates.length})</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {sprintCandidates.map((r) => (
                <div key={r.id} className="border rounded-lg p-3 space-y-2">
                  <p className="font-medium text-sm">{r.title}</p>
                  <div className="flex gap-2 flex-wrap">
                    <UrgencyBadge urgency={r.urgency} />
                    <CategoryBadge category={r.category} />
                  </div>
                  {isPmOrAdmin && activeSprint && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => moveToSprint.mutate({ requestId: r.id, sprintId: activeSprint.id })}>
                        Add to Sprint
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setInterruptModal({ request: r, sprintId: activeSprint.id })}>
                        Interrupt
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              {sprintCandidates.length === 0 && <p className="text-sm text-muted-foreground">No candidates</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">In Sprint ({inSprint.length})</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {inSprint.map((r) => (
                <div key={r.id} className="border rounded-lg p-3 space-y-2">
                  <p className="font-medium text-sm">{r.title}</p>
                  <div className="flex gap-2 flex-wrap">
                    <UrgencyBadge urgency={r.urgency} />
                    <CategoryBadge category={r.category} />
                  </div>
                </div>
              ))}
              {inSprint.length === 0 && <p className="text-sm text-muted-foreground">No items in sprint</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Done ({done.length})</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {done.map((r) => (
                <div key={r.id} className="border rounded-lg p-3 space-y-2">
                  <p className="font-medium text-sm">{r.title}</p>
                  <CategoryBadge category={r.category} />
                </div>
              ))}
              {done.length === 0 && <p className="text-sm text-muted-foreground">No completed items</p>}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
