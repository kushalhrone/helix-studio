import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { CATEGORY_CONFIG } from "@/lib/constants";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function Dashboard() {
  const { isPmOrAdmin } = useAuth();

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
  });

  const { data: sprints = [] } = useQuery({
    queryKey: ["sprints-dashboard"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sprints").select("*");
      if (error) throw error;
      return data;
    },
  });

  // Category breakdown
  const categoryData = Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => ({
    name: cfg.label,
    value: requests.filter((r) => r.category === key).length,
    color: cfg.color,
  }));

  // Sprint interrupt rate
  const inSprintCount = requests.filter((r) => r.status === "in_sprint" || r.status === "done").length;
  const interruptRate = inSprintCount > 0 ? Math.round((interrupts.length / inSprintCount) * 100) : 0;

  // Status breakdown
  const statusData = [
    { name: "Intake", value: requests.filter((r) => r.status === "intake").length },
    { name: "Classified", value: requests.filter((r) => r.status === "classified").length },
    { name: "Sprint Candidate", value: requests.filter((r) => r.status === "sprint_candidate").length },
    { name: "In Sprint", value: requests.filter((r) => r.status === "in_sprint").length },
    { name: "Done", value: requests.filter((r) => r.status === "done").length },
    { name: "Deferred", value: requests.filter((r) => r.status === "deferred").length },
  ];

  const COLORS = ["hsl(217 91% 60%)", "hsl(25 95% 53%)", "hsl(48 96% 53%)", "hsl(142 71% 45%)", "hsl(215 16% 47%)", "hsl(0 84% 60%)"];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>

      {/* Summary cards */}
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

      {/* Charts */}
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
