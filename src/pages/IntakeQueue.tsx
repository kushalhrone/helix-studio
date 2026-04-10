import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CategoryBadge } from "@/components/CategoryBadge";
import { UrgencyBadge } from "@/components/UrgencyBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { useState } from "react";
import { format } from "date-fns";
import type { Enums } from "@/integrations/supabase/types";

export default function IntakeQueue() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all");

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["requests-intake"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("requests")
        .select("*")
        .eq("is_deleted", false)
        .order("date_received", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = requests.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (urgencyFilter !== "all" && r.urgency !== urgencyFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-foreground">Intake Queue</h1>

      <div className="flex gap-3 flex-wrap">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="intake">Intake</SelectItem>
            <SelectItem value="classified">Classified</SelectItem>
            <SelectItem value="in_triage">In Triage</SelectItem>
            <SelectItem value="sprint_candidate">Sprint Candidate</SelectItem>
            <SelectItem value="in_sprint">In Sprint</SelectItem>
            <SelectItem value="done">Done</SelectItem>
            <SelectItem value="deferred">Deferred</SelectItem>
          </SelectContent>
        </Select>

        <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Urgency" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Urgencies</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="border rounded-lg overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Urgency</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Received</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No requests found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">{r.title}</TableCell>
                    <TableCell>{r.source_customer}</TableCell>
                    <TableCell><UrgencyBadge urgency={r.urgency} /></TableCell>
                    <TableCell><CategoryBadge category={r.category} /></TableCell>
                    <TableCell><StatusBadge status={r.status} /></TableCell>
                    <TableCell className="text-muted-foreground text-sm">{format(new Date(r.date_received), "MMM d, yyyy")}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
