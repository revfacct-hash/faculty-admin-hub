import { 
  LayoutDashboard, 
  GraduationCap, 
  Users, 
  BookOpen, 
  Calendar, 
  Briefcase, 
  Award, 
  Video, 
  Newspaper, 
  Settings, 
  UserCog,
  LogOut,
  ChevronDown
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";

const contentItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Carreras", url: "/admin/carreras", icon: GraduationCap },
  { title: "Docentes", url: "/admin/docentes", icon: Users },
  { title: "Plan de Estudios", url: "/admin/plan-estudios", icon: BookOpen },
  { title: "Eventos", url: "/admin/eventos", icon: Calendar },
  { title: "Ámbitos Laborales", url: "/admin/ambitos-laborales", icon: Briefcase },
  { title: "Perfil Egresado", url: "/admin/perfil-egresado", icon: Award },
  { title: "Videos", url: "/admin/videos", icon: Video },
  { title: "Noticias", url: "/admin/noticias", icon: Newspaper },
];

const configItems = [
  { title: "Configuración", url: "/admin/configuracion", icon: Settings },
  { title: "Administradores", url: "/admin/administradores", icon: UserCog },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const [contentOpen, setContentOpen] = useState(true);
  const [configOpen, setConfigOpen] = useState(true);

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    // TODO: Implement logout with Supabase
    console.log("Logout clicked");
  };

  return (
    <Sidebar className="border-r border-sidebar-border">
      <div className="flex h-16 items-center justify-center border-b border-sidebar-border px-4">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">UEB</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-sidebar-foreground">Panel Admin</span>
              <span className="text-xs text-muted-foreground">FCyT</span>
            </div>
          </div>
        ) : (
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xs">UEB</span>
          </div>
        )}
      </div>

      <SidebarContent className="px-2 py-4">
        <Collapsible open={contentOpen} onOpenChange={setContentOpen}>
          <SidebarGroup>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="flex items-center justify-between cursor-pointer hover:bg-sidebar-accent rounded-md px-2 py-1.5">
                {!collapsed && <span>Contenido</span>}
                {!collapsed && (
                  <ChevronDown 
                    className={cn(
                      "h-4 w-4 transition-transform",
                      contentOpen && "rotate-180"
                    )} 
                  />
                )}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {contentItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                            isActive(item.url) && "bg-sidebar-accent text-sidebar-primary font-medium"
                          )}
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        <Collapsible open={configOpen} onOpenChange={setConfigOpen}>
          <SidebarGroup className="mt-4">
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="flex items-center justify-between cursor-pointer hover:bg-sidebar-accent rounded-md px-2 py-1.5">
                {!collapsed && <span>Sistema</span>}
                {!collapsed && (
                  <ChevronDown 
                    className={cn(
                      "h-4 w-4 transition-transform",
                      configOpen && "rotate-180"
                    )} 
                  />
                )}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {configItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                            isActive(item.url) && "bg-sidebar-accent text-sidebar-primary font-medium"
                          )}
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10",
            collapsed && "justify-center px-0"
          )}
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Cerrar Sesión</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
