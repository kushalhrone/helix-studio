import { Badge } from "@/components/ui/badge";
import { STATUS_CONFIG } from "@/lib/constants";
import type { Enums } from "@/integrations/supabase/types";

export function StatusBadge({ status }: { status: Enums<"request_status"> }) {
  return <Badge variant="outline">{STATUS_CONFIG[status].label}</Badge>;
}
