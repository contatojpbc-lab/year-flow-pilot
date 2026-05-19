import { 
  LayoutDashboard, 
  Target, 
  Calendar, 
  FileText, 
  Wallet, 
  BookOpen, 
  Bell,
  Settings,
  CheckSquare,
  Sparkles
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useTranslation } from "react-i18next";

export function AppSidebar() {
  const { state } = useSidebar();
  const { t } = useTranslation();
  const isCollapsed = state === "collapsed";

  const mainNavItems = [
    { titleKey: "dashboard",        url: "/",        icon: LayoutDashboard },
    { titleKey: "goals",            url: "/goals",   icon: Target },
    { titleKey: "dailyRoutine",     url: "/routine", icon: Calendar },
    { titleKey: "weeklyReview",     url: "/review",  icon: FileText },
    { titleKey: "minimumViableDay", url: "/mvd",     icon: CheckSquare },
  ];

  const lifeItems = [
    { titleKey: "finances",  url: "/finances",  icon: Wallet },
    { titleKey: "journal",   url: "/journal",   icon: BookOpen },
    { titleKey: "reminders", url: "/reminders", icon: Bell },
  ];

  const settingsItems = [
    { titleKey: "settings", url: "/settings", icon: Settings },
  ];

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">Life OS</span>
              <span className="text-xs text-muted-foreground">2026</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70">
            {t("sidebarCore")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.titleKey}>
                  <SidebarMenuButton asChild tooltip={t(item.titleKey)}>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/"} 
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      activeClassName="bg-sidebar-accent text-primary font-medium"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!isCollapsed && <span>{t(item.titleKey)}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70">
            {t("sidebarLife")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {lifeItems.map((item) => (
                <SidebarMenuItem key={item.titleKey}>
                  <SidebarMenuButton asChild tooltip={t(item.titleKey)}>
                    <NavLink 
                      to={item.url} 
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      activeClassName="bg-sidebar-accent text-primary font-medium"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!isCollapsed && <span>{t(item.titleKey)}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarMenu>
          {settingsItems.map((item) => (
            <SidebarMenuItem key={item.titleKey}>
              <SidebarMenuButton asChild tooltip={t(item.titleKey)}>
                <NavLink 
                  to={item.url} 
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  activeClassName="bg-sidebar-accent text-primary font-medium"
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!isCollapsed && <span>{t(item.titleKey)}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
