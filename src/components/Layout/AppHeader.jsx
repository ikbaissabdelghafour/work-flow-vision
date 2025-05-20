
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Search, Settings, LogOut, User, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const AppHeader = () => {
  const { currentUser, logout } = useAuth();
  
  // Get user initials for the avatar fallback
  const getInitials = () => {
    if (!currentUser?.name) return "U";
    return currentUser.name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <header className="border-b border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors" />
          <div className="relative hidden md:flex items-center">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="pl-10 py-2 pr-4 rounded-xl border border-gray-200 w-64 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5 text-gray-600" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <HelpCircle className="h-5 w-5 text-gray-600" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Settings className="h-5 w-5 text-gray-600" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full hover:bg-gray-100 p-1 ml-2 transition-colors">
                <Avatar className="h-9 w-9 ring-2 ring-blue-500/20">
                  <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
                  <AvatarFallback className="bg-gradient-blue text-white">{getInitials()}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-60 p-2" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{currentUser?.name}</p>
                  <p className="text-xs text-gray-500">{currentUser?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem className="rounded-lg cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profil</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-lg cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Paramètres</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-600 rounded-lg cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Déconnexion</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
