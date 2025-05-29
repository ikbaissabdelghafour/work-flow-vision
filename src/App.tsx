
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";
import AppLayout from "./components/Layout/AppLayout";
import RouteGuard from "./components/RouteGuard";

// Pages
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Tasks from "./pages/Tasks";
import Teams from "./pages/Teams";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import ApiTest from "./pages/ApiTest";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <AppProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppLayout>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<AuthPage />} />

                {/* Protected routes */}
                <Route element={<RouteGuard />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/projects/:projectId" element={<ProjectDetail />} />
                  <Route path="/tasks" element={<Tasks />} />
                </Route>

                {/* Admin only routes */}
                <Route element={<RouteGuard requireAdmin={true} />}>
                  <Route path="/teams" element={<Teams />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/api-test" element={<ApiTest />} />
                </Route>

                {/* 404 route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppLayout>
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
