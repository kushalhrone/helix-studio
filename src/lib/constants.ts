import type { Enums } from "@/integrations/supabase/types";

export const CATEGORY_CONFIG: Record<Enums<"request_category">, { label: string; emoji: string; color: string }> = {
  production_bug: { label: "Production Bug", emoji: "🔴", color: "hsl(0 84% 60%)" },
  client_commitment: { label: "Client Commitment", emoji: "🟠", color: "hsl(25 95% 53%)" },
  usability_issue: { label: "Usability Issue", emoji: "🟡", color: "hsl(48 96% 53%)" },
  new_feature: { label: "New Feature", emoji: "🔵", color: "hsl(217 91% 60%)" },
  tech_enabler: { label: "Tech Enabler", emoji: "⚙️", color: "hsl(215 16% 47%)" },
};

export const URGENCY_CONFIG: Record<Enums<"request_urgency">, { label: string; color: string }> = {
  critical: { label: "Critical", color: "hsl(0 84% 60%)" },
  high: { label: "High", color: "hsl(25 95% 53%)" },
  medium: { label: "Medium", color: "hsl(48 96% 53%)" },
  low: { label: "Low", color: "hsl(215 16% 47%)" },
};

export const STATUS_CONFIG: Record<Enums<"request_status">, { label: string }> = {
  intake: { label: "Intake" },
  classified: { label: "Classified" },
  in_triage: { label: "In Triage" },
  sprint_candidate: { label: "Sprint Candidate" },
  in_sprint: { label: "In Sprint" },
  done: { label: "Done" },
  deferred: { label: "Deferred" },
};

export const ROLE_DISPLAY: Record<string, string> = {
  admin: "Admin",
  pm: "Product",
  submitter: "CSM Team",
};

export const VISIBLE_ROLES = ["admin", "pm", "submitter"] as const;
