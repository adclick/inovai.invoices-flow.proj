import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import ClientsList from "./pages/clients/ClientsList";
import CreateClient from "./pages/clients/CreateClient";
import EditClient from "./pages/clients/EditClient";
import CampaignsList from "./pages/campaigns/CampaignsList";
import CreateCampaign from "./pages/campaigns/CreateCampaign";
import EditCampaign from "./pages/campaigns/EditCampaign";
import ManagersList from "./pages/managers/ManagersList";
import CreateManager from "./pages/managers/CreateManager";
import EditManager from "./pages/managers/EditManager";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/clients" element={<ClientsList />} />
            <Route path="/dashboard/clients/create" element={<CreateClient />} />
            <Route path="/dashboard/clients/edit/:id" element={<EditClient />} />
            <Route path="/dashboard/campaigns" element={<CampaignsList />} />
            <Route path="/dashboard/campaigns/create" element={<CreateCampaign />} />
            <Route path="/dashboard/campaigns/edit/:id" element={<EditCampaign />} />
            <Route path="/dashboard/managers" element={<ManagersList />} />
            <Route path="/dashboard/managers/create" element={<CreateManager />} />
            <Route path="/dashboard/managers/edit/:id" element={<EditManager />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
