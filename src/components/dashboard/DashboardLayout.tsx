
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
	LayoutDashboard, LogOut, UserCog, Sidebar, List,
	Group,
	Handshake,
	Megaphone,
	Wrench
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ThemeToggle from "@/components/theme/ThemeToggle";

interface DashboardLayoutProps {
	children: React.ReactNode;
}

const THEME_TOGGLE_ACTIVE = false;

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
	const { user, signOut, checkHasRole } = useAuth();
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const location = useLocation();

	const toggleSidebar = () => {
		setSidebarOpen(!sidebarOpen);
	};

	const isActiveRoute = (path: string) => {
		return location.pathname === path;
	};

	const navItems = [
		{ path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
	];

	const jobItems = [
		{ path: "/jobs/all", icon: List, label: "All Jobs" },
		{ path: "/jobs/grouped", icon: Group, label: "By Campaign" },
	];

	const managementItems = [
		{ path: "/providers", icon: Wrench, label: "Providers" },
		{ path: "/managers", icon: UserCog, label: "Managers" },
		{ path: "/clients", icon: Handshake, label: "Clients" },
		{ path: "/campaigns", icon: Megaphone, label: "Campaigns" },
	];

	return (
		<div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
			<div
				className={`gradient-bg dark:bg-slate-800 border-r border-slate-200/20 dark:border-slate-700 transition-all duration-300 ease-in-out backdrop-blur-sm
                   ${sidebarOpen ? 'w-64' : 'w-16'} fixed h-full z-10`}
			>
				<div className="flex items-center justify-between h-16 px-4 border-b border-slate-200/20 dark:border-slate-700">
					<div className={`flex items-center`}>
						<div className="p-2 rounded-full bg-white/10 dark:bg-primary/20 mr-2">
							<div className="text-white dark:text-primary/90 font-bold text-lg">IF</div>
						</div>
						<span className={`text-lg font-semibold text-white dark:text-white ${sidebarOpen ? '' : 'hidden'}`}>InvoicesFlow</span>
					</div>
				</div>
				<nav className="flex-1 p-4">
					<ul className="space-y-1">
						{navItems.map((item) => (
							<li key={item.path}>
								<Link
									to={item.path}
									className={`flex items-center px-3 py-2 rounded-lg transition-colors duration-200
                    ${isActiveRoute(item.path)
											? 'bg-white/10 text-white font-medium dark:bg-slate-700 dark:text-primary'
											: 'text-white/80 dark:text-slate-400 hover:bg-white/10 dark:hover:bg-slate-700 hover:text-white dark:hover:text-white'
										}`}
								>
									<item.icon size={20} />
									{sidebarOpen && <span className="ml-3 text-sm">{item.label}</span>}
								</Link>
							</li>
						))}
					</ul>

					{/* Jobs Section */}
					{sidebarOpen && (
						<>
							<Separator className="my-4 bg-white/20 dark:bg-slate-700" />
							<div className="mb-2">
								<h3 className="text-xs font-semibold text-white/60 dark:text-slate-400 px-3 mb-2">
									JOBS
								</h3>
								<ul className="space-y-1">
									{
										jobItems.map((item) => (
											<li key={item.path}>
												<Link
													to={item.path}
													className={`flex items-center px-3 py-2 rounded-lg transition-colors duration-200
														${location.pathname.startsWith(item.path)
															? 'bg-white/10 text-white font-medium dark:bg-slate-700 dark:text-primary'
															: 'text-white/80 dark:text-slate-400 hover:bg-white/10 dark:hover:bg-slate-700 hover:text-white dark:hover:text-white'
														}`}
												>
													<item.icon size={18} />
													<span className="ml-3 text-sm">{item.label}</span>
												</Link>
											</li>
										))
									}
								</ul>
							</div>
						</>
					)}

					{/* Management Actions Section */}
					{sidebarOpen && (
						<>
							<Separator className="my-4 bg-white/20 dark:bg-slate-700" />
							<div className="mb-2">
								<h3 className="text-xs font-semibold text-white/60 dark:text-slate-400 px-3 mb-2">
									MANAGEMENT
								</h3>
								<ul className="space-y-1">
									{
										managementItems.map((item) => (
											<li key={item.path}>
												<Link
													to={item.path}
													className={`flex items-center px-3 py-2 rounded-lg transition-colors duration-200
														${location.pathname.startsWith(item.path)
															? 'bg-white/10 text-white font-medium dark:bg-slate-700 dark:text-primary'
															: 'text-white/80 dark:text-slate-400 hover:bg-white/10 dark:hover:bg-slate-700 hover:text-white dark:hover:text-white'
														}`}
												>
													<item.icon size={18} />
													<span className="ml-3 text-sm">{item.label}</span>
												</Link>
											</li>
										))
									}
								</ul>
							</div>
						</>
					)}

					<Separator className="my-4 bg-white/20 dark:bg-slate-700" />
					<button
						onClick={signOut}
						className="flex w-full items-center px-3 py-2 rounded-lg text-white/80 hover:bg-white/10 dark:hover:bg-slate-700 dark:text-red-400 transition-colors duration-200"
					>
						<LogOut size={20} />
						{sidebarOpen && <span className="ml-3 text-sm font-medium">Sign Out</span>}
					</button>
				</nav>
			</div>

			<div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
				<header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 h-16 flex items-center px-6 sticky top-0">
					<div className="flex-1 flex items-center">
						<div className="relative w-full max-w-md hidden md:block">
							<Button
								variant="ghost"
								size="icon"
								onClick={toggleSidebar}
								className="rounded-lg bg-white/10 hover:bg-white/10 dark:hover:bg-slate-700  dark:text-white"
							>
								{sidebarOpen ? <Sidebar size={18} /> : <Sidebar size={18} />}
							</Button>
						</div>
					</div>
					<div className="flex items-center space-x-4">
						{THEME_TOGGLE_ACTIVE && <ThemeToggle /> }
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
