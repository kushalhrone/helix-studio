import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { UrgencyBadge } from "@/components/UrgencyBadge";
import { CategoryBadge } from "@/components/CategoryBadge";
import { useToast } from "@/hooks/use-toast";
import { CATEGORY_CONFIG } from "@/lib/constants";
import { RequestFilters, defaultFilters, applyFilters, type FilterValues } from "@/components/RequestFilters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Enums } from "@/integrations/supabase/types";

export default function Classification() {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkCategory, setBulkCategory] = useState<Enums<"request_category"> | "">("");
  const [tab, setTab] = useState("unclassified");
  const [filters, setFilters] = useState<FilterValues>({ ...defaultFilters, status: "all" });

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["requests-classify"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("requests")
        .select("*")
        .eq("is_deleted", false)
        .in("status", ["intake", "classified"])
        .order("date_received", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const customers = useMemo(() => [...new Set(requests.map((r) => r.source_customer))].sort(), [requests]);

  const tabFiltered = useMemo(() => {
    if (tab === "unclassified") return requests.filter((r) => r.status === "intake");
    if (tab === "all") return requests;
    return requests.filter((r) => r.category === tab);
  }, [requests, tab]);

  const filtered = applyFilters(tabFiltered, filters);

  const classifyMutation = useMutation({
    mutationFn: async ({ ids, category }: { ids: string[]; category: Enums<"request_category"> }) => {
      const { error } = await supabase
        .from("requests")
        .update({
          category,
          status: "classified" as Enums<"request_status">,
          classified_at: new Date().toISOString(),
          classified_by: user?.id,
        })
        .in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["requests-classify"] });
      setSelected([]);
      setBulkCategory("");
      toast({ title: "Requests classified" });
    },
  });

  const handleBulkClassify = () => {
    if (!bulkCategory || selected.length === 0) return;
    classifyMutation.mutate({ ids: selected, category: bulkCategory as Enums<"request_category"> });
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const handleSingleClassify = (id: string, category: Enums<"request_category">) => {
    classifyMutation.mutate({ ids: [id], category });
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-foreground">Classification Panel</h1>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="unclassified">Unclassified</TabsTrigger>
          {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
            <TabsTrigger key={key} value={key}>{cfg.emoji} {cfg.label}</TabsTrigger>
          ))}
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>

      <RequestFilters filters={filters} onChange={setFilters} customers={customers} showStatus={false} />

      {selected.length > 0 && (
        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
          <span className="text-sm font-medium">{selected.length} selected</span>
          <Select value={bulkCategory} onValueChange={(v) => setBulkCategory(v as Enums<"request_category">)}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Assign category" /></SelectTrigger>
            <SelectContent>
              {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>{cfg.emoji} {cfg.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleBulkClassify} disabled={!bulkCategory || classifyMutation.isPending} size="sm">
            Apply
          </Button>
        </div>
      )}

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="border rounded-lg overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Urgency</TableHead>
                <TableHead>Submitter Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No requests to classify
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <Checkbox checked={selected.includes(r.id)} onCheckedChange={() => toggleSelect(r.id)} />
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">{r.title}</TableCell>
                    <TableCell>{r.source_customer}</TableCell>
                    <TableCell><UrgencyBadge urgency={r.urgency} /></TableCell>
                    <TableCell><CategoryBadge category={r.request_type} /></TableCell>
                    <TableCell><CategoryBadge category={r.category} /></TableCell>
                    <TableCell>
                      <Select onValueChange={(v) => handleSingleClassify(r.id, v as Enums<"request_category">)}>
                        <SelectTrigger className="w-40"><SelectValue placeholder="Classify" /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                            <SelectItem key={key} value={key}>{cfg.emoji} {cfg.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
