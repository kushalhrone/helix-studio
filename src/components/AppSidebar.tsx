import {
  LayoutDashboard, PlusCircle, Inbox, Tags, Filter, Columns3, AlertTriangle, Settings, LogOut
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_DISPLAY } from "@/lib/constants";
import type { Enums } from "@/integrations/supabase/types";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

type AppRole = Enums<"app_role">;

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: AppRole[]; // which roles can see this item
}

const allItems: { group: string; items: NavItem[] }[] = [
  {
    group: "Main",
    items: [
      { title: "Dashboard", url: "/", icon: LayoutDashboard, roles: ["admin", "pm", "submitter"] },
      { title: "Submit Request", url: "/submit", icon: PlusCircle, roles: ["admin", "submitter"] },
      { title: "Intake Queue", url: "/intake", icon: Inbox, roles: ["admin", "pm", "submitter"] },
    ],
  },
  {
    group: "Triage & Sprints",
    items: [
      { title: "Classification", url: "/classify", icon: Tags, roles: ["admin", "pm"] },
      { title: "Triage Queue", url: "/triage", icon: Filter, roles: ["admin", "pm"] },
      { title: "Sprint Board", url: "/sprints", icon: Columns3, roles: ["admin", "pm", "submitter"] },
      { title: "Interrupt Log", url: "/interrupts", icon: AlertTriangle, roles: ["admin", "pm", "submitter"] },
    ],
  },
  {
    group: "Admin",
    items: [
      { title: "Settings", url: "/settings", icon: Settings, roles: ["admin"] },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { roles, displayName, signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;
  const hasAccess = (allowedRoles: AppRole[]) => roles.some((r) => allowedRoles.includes(r));

  const roleLabel = roles.map((r) => ROLE_DISPLAY[r] ?? r).filter(Boolean).join(", ");

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {!collapsed && (
          <div className="px-4 py-4">
            <h1 className="text-lg font-semibold text-foreground">Triage</h1>
            <p className="text-xs text-muted-foreground truncate">{displayName}</p>
            {roleLabel && <p className="text-xs text-muted-foreground/70 truncate">{roleLabel}</p>}
          </div>
        )}

        {allItems.map(({ group, items }) => {
          const visible = items.filter((item) => hasAccess(item.roles));
          if (visible.length === 0) return null;
          return (
            <SidebarGroup key={group}>
              <SidebarGroupLabel>{group}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {visible.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive(item.url)}>
                        <NavLink to={item.url} end className="hover:bg-muted/50" activeClassName="bg-muted text-primary font-medium">
                          <item.icon className="mr-2 h-4 w-4" />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter>
        <Button variant="ghost" size="sm" onClick={signOut} className="w-full justify-start">
          <LogOut className="mr-2 h-4 w-4" />
          {!collapsed && "Sign Out"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
