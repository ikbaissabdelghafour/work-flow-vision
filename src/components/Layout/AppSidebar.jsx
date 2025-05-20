
import React from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { 
  LayoutDashboard, 
  ClipboardList, 
  Users, 
  Folder, 
  Settings,
  HelpCircle,
  MessageSquare,
  Bell,
  LogOut
} from "lucide-react";

const AppSidebar = () => {
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const isAdmin = currentUser?.role === "admin";
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  return (
    <Sidebar>
      <SidebarHeader className="flex items-center h-16 px-6">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-blue flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-lg">WV</span>
          </div>
          <span className="font-semibold text-lg text-sidebar-foreground">WorkFlow Vision</span>
        </Link>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    to="/dashboard"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium",
                      isActive("/dashboard") 
                        ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                        : "text-sidebar-foreground/90 hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    to="/projects"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium",
                      isActive("/projects") 
                        ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                        : "text-sidebar-foreground/90 hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <Folder className="h-5 w-5" />
                    <span>Projets</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    to="/tasks"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium",
                      isActive("/tasks") 
                        ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                        : "text-sidebar-foreground/90 hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <ClipboardList className="h-5 w-5" />
                    <span>Tâches</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {isAdmin && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link
                        to="/teams"
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium",
                          isActive("/teams") 
                            ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                            : "text-sidebar-foreground/90 hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <Users className="h-5 w-5" />
                        <span>Équipes</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link
                        to="/settings"
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium",
                          isActive("/settings") 
                            ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                            : "text-sidebar-foreground/90 hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <Settings className="h-5 w-5" />
                        <span>Paramètres</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup className="mt-6">
          <SidebarGroupLabel>Support</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    to="#"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sidebar-foreground/90 hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground"
                  >
                    <HelpCircle className="h-5 w-5" />
                    <span>Aide</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    to="#"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sidebar-foreground/90 hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground"
                  >
                    <MessageSquare className="h-5 w-5" />
                    <span>Contact</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <div className="mt-auto pt-6 px-3">
          <button 
            onClick={logout}
            className="flex items-center w-full gap-3 px-3 py-2.5 rounded-lg font-medium text-red-300 hover:bg-red-500/20 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
