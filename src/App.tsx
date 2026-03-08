import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { localStoragePersister } from "@/lib/queryPersister";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { initPushNotifications } from "@/services/pushNotifications";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import OverviewDashboard from "./pages/OverviewDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import OrderDashboard from "./pages/OrderDashboard";
import InventoryDashboard from "./pages/InventoryDashboard";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount) => (navigator.onLine ? failureCount < 3 : false),
      networkMode: "offlineFirst",
    },
    mutations: {
      networkMode: "offlineFirst",
    },
  },
});

const App = () => {
  useEffect(() => {
    initPushNotifications();
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<OverviewDashboard />} />
          <Route path="/employees" element={<EmployeeDashboard />} />
          <Route path="/clients" element={<ClientDashboard />} />
          <Route path="/orders" element={<OrderDashboard />} />
          <Route path="/inventory" element={<InventoryDashboard />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
