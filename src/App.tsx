import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import StaffLayout from "./pages/StaffLayout";
import ManagerLayout from "./pages/ManagerLayout";
import ITAdminLayout from "./pages/ITAdminLayout";
import StaffDashboard from "./components/staff/StaffDashboard";
import StaffRequests from "./components/staff/StaffRequests";
import AppCatalog from "./components/staff/AppCatalog";
import RequestPage from "./pages/RequestPage";
import ManagerDashboard from "./components/manager/ManagerDashboard";
import ManagerRequests from "./components/manager/ManagerRequests";
import ManagerCampaigns from "./components/manager/ManagerCampaigns";
import ManagerAppList from "./components/manager/ManagerAppList";
import ITAdminDashboard from "./components/itadmin/ITAdminDashboard";
import ITAdminRequests from "./components/itadmin/ITAdminRequests";
import ITAdminCampaigns from "./components/itadmin/ITAdminCampaigns";
import ITAdminAppList from "./components/itadmin/ITAdminAppList";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          
          {/* Staff Routes */}
          <Route path="/staff" element={<ProtectedRoute role="staff"><StaffLayout /></ProtectedRoute>}>
            <Route index element={<StaffDashboard />} />
            <Route path="myrequest" element={<StaffRequests />} />
            <Route path="catalog" element={<AppCatalog />} />
            <Route path="request" element={<RequestPage />} />
          </Route>
          
          {/* Manager Routes */}
          <Route path="/manager" element={<ProtectedRoute role="manager"><ManagerLayout /></ProtectedRoute>}>
            <Route index element={<ManagerDashboard />} />
            <Route path="requests" element={<ManagerRequests />} />
            <Route path="campaigns" element={<ManagerCampaigns />} />
            <Route path="applications" element={<ManagerAppList />} />
          </Route>
          
          {/* IT Admin Routes */}
          <Route path="/itadmin" element={<ProtectedRoute role="itadmin"><ITAdminLayout /></ProtectedRoute>}>
            <Route index element={<ITAdminDashboard />} />
            <Route path="requests" element={<ITAdminRequests />} />
            <Route path="campaigns" element={<ITAdminCampaigns />} />
            <Route path="applications" element={<ITAdminAppList />} />
          </Route>
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
