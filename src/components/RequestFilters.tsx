import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CATEGORY_CONFIG, URGENCY_CONFIG, STATUS_CONFIG } from "@/lib/constants";

export interface FilterValues {
  status: string;
  urgency: string;
  category: string;
  customer: string;
}

interface RequestFiltersProps {
  filters: FilterValues;
  onChange: (filters: FilterValues) => void;
  customers?: string[];
  showStatus?: boolean;
  showUrgency?: boolean;
  showCategory?: boolean;
  showCustomer?: boolean;
}

export const defaultFilters: FilterValues = {
  status: "all",
  urgency: "all",
  category: "all",
  customer: "",
};

export function RequestFilters({
  filters,
  onChange,
  customers = [],
  showStatus = true,
  showUrgency = true,
  showCategory = true,
  showCustomer = true,
}: RequestFiltersProps) {
  const update = (key: keyof FilterValues, value: string) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="flex gap-3 flex-wrap">
      {showStatus && (
        <Select value={filters.status} onValueChange={(v) => update("status", v)}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {showUrgency && (
        <Select value={filters.urgency} onValueChange={(v) => update("urgency", v)}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Urgency" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Urgencies</SelectItem>
            {Object.entries(URGENCY_CONFIG).map(([key, cfg]) => (
              <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {showCategory && (
        <Select value={filters.category} onValueChange={(v) => update("category", v)}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
              <SelectItem key={key} value={key}>{cfg.emoji} {cfg.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {showCustomer && (
        <Select value={filters.customer || "all"} onValueChange={(v) => update("customer", v === "all" ? "" : v)}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Customer" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Customers</SelectItem>
            {customers.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

export function applyFilters<T extends { status?: string | null; urgency?: string | null; category?: string | null; source_customer?: string | null }>(
  items: T[],
  filters: FilterValues
): T[] {
  return items.filter((item) => {
    if (filters.status !== "all" && item.status !== filters.status) return false;
    if (filters.urgency !== "all" && item.urgency !== filters.urgency) return false;
    if (filters.category !== "all" && item.category !== filters.category) return false;
    if (filters.customer && item.source_customer !== filters.customer) return false;
    return true;
  });
}
