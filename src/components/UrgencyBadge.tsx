import { Badge } from "@/components/ui/badge";
import { URGENCY_CONFIG } from "@/lib/constants";
import type { Enums } from "@/integrations/supabase/types";

export function UrgencyBadge({ urgency }: { urgency: Enums<"request_urgency"> }) {
  const cfg = URGENCY_CONFIG[urgency];
  return (
    <Badge variant="secondary" style={{ borderLeft: `3px solid ${cfg.color}` }}>
      {cfg.label}
    </Badge>
  );
}
