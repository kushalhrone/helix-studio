import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CATEGORY_CONFIG, URGENCY_CONFIG } from "@/lib/constants";
import type { Enums } from "@/integrations/supabase/types";

export default function SubmitRequest() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    source_customer: "",
    urgency: "medium" as Enums<"request_urgency">,
    impact: "",
    workaround: "",
    size_estimate: "",
    request_type: "" as Enums<"request_category"> | "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const { error } = await supabase.from("requests").insert({
      title: form.title,
      description: form.description,
      source_customer: form.source_customer,
      urgency: form.urgency,
      impact: form.impact,
      workaround: form.workaround || null,
      size_estimate: form.size_estimate || null,
      request_type: form.request_type || null,
      submitter_id: user.id,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Request submitted successfully" });
      navigate("/intake");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Submit New Request</CardTitle>
          <CardDescription>Fill out the form to submit a new client request for triage.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required maxLength={200} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={4} maxLength={2000} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Source / Customer *</Label>
              <Input id="source" value={form.source_customer} onChange={(e) => setForm({ ...form, source_customer: e.target.value })} required maxLength={200} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Urgency *</Label>
                <Select value={form.urgency} onValueChange={(v) => setForm({ ...form, urgency: v as Enums<"request_urgency"> })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(URGENCY_CONFIG).map(([key, cfg]) => (
                      <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Request Type (optional)</Label>
                <Select value={form.request_type} onValueChange={(v) => setForm({ ...form, request_type: v as Enums<"request_category"> })}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                      <SelectItem key={key} value={key}>{cfg.emoji} {cfg.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="impact">Impact *</Label>
              <Textarea id="impact" value={form.impact} onChange={(e) => setForm({ ...form, impact: e.target.value })} required rows={2} maxLength={1000} placeholder="What is the business impact if this is not addressed?" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="workaround">Workaround (optional)</Label>
              <Textarea id="workaround" value={form.workaround} onChange={(e) => setForm({ ...form, workaround: e.target.value })} rows={2} maxLength={1000} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Size Estimate (optional)</Label>
              <Input id="size" value={form.size_estimate} onChange={(e) => setForm({ ...form, size_estimate: e.target.value })} placeholder="e.g., S/M/L or story points" maxLength={50} />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : "Submit Request"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
