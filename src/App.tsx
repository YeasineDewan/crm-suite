import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import OverviewDashboard from "./pages/OverviewDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import OrderDashboard from "./pages/OrderDashboard";
import InventoryDashboard from "./pages/InventoryDashboard";
import LoginPage from "./pages/LoginPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/" element={<ProtectedRoute><OverviewDashboard /></ProtectedRoute>} />
            <Route path="/employees" element={<ProtectedRoute requiredRoles={["admin", "manager"]}><EmployeeDashboard /></ProtectedRoute>} />
            <Route path="/clients" element={<ProtectedRoute><ClientDashboard /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><OrderDashboard /></ProtectedRoute>} />
            <Route path="/inventory" element={<ProtectedRoute requiredRoles={["admin", "manager"]}><InventoryDashboard /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
