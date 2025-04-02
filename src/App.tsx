
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
import ProvidersList from "./pages/providers/ProvidersList";
import CreateProvider from "./pages/providers/CreateProvider";
import EditProvider from "./pages/providers/EditProvider";
import JobsList from "./pages/jobs/JobsList";
import CreateJob from "./pages/jobs/CreateJob";
import EditJob from "./pages/jobs/EditJob";
import ProtectedRoute from "./components/auth/ProtectedRoute";

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

						<Route element={<ProtectedRoute />}>
							<Route path="/dashboard" element={<Dashboard />} />
							<Route path="/clients" element={<ClientsList />} />
							<Route path="/clients/create" element={<CreateClient />} />
							<Route path="/clients/edit/:id" element={<EditClient />} />
							<Route path="/campaigns" element={<CampaignsList />} />
							<Route path="/campaigns/create" element={<CreateCampaign />} />
							<Route path="/campaigns/edit/:id" element={<EditCampaign />} />
							<Route path="/managers" element={<ManagersList />} />
							<Route path="/managers/create" element={<CreateManager />} />
							<Route path="/managers/edit/:id" element={<EditManager />} />
							<Route path="/providers" element={<ProvidersList />} />
							<Route path="/providers/create" element={<CreateProvider />} />
							<Route path="/providers/edit/:id" element={<EditProvider />} />
							<Route path="/jobs" element={<JobsList />} />
							<Route path="/jobs/create" element={<CreateJob />} />
							<Route path="/jobs/edit/:id" element={<EditJob />} />
							{/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
							<Route path="*" element={<NotFound />} />
						</Route>
					</Routes>
				</BrowserRouter>
			</TooltipProvider>
		</AuthProvider>
	</QueryClientProvider>
);

export default App;
