import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CategoryBadge } from "@/components/CategoryBadge";
import { format } from "date-fns";

export default function InterruptLog() {
  const { data: interrupts = [], isLoading } = useQuery({
    queryKey: ["interrupts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sprint_interrupts")
        .select("*, requests(title), sprints(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-foreground">Interrupt Log</h1>
      <p className="text-sm text-muted-foreground">All sprint interrupts with trade-off records.</p>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="border rounded-lg overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request</TableHead>
                <TableHead>Sprint</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Deprioritised</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interrupts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No interrupts recorded
                  </TableCell>
                </TableRow>
              ) : (
                interrupts.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="font-medium">{(i.requests as any)?.title ?? "—"}</TableCell>
                    <TableCell>{(i.sprints as any)?.name ?? "—"}</TableCell>
                    <TableCell><CategoryBadge category={i.category_confirmation} /></TableCell>
                    <TableCell className="max-w-[200px] truncate">{i.reason}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{i.deprioritised_items}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{format(new Date(i.created_at), "MMM d, yyyy")}</TableCell>
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
