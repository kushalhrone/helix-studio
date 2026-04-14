import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import Auth from "@/pages/Auth";
import ResetPassword from "@/pages/ResetPassword";
import Dashboard from "@/pages/Dashboard";
import SubmitRequest from "@/pages/SubmitRequest";
import IntakeQueue from "@/pages/IntakeQueue";
import Classification from "@/pages/Classification";
import TriageQueue from "@/pages/TriageQueue";
import SprintBoard from "@/pages/SprintBoard";
import InterruptLog from "@/pages/InterruptLog";
import SettingsPage from "@/pages/Settings";
import UserManagement from "@/pages/UserManagement";
import NotFound from "@/pages/NotFound";
import type { Enums } from "@/integrations/supabase/types";

const queryClient = new QueryClient();

type AppRole = Enums<"app_role">;

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: AppRole[] }) {
  const { user, loading, roles } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (allowedRoles && !roles.some((r) => allowedRoles.includes(r))) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AuthGate() {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>;
  if (user) return <Navigate to="/" replace />;
  return <Auth />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<AuthGate />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/submit" element={<ProtectedRoute allowedRoles={["admin", "submitter"]}><SubmitRequest /></ProtectedRoute>} />
              <Route path="/intake" element={<IntakeQueue />} />
              <Route path="/classify" element={<ProtectedRoute allowedRoles={["admin", "pm"]}><Classification /></ProtectedRoute>} />
              <Route path="/triage" element={<ProtectedRoute allowedRoles={["admin", "pm"]}><TriageQueue /></ProtectedRoute>} />
              <Route path="/sprints" element={<SprintBoard />} />
              <Route path="/interrupts" element={<InterruptLog />} />
              <Route path="/users" element={<ProtectedRoute allowedRoles={["admin"]}><UserManagement /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute allowedRoles={["admin"]}><SettingsPage /></ProtectedRoute>} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
