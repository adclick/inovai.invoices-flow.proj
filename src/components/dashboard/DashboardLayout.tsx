
import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { useTranslation } from "react-i18next";
import { useCompaniesData } from "@/hooks/useCompaniesData";
import {
	LayoutDashboard, LogOut, UserCog, Sidebar as SidebarIcon, List, Handshake, Megaphone, Wrench, LucideIcon, Menu, Settings, User,
	Layers,
	Building
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ThemeToggle from "@/components/theme/ThemeToggle";
import LanguageSelector from "@/components/language/LanguageSelector";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface DashboardLayoutProps {
	children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
	const { user, signOut, checkHasRole } = useAuth();
	const { isSidebarPreferenceOpen, toggleSidebarPreference } = useSidebar();
	const [isMobile, setIsMobile] = useState(false);
	const [actualSidebarOpen, setActualSidebarOpen] = useState(isSidebarPreferenceOpen);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const location = useLocation();
	const { t } = useTranslation();
	const navigate = useNavigate();

	// Fetch companies data for the dynamic jobs menu - make this query stable
	const { data: companies, isLoading: isLoadingCompanies } = useCompaniesData();

	useEffect(() => {
		const checkIfMobile = () => {
			const mobile = window.innerWidth < 1024;
			setIsMobile(mobile);
			if (mobile) {
				setActualSidebarOpen(false);
			} else {
				setActualSidebarOpen(isSidebarPreferenceOpen);
			}
		};

		checkIfMobile();
		window.addEventListener('resize', checkIfMobile);

		return () => {
			window.removeEventListener('resize', checkIfMobile);
		};
	}, [isSidebarPreferenceOpen]);

	useEffect(() => {
		if (!isMobile) {
			setActualSidebarOpen(isSidebarPreferenceOpen);
		}
	}, [isSidebarPreferenceOpen, isMobile]);

	const isActiveRoute = (path: string) => {
		return location.pathname === path;
	};

	const isActiveCompanyRoute = (companyId: string) => {
		const searchParams = new URLSearchParams(location.search);
		return location.pathname === "/jobs" && searchParams.get("company") === companyId;
	};

	const NavItemWithTooltip = ({ path, icon: Icon, label, isSidebarExpanded }: { path: string, icon: LucideIcon, label: string, isSidebarExpanded: boolean }) => {
		const iconSize = 20;
		const isActive = isActiveRoute(path);

		return (
			<TooltipProvider delayDuration={100}>
				<Tooltip>
					<TooltipTrigger asChild>
						<NavLink
							to={path}
							onClick={() => {
								setMobileMenuOpen(false);
							}}
							className={`flex items-center w-full px-3 py-2 rounded-lg transition-colors duration-200 group
								${isActive
									? 'bg-white/10 text-white font-medium dark:bg-slate-700 dark:text-primary'
									: 'text-white/80 dark:text-slate-400 hover:bg-white/10 dark:hover:bg-slate-700 hover:text-white dark:hover:text-white'
								}`}
						>
							<div className="flex items-center">
								<Icon size={iconSize} className="flex-shrink-0" />
								{isSidebarExpanded && (
									<span className="ml-3 text-sm">{label}</span>
								)}
							</div>
						</NavLink>
					</TooltipTrigger>
					{!isSidebarExpanded && !isMobile && (
						<TooltipContent side="right" align="center">
							{label}
						</TooltipContent>
					)}
				</Tooltip>
			</TooltipProvider>
		);
	};

	const CompanyNavItem = ({ companyId, companyName, isSidebarExpanded }: { companyId: string, companyName: string, isSidebarExpanded: boolean }) => {
		const iconSize = 16;
		const isActive = isActiveCompanyRoute(companyId);

		return (
			<TooltipProvider delayDuration={100}>
				<Tooltip>
					<TooltipTrigger asChild>
						<NavLink
							to={`/jobs?company=${companyId}`}
							onClick={() => {
								setMobileMenuOpen(false);
							}}
							className={`flex items-center w-full px-3 py-2 rounded-lg transition-colors duration-200 group ml-4
								${isActive
									? 'bg-white/10 text-white font-medium dark:bg-slate-700 dark:text-primary'
									: 'text-white/80 dark:text-slate-400 hover:bg-white/10 dark:hover:bg-slate-700 hover:text-white dark:hover:text-white'
								}`}
						>
							<div className="flex items-center">
								<Building size={iconSize} className="flex-shrink-0" />
								{isSidebarExpanded && (
									<span className="ml-3 text-sm truncate">{companyName}</span>
								)}
							</div>
						</NavLink>
					</TooltipTrigger>
					{!isSidebarExpanded && !isMobile && (
						<TooltipContent side="right" align="center">
							{companyName}
						</TooltipContent>
					)}
				</Tooltip>
			</TooltipProvider>
		);
	};

	const navItems: Array<{ path: string; icon: LucideIcon; label: string }> = [
		{ path: "/dashboard", icon: LayoutDashboard, label: t("navigation.dashboard") },
	];

	const managementItems: Array<{ path: string; icon: LucideIcon; label: string }> = [
		{ path: "/companies", icon: Building, label: t("navigation.companies") },
		{ path: "/providers", icon: Wrench, label: t("navigation.providers") },
		{ path: "/managers", icon: UserCog, label: t("navigation.managers") },
		{ path: "/clients", icon: Handshake, label: t("navigation.clients") },
		{ path: "/campaigns", icon: Megaphone, label: t("navigation.campaigns") },
		{ path: "/jobs-types", icon: Layers, label: t("navigation.jobTypes") },
		{ path: "/profile", icon: User, label: t("navigation.profile") },
		{ path: "/settings", icon: Settings, label: t("navigation.settings") },
	];

	const SidebarContent = ({ expanded }: { expanded: boolean }) => (
		<>
			<div className="flex items-center justify-between h-16 px-4 border-b border-slate-200/20 dark:border-slate-700">
				<NavLink to="/dashboard" className={`flex items-center`}>
					<div className="p-2 rounded-full bg-white/10 dark:bg-primary/20 mr-2">
						<div className="text-white dark:text-primary/90 font-bold text-lg">IF</div>
					</div>
					{expanded && (
							<span className="text-lg font-semibold text-white dark:text-white">InvoicesFlow</span>
					)}
				</NavLink>
			</div>
			<nav className={`flex-1 ${expanded ? 'p-4' : 'p-2'}`}>
				<ul className="space-y-1">
					{navItems.map((item) => (
						<li key={item.path}>
							<NavItemWithTooltip {...item} isSidebarExpanded={expanded} />
						</li>
					))}
				</ul>

				<Separator className="my-4 bg-white/20 dark:bg-slate-700" />
				<div className="mb-2">
					{expanded && (
						<h3 className="text-xs font-semibold text-white/60 dark:text-slate-400 px-3 mb-2">
							{t("navigation.jobs").toUpperCase()}
						</h3>
					)}
					<ul className="space-y-1">
						{isLoadingCompanies ? (
							<li>
								<div className="flex items-center w-full px-3 py-2 rounded-lg text-white/60 dark:text-slate-400">
									<List size={20} className="flex-shrink-0" />
									{expanded && (
										<span className="ml-3 text-sm">{t("common.loading")}...</span>
									)}
								</div>
							</li>
						) : companies && companies.length > 0 ? (
							companies.filter(company => company.active).map((company) => (
								<li key={company.id}>
									<CompanyNavItem 
										companyId={company.id} 
										companyName={company.name} 
										isSidebarExpanded={expanded} 
									/>
								</li>
							))
						) : (
							<li>
								<div className="flex items-center w-full px-3 py-2 rounded-lg text-white/60 dark:text-slate-400">
									<Building size={20} className="flex-shrink-0" />
									{expanded && (
										<span className="ml-3 text-sm">{t("companies.noCompaniesFound")}</span>
									)}
								</div>
							</li>
						)}
					</ul>
				</div>

				<Separator className="my-4 bg-white/20 dark:bg-slate-700" />
				<div className="mb-2">
					{expanded && (
						<h3 className="text-xs font-semibold text-white/60 dark:text-slate-400 px-3 mb-2">
							{t("navigation.management").toUpperCase()}
						</h3>
					)}
					<ul className="space-y-1">
						{managementItems.map((item) => (
							<li key={item.path}>
								<NavItemWithTooltip {...item} isSidebarExpanded={expanded} />
							</li>
						))}
					</ul>
				</div>

				<Separator className="my-4 bg-white/20 dark:bg-slate-700" />
				<NavLink
					to="/logout"
					onClick={signOut}
					className="flex w-full items-center px-3 py-2 rounded-lg text-white/80 hover:bg-white/10 dark:hover:bg-slate-700 dark:text-red-400 transition-colors duration-200"
				>
					<LogOut size={20} />
					{expanded && <span className="ml-3 text-sm font-medium">{t("auth.signOut")}</span>}
				</NavLink>
			</nav>
		</>
	);

	return (
		<div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
			<div
				className={`gradient-bg dark:bg-none dark:bg-slate-800 border-r border-slate-200/20 dark:border-slate-700 transition-all duration-300 ease-in-out backdrop-blur-sm
                   ${actualSidebarOpen ? 'w-64' : 'w-16'} fixed h-full z-10 hidden lg:block`}
			>
				<SidebarContent expanded={actualSidebarOpen} />
			</div>

			<Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
				<SheetContent side="left" className="p-0 w-[240px] gradient-bg dark:bg-slate-800">
					<SidebarContent expanded={true} />
				</SheetContent>
			</Sheet>

			<div className={`flex-1 transition-all duration-300 ${actualSidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
				<header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 h-16 flex items-center px-4 sticky top-0 z-10">
					<div className="flex-1 flex items-center">
						<div className="flex items-center">
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setMobileMenuOpen(true)}
								className="mr-2 rounded-lg bg-white/10 hover:bg-white/10 dark:hover:bg-slate-700 dark:text-white lg:hidden"
							>
								<Menu size={22} />
							</Button>

							<Button
								variant="ghost"
								size="icon"
								onClick={toggleSidebarPreference}
								className="rounded-lg bg-white/10 hover:bg-white/10 dark:hover:bg-slate-700 dark:text-white hidden lg:flex"
							>
								<SidebarIcon size={18} />
							</Button>
						</div>
					</div>
					<div className="flex items-center space-x-4">
						<LanguageSelector />
						<ThemeToggle />
						<div className="flex items-center space-x-3">
							<div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
								<span className="text-primary font-medium text-sm">
									{user?.email?.[0].toUpperCase()}
								</span>
							</div>
							<div className="hidden md:block">
								<div className="text-sm font-medium text-slate-900 dark:text-white">{user?.email}</div>
							</div>
						</div>
					</div>
				</header>
				<main className="p-0">{children}</main>
			</div>
		</div>
	);
};

export default DashboardLayout;
