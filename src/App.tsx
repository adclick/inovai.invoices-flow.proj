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
import CampaignsList from "./pages/campaigns/CampaignsList"; 	
import ManagersList from "./pages/managers/ManagersList"; 
import ProvidersList from "./pages/providers/ProvidersList"; 
import JobsList from "./pages/jobs/JobsList"; 
import JobsTypesList from "./pages/jobs_types/JobsTypesList";
import CompaniesList from "./pages/companies/CompaniesList";
import Settings from "./pages/settings/Settings";
import Profile from "./pages/profile/Profile";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import About from "./pages/About";
import { SidebarProvider } from "./contexts/SidebarContext";

const queryClient = new QueryClient();

const App = () => (
	<QueryClientProvider client={queryClient}>
		<ThemeProvider>
			<AuthProvider>
				<SidebarProvider>
					<LanguageProvider>
						<TooltipProvider>
							<Toaster />
							<Sonner />
							<BrowserRouter>
								<Routes>
									<Route path="/" element={<Index />} />
									<Route path="/about" element={<About />} />

									<Route element={<ProtectedRoute />}>
										<Route path="/dashboard" element={<Dashboard />} />
										<Route path="/clients" element={<ClientsList />} />
										<Route path="/campaigns" element={<CampaignsList />} />
										<Route path="/managers" element={<ManagersList />} />
										<Route path="/providers" element={<ProvidersList />} />
										<Route path="/jobs/" element={<JobsList />} />
										<Route path="/jobs-types" element={<JobsTypesList />} />
										<Route path="/companies" element={<CompaniesList />} />
										<Route path="/settings" element={<Settings />} />
										<Route path="/profile" element={<Profile />} />
										<Route path="*" element={<NotFound />} />
									</Route>
								</Routes>
							</BrowserRouter>
						</TooltipProvider>
					</LanguageProvider>
				</SidebarProvider>
			</AuthProvider>
		</ThemeProvider>
	</QueryClientProvider>
);

export default App;
