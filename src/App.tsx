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
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, requirePm, requireAdmin }: { children: React.ReactNode; requirePm?: boolean; requireAdmin?: boolean }) {
  const { user, loading, isPmOrAdmin, isAdmin } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/" replace />;
  if (requirePm && !isPmOrAdmin) return <Navigate to="/" replace />;
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
              <Route path="/submit" element={<SubmitRequest />} />
              <Route path="/intake" element={<IntakeQueue />} />
              <Route path="/classify" element={<ProtectedRoute requirePm><Classification /></ProtectedRoute>} />
              <Route path="/triage" element={<ProtectedRoute requirePm><TriageQueue /></ProtectedRoute>} />
              <Route path="/sprints" element={<SprintBoard />} />
              <Route path="/interrupts" element={<InterruptLog />} />
              <Route path="/settings" element={<ProtectedRoute requireAdmin><SettingsPage /></ProtectedRoute>} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
