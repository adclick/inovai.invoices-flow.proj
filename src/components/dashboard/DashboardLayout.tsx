
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
	LayoutDashboard,
	Users,
	BarChart2, LogOut,
	Menu,
	X,
	Bell,
	Search, UserCog,
	BriefcaseBusiness,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface DashboardLayoutProps {
	children: React.ReactNode;
}

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
		{ path: "/jobs", icon: BriefcaseBusiness, label: "Jobs" },
	];

	const managementItems = [
		{ path: "/providers", icon: UserCog, label: "Providers" },
		{ path: "/managers", icon: UserCog, label: "Managers" },
		{ path: "/clients", icon: Users, label: "Clients" },
		{ path: "/campaigns", icon: BarChart2, label: "Campaigns" },
	];

	return (
		<div className="min-h-screen bg-background flex">
			<div
				className={`bg-white dark:bg-slate-800 border-r border-border transition-all duration-300 ease-in-out shadow-md
                   ${sidebarOpen ? 'w-64' : 'w-16'} fixed h-full z-10`}
			>
				<div className="flex items-center justify-between h-16 px-4 border-b border-border">
					<div className={`flex items-center ${sidebarOpen ? '' : 'hidden'}`}>
						<div className="p-2 rounded-full bg-accent/10 mr-2">
							<div className="text-accent font-bold text-lg">IF</div>
						</div>
						<span className="text-lg font-semibold text-slate-900 dark:text-white">InvoicesFlow</span>
					</div>
					<Button
						variant="ghost"
						size="icon"
						onClick={toggleSidebar}
						className="rounded-lg hover:bg-accent/10 hover:text-accent dark:hover:bg-slate-700"
					>
						{sidebarOpen ? <X size={18} /> : <Menu size={18} />}
					</Button>
				</div>
				<nav className="flex-1 p-4">
					<ul className="space-y-1">
						{navItems.map((item) => (
							<li key={item.path}>
								<Link
									to={item.path}
									className={`flex items-center px-3 py-2 rounded-lg transition-colors duration-200
                    ${isActiveRoute(item.path)
											? 'sidebar-item-active'
											: 'sidebar-item-inactive'
										}`}
								>
									<item.icon size={20} className={isActiveRoute(item.path) ? 'text-accent' : ''} />
									{sidebarOpen && <span className="ml-3 text-sm">{item.label}</span>}
								</Link>
							</li>
						))}
					</ul>

					{/* Management Actions Section */}
					{sidebarOpen && (
						<>
							<Separator className="my-4" />
							<div className="mb-2">
								<h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-3 mb-2">
									MANAGEMENT
								</h3>
								<ul className="space-y-1">
									{
										managementItems.map((item) => (
											<li key={item.path}>
												<Link
													to={item.path}
													className={`flex items-center px-3 py-2 rounded-lg transition-colors duration-200
														${isActiveRoute(item.path)
														? 'sidebar-item-active'
														: 'sidebar-item-inactive'
														}`}
												>
													<item.icon size={18} className={isActiveRoute(item.path) ? 'text-accent' : ''} />
													<span className="ml-3 text-sm">{item.label}</span>
												</Link>
											</li>
										))
									}
								</ul>
							</div>
						</>
					)}

					<Separator className="my-4" />
					<button
						onClick={signOut}
						className="flex w-full items-center px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
					>
						<LogOut size={20} />
						{sidebarOpen && <span className="ml-3 text-sm font-medium">Sign Out</span>}
					</button>
				</nav>
			</div>

			<div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
				<header className="bg-white dark:bg-slate-800 border-b border-border h-16 flex items-center px-6 sticky top-0 shadow-sm z-10">
					<div className="flex-1 flex items-center">
						<div className="relative w-full max-w-md hidden md:block">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
							<input
								type="text"
								placeholder="Search..."
								className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-border bg-background/50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/20"
							/>
						</div>
					</div>
					<div className="flex items-center space-x-4">
						<div className="flex items-center space-x-3">
							<div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
								<span className="text-accent font-medium text-sm">
									{user?.email?.[0].toUpperCase()}
								</span>
							</div>
							<div className="hidden md:block">
								<div className="text-sm font-medium text-slate-900 dark:text-white">{user?.email}</div>
							</div>
						</div>
					</div>
				</header>
				<main className="p-0 bg-background">{children}</main>
			</div>
		</div>
	);
};

export default DashboardLayout;
