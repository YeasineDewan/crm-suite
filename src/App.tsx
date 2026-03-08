import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { localStoragePersister } from "@/lib/queryPersister";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { initPushNotifications } from "@/services/pushNotifications";
import { OfflineIndicator, PWAInstallBanner } from "@/components/OfflineIndicator";
import { useOfflineMutationSync } from "@/hooks/useOfflineMutationSync";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import OverviewDashboard from "./pages/OverviewDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import OrderDashboard from "./pages/OrderDashboard";
import InventoryDashboard from "./pages/InventoryDashboard";
import AttendancePage from "./pages/AttendancePage";
import CalendarPage from "./pages/CalendarPage";
import SalesPipelinePage from "./pages/SalesPipelinePage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import InstallPage from "./pages/InstallPage";
import ClientDetailPage from "./pages/ClientDetailPage";
import EmployeeDetailPage from "./pages/EmployeeDetailPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24,
      staleTime: 1000 * 60 * 5,
      retry: (failureCount) => (navigator.onLine ? failureCount < 3 : false),
      networkMode: "offlineFirst",
    },
    mutations: {
      networkMode: "offlineFirst",
    },
  },
});

function OnlineSyncManager() {
  useOfflineMutationSync();
  useRealtimeSync();
  return null;
}

const App = () => {
  useEffect(() => {
    initPushNotifications();
  }, []);

  return (
  <PersistQueryClientProvider client={queryClient} persistOptions={{ persister: localStoragePersister, maxAge: 1000 * 60 * 60 * 24 }}>
    <OnlineSyncManager />
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <OfflineIndicator />
      <PWAInstallBanner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<OverviewDashboard />} />
          <Route path="/employees" element={<EmployeeDashboard />} />
          <Route path="/employees/:id" element={<EmployeeDetailPage />} />
          <Route path="/clients" element={<ClientDashboard />} />
          <Route path="/clients/:id" element={<ClientDetailPage />} />
          <Route path="/orders" element={<OrderDashboard />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/inventory" element={<InventoryDashboard />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/sales" element={<SalesPipelinePage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/install" element={<InstallPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </PersistQueryClientProvider>
  );
};

export default App;
