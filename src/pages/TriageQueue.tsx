import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "@/components/CategoryBadge";
import { UrgencyBadge } from "@/components/UrgencyBadge";
import { useToast } from "@/hooks/use-toast";
import type { Enums } from "@/integrations/supabase/types";

export default function TriageQueue() {
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["requests-triage"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("requests")
        .select("*")
        .eq("is_deleted", false)
        .in("status", ["classified", "in_triage"])
        .order("urgency", { ascending: true });
      if (error) throw error;
      // Sort by urgency priority
      const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return data.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Enums<"request_status"> }) => {
      const { error } = await supabase.from("requests").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["requests-triage"] });
      toast({ title: "Request updated" });
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-foreground">Triage Queue</h1>
      <p className="text-sm text-muted-foreground">Classified items awaiting triage. Promote to Sprint Candidate or defer.</p>

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
                <TableHead>Impact</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No items in triage
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">{r.title}</TableCell>
                    <TableCell>{r.source_customer}</TableCell>
                    <TableCell><UrgencyBadge urgency={r.urgency} /></TableCell>
                    <TableCell><CategoryBadge category={r.category} /></TableCell>
                    <TableCell className="max-w-[150px] truncate text-sm text-muted-foreground">{r.impact}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => updateStatus.mutate({ id: r.id, status: "sprint_candidate" })}>
                          Promote
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: r.id, status: "deferred" })}>
                          Defer
                        </Button>
                      </div>
                    </TableCell>
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
