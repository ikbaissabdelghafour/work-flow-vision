
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
  ServerCrash
} from "lucide-react";

const AppSidebar: React.FC = () => {
  const location = useLocation();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <Sidebar>
      <SidebarHeader className="flex items-center h-16 px-6">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-md bg-jira-blue flex items-center justify-center">
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
                    to="/"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md",
                      isActive("/") && "bg-sidebar-accent text-sidebar-accent-foreground"
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
                      "flex items-center gap-3 px-3 py-2 rounded-md",
                      isActive("/projects") && "bg-sidebar-accent text-sidebar-accent-foreground"
                    )}
                  >
                    <Folder className="h-5 w-5" />
                    <span>Projects</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    to="/tasks"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md",
                      isActive("/tasks") && "bg-sidebar-accent text-sidebar-accent-foreground"
                    )}
                  >
                    <ClipboardList className="h-5 w-5" />
                    <span>Tasks</span>
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
                          "flex items-center gap-3 px-3 py-2 rounded-md",
                          isActive("/teams") && "bg-sidebar-accent text-sidebar-accent-foreground"
                        )}
                      >
                        <Users className="h-5 w-5" />
                        <span>Teams</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link
                        to="/settings"
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-md",
                          isActive("/settings") && "bg-sidebar-accent text-sidebar-accent-foreground"
                        )}
                      >
                        <Settings className="h-5 w-5" />
                        <span>Settings</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link
                        to="/api-test"
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-md",
                          isActive("/api-test") && "bg-sidebar-accent text-sidebar-accent-foreground"
                        )}
                      >
                        <ServerCrash className="h-5 w-5" />
                        <span>API Test</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
