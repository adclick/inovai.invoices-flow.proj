
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import ClientsList from "./pages/clients/ClientsList";
import CreateClient from "./pages/clients/CreateClient";
import EditClient from "./pages/clients/EditClient";
import CampaignsList from "./pages/campaigns/CampaignsList";
import CreateCampaign from "./pages/campaigns/CreateCampaign";
import EditCampaign from "./pages/campaigns/EditCampaign";
// import ManagersList from "./pages/managers/ManagersList"; // Commenting out the old version
import ManagersListWithModal from "./pages/managers/ManagersListWithModal"; // Using our new version instead
import CreateManager from "./pages/managers/CreateManager";
import EditManager from "./pages/managers/EditManager";
// import ProvidersList from "./pages/providers/ProvidersList"; // Commenting out the old version
import ProvidersListWithModal from "./pages/providers/ProvidersListWithModal"; // Using our new version instead
import CreateProvider from "./pages/providers/CreateProvider";
import EditProvider from "./pages/providers/EditProvider";
import JobsRouter from "./pages/jobs/JobsRouter";
import CreateJob from "./pages/jobs/CreateJob";
import EditJob from "./pages/jobs/EditJob";
import Settings from "./pages/settings/Settings";
import Profile from "./pages/profile/Profile";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PublicUpload from "./pages/PublicUpload";
import PaymentConfirm from "./pages/PaymentConfirm";
import About from "./pages/About";

const queryClient = new QueryClient();

const App = () => (
	<QueryClientProvider client={queryClient}>
		<ThemeProvider>
			<AuthProvider>
				<LanguageProvider>
					<TooltipProvider>
						<Toaster />
						<Sonner />
						<BrowserRouter>
							<Routes>
								<Route path="/" element={<Index />} />
								<Route path="/about" element={<About />} />
								<Route path="/upload/:jobId/:token" element={<PublicUpload />} />
								<Route path="/payments/confirm/:jobId/:token" element={<PaymentConfirm />} />

								<Route element={<ProtectedRoute />}>
									<Route path="/dashboard" element={<Dashboard />} />
									<Route path="/clients" element={<ClientsList />} />
									<Route path="/clients/create" element={<CreateClient />} />
									<Route path="/clients/edit/:id" element={<EditClient />} />
									<Route path="/campaigns" element={<CampaignsList />} />
									<Route path="/campaigns/create" element={<CreateCampaign />} />
									<Route path="/campaigns/edit/:id" element={<EditCampaign />} />
									<Route path="/managers" element={<ManagersListWithModal />} />
									<Route path="/managers/create" element={<CreateManager />} />
									<Route path="/managers/edit/:id" element={<EditManager />} />
									<Route path="/providers" element={<ProvidersListWithModal />} />
									<Route path="/providers/create" element={<CreateProvider />} />
									<Route path="/providers/edit/:id" element={<EditProvider />} />
									<Route path="/jobs/*" element={<JobsRouter />} />
									<Route path="/jobs/create" element={<CreateJob />} />
									<Route path="/jobs/edit/:id" element={<EditJob />} />
									<Route path="/settings" element={<Settings />} />
									<Route path="/profile" element={<Profile />} />
									{/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
									<Route path="*" element={<NotFound />} />
								</Route>
							</Routes>
						</BrowserRouter>
					</TooltipProvider>
				</LanguageProvider>
			</AuthProvider>
		</ThemeProvider>
	</QueryClientProvider>
);

export default App;
