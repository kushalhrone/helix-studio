import { Badge } from "@/components/ui/badge";
import { CATEGORY_CONFIG } from "@/lib/constants";
import type { Enums } from "@/integrations/supabase/types";

export function CategoryBadge({ category }: { category: Enums<"request_category"> | null }) {
  if (!category) return <Badge variant="outline">Unclassified</Badge>;
  const cfg = CATEGORY_CONFIG[category];
  return (
    <Badge variant="outline" className="gap-1">
      <span>{cfg.emoji}</span>
      <span>{cfg.label}</span>
    </Badge>
  );
}
