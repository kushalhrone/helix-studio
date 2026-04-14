import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CategoryBadge } from "@/components/CategoryBadge";
import { UrgencyBadge } from "@/components/UrgencyBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { RequestFilters, defaultFilters, applyFilters, type FilterValues } from "@/components/RequestFilters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

export default function IntakeQueue() {
  const { user, isCsm, isPmOrAdmin } = useAuth();
  const [filters, setFilters] = useState<FilterValues>(defaultFilters);
  const csmOnly = isCsm && !isPmOrAdmin;
  const [tab, setTab] = useState(csmOnly ? "my-requests" : "all");

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

  const customers = useMemo(() => [...new Set(requests.map((r) => r.source_customer))].sort(), [requests]);

  const tabFiltered = useMemo(() => {
    let base = requests;
    if (tab === "my-requests") base = base.filter((r) => r.submitter_id === user?.id);
    return base;
  }, [requests, tab, user?.id]);

  const filtered = applyFilters(tabFiltered, filters);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-foreground">Intake Queue</h1>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {(isCsm || isPmOrAdmin) && <TabsTrigger value="my-requests">My Requests</TabsTrigger>}
          {!csmOnly && <TabsTrigger value="all">All Requests</TabsTrigger>}
        </TabsList>
      </Tabs>

      <RequestFilters filters={filters} onChange={setFilters} customers={customers} />

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
