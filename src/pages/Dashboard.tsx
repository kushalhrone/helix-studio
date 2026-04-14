import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { CATEGORY_CONFIG } from "@/lib/constants";
import { StatusBadge } from "@/components/StatusBadge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { format } from "date-fns";

export default function Dashboard() {
  const { user, isPmOrAdmin, isCsm } = useAuth();

  const { data: requests = [] } = useQuery({
    queryKey: ["requests-dashboard"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("requests")
        .select("*")
        .eq("is_deleted", false);
      if (error) throw error;
      return data;
    },
  });

  const { data: interrupts = [] } = useQuery({
    queryKey: ["interrupts-dashboard"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sprint_interrupts").select("*");
      if (error) throw error;
      return data;
    },
    enabled: isPmOrAdmin,
  });

  const { data: sprints = [] } = useQuery({
    queryKey: ["sprints-dashboard"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sprints").select("*");
      if (error) throw error;
      return data;
    },
    enabled: isPmOrAdmin,
  });

  // CSM Team: show only own requests
  const myRequests = requests.filter((r) => r.submitter_id === user?.id);
  const displayRequests = isCsm && !isPmOrAdmin ? myRequests : requests;

  // Status counts
  const statusCounts = {
    intake: displayRequests.filter((r) => r.status === "intake").length,
    classified: displayRequests.filter((r) => r.status === "classified").length,
    in_triage: displayRequests.filter((r) => r.status === "in_triage").length,
    sprint_candidate: displayRequests.filter((r) => r.status === "sprint_candidate").length,
    in_sprint: displayRequests.filter((r) => r.status === "in_sprint").length,
    done: displayRequests.filter((r) => r.status === "done").length,
    deferred: displayRequests.filter((r) => r.status === "deferred").length,
  };

  // Category breakdown
  const categoryData = Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => ({
    name: cfg.label,
    value: displayRequests.filter((r) => r.category === key).length,
    color: cfg.color,
  }));

  // Sprint interrupt rate (PM/Admin only)
  const inSprintCount = requests.filter((r) => r.status === "in_sprint" || r.status === "done").length;
  const interruptRate = inSprintCount > 0 ? Math.round((interrupts.length / inSprintCount) * 100) : 0;

  const statusData = [
    { name: "Intake", value: statusCounts.intake },
    { name: "Classified", value: statusCounts.classified },
    { name: "Sprint Candidate", value: statusCounts.sprint_candidate },
    { name: "In Sprint", value: statusCounts.in_sprint },
    { name: "Done", value: statusCounts.done },
    { name: "Deferred", value: statusCounts.deferred },
  ];

  const COLORS = ["hsl(217 91% 60%)", "hsl(25 95% 53%)", "hsl(48 96% 53%)", "hsl(142 71% 45%)", "hsl(215 16% 47%)", "hsl(0 84% 60%)"];

  // CSM-only: simplified dashboard
  if (isCsm && !isPmOrAdmin) {
    const recentRequests = [...myRequests].sort((a, b) => new Date(b.date_received).getTime() - new Date(a.date_received).getTime()).slice(0, 10);

    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-foreground">My Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">My Requests</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold">{myRequests.length}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">In Progress</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold">{statusCounts.in_sprint}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Completed</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold">{statusCounts.done}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Awaiting Triage</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold">{statusCounts.intake + statusCounts.classified + statusCounts.in_triage}</p></CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Recent Requests</CardTitle></CardHeader>
          <CardContent>
            {recentRequests.length === 0 ? (
              <p className="text-muted-foreground text-sm">No requests yet. Submit your first request!</p>
            ) : (
              <div className="space-y-2">
                {recentRequests.map((r) => (
                  <div key={r.id} className="flex items-center justify-between border rounded-lg p-3">
                    <div>
                      <p className="font-medium text-sm">{r.title}</p>
                      <p className="text-xs text-muted-foreground">{r.source_customer} · {format(new Date(r.date_received), "MMM d, yyyy")}</p>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // PM / Admin: full dashboard
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Requests</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{requests.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Awaiting Triage</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{requests.filter((r) => r.status === "classified" || r.status === "in_triage").length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Sprint Interrupts</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{interrupts.length}</p>
            <p className={`text-xs ${interruptRate > 15 ? "text-destructive" : "text-muted-foreground"}`}>
              {interruptRate}% rate {interruptRate > 15 ? "(above 15% target)" : ""}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active Sprints</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{sprints.filter((s) => s.status === "active").length}</p></CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Requests by Category</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value">
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Request Status Distribution</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData.filter((d) => d.value > 0)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
