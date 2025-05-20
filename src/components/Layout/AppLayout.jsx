
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

const AppLayout = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // If user is not on an auth page, show a full app layout with sidebar and header
  if (isAuthenticated && !isLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            <AppHeader />
            <main className="flex-1 bg-slate-50 p-6 overflow-auto">
              <div className="container max-w-7xl mx-auto">
                {children}
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }
  
  // Otherwise just render the content (login page, etc)
  return <>{children}</>;
};

export default AppLayout;
