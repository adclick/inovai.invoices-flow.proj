
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
    LayoutDashboard, LogOut, UserCog, Sidebar as SidebarIcon, List,
    Group, Handshake, Megaphone, Wrench, LucideIcon, Menu, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const THEME_TOGGLE_ACTIVE = false;

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const { user, signOut, checkHasRole } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    // Check if mobile screen
    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 1024);
            if (window.innerWidth < 1024) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };

        checkIfMobile();
        window.addEventListener('resize', checkIfMobile);
        
        return () => {
            window.removeEventListener('resize', checkIfMobile);
        };
    }, []);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const isActiveRoute = (path: string) => {
        return location.pathname === path;
    };

    const NavItemWithTooltip = ({ path, icon: Icon, label }: { path: string, icon: LucideIcon, label: string }) => {
        const iconSize = 20; // Fixed icon size
        const isActive = isActiveRoute(path);

        return (
            <TooltipProvider delayDuration={100}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link
                            to={path}
                            className={`flex items-center px-3 py-2 rounded-lg transition-colors duration-200 group
                                ${isActive
                                    ? 'bg-white/10 text-white font-medium dark:bg-slate-700 dark:text-primary'
                                    : 'text-white/80 dark:text-slate-400 hover:bg-white/10 dark:hover:bg-slate-700 hover:text-white dark:hover:text-white'
                                }`}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <div className="flex items-center">
                                <Icon size={iconSize} className="flex-shrink-0" />
                                {(sidebarOpen || isMobile) && (
                                    <span className="ml-3 text-sm">{label}</span>
                                )}
                            </div>
                        </Link>
                    </TooltipTrigger>
                    {!sidebarOpen && !isMobile && (
                        <TooltipContent side="right" align="center">
                            {label}
                        </TooltipContent>
                    )}
                </Tooltip>
            </TooltipProvider>
        );
    };

    const navItems: Array<{ path: string; icon: LucideIcon; label: string }> = [
        { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    ];

    const jobItems: Array<{ path: string; icon: LucideIcon; label: string }> = [
        { path: "/jobs/all", icon: List, label: "All Jobs" },
        { path: "/jobs/grouped", icon: Group, label: "By Campaign" },
    ];

    const managementItems: Array<{ path: string; icon: LucideIcon; label: string }> = [
        { path: "/providers", icon: Wrench, label: "Providers" },
        { path: "/managers", icon: UserCog, label: "Managers" },
        { path: "/clients", icon: Handshake, label: "Clients" },
        { path: "/campaigns", icon: Megaphone, label: "Campaigns" },
    ];

    // Sidebar content shared between desktop and mobile
    const SidebarContent = () => (
        <>
            <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200/20 dark:border-slate-700">
                <div className={`flex items-center`}>
                    <div className="p-2 rounded-full bg-white/10 dark:bg-primary/20 mr-2">
                        <div className="text-white dark:text-primary/90 font-bold text-lg">IF</div>
                    </div>
                    <span className={`text-lg font-semibold text-white dark:text-white ${isMobile || sidebarOpen ? '' : 'hidden'}`}>InvoicesFlow</span>
                </div>
            </div>
            <nav className="flex-1 p-4">
                <ul className="space-y-1">
                    {navItems.map((item) => (
                        <li key={item.path}>
                            <NavItemWithTooltip {...item} />
                        </li>
                    ))}
                </ul>

                {/* Jobs Section */}
                {(isMobile || sidebarOpen) && (
                    <>
                        <Separator className="my-4 bg-white/20 dark:bg-slate-700" />
                        <div className="mb-2">
                            <h3 className="text-xs font-semibold text-white/60 dark:text-slate-400 px-3 mb-2">
                                JOBS
                            </h3>
                            <ul className="space-y-1">
                                {jobItems.map((item) => (
                                    <li key={item.path}>
                                        <NavItemWithTooltip {...item} />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </>
                )}

                {/* Management Actions Section */}
                {(isMobile || sidebarOpen) && (
                    <>
                        <Separator className="my-4 bg-white/20 dark:bg-slate-700" />
                        <div className="mb-2">
                            <h3 className="text-xs font-semibold text-white/60 dark:text-slate-400 px-3 mb-2">
                                MANAGEMENT
                            </h3>
                            <ul className="space-y-1">
                                {managementItems.map((item) => (
                                    <li key={item.path}>
                                        <NavItemWithTooltip {...item} />
                                    </li>
                                ))}
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
                    {(isMobile || sidebarOpen) && <span className="ml-3 text-sm font-medium">Sign Out</span>}
                </button>
            </nav>
        </>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
            {/* Desktop Sidebar */}
            <div
                className={`gradient-bg dark:bg-slate-800 border-r border-slate-200/20 dark:border-slate-700 transition-all duration-300 ease-in-out backdrop-blur-sm
                   ${sidebarOpen ? 'w-64' : 'w-16'} fixed h-full z-10 hidden lg:block`}
            >
                <SidebarContent />
            </div>

            {/* Mobile Sidebar using Sheet component */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetContent side="left" className="p-0 w-[240px] gradient-bg dark:bg-slate-800">
                    <SidebarContent />
                </SheetContent>
            </Sheet>

            <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
                <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 h-16 flex items-center px-4 sticky top-0 z-10">
                    <div className="flex-1 flex items-center">
                        <div className="flex items-center">
                            {/* Mobile menu button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setMobileMenuOpen(true)}
                                className="mr-2 rounded-lg bg-white/10 hover:bg-white/10 dark:hover:bg-slate-700 dark:text-white lg:hidden"
                            >
                                <Menu size={22} />
                            </Button>

                            {/* Desktop sidebar toggle */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleSidebar}
                                className="rounded-lg bg-white/10 hover:bg-white/10 dark:hover:bg-slate-700 dark:text-white hidden lg:flex"
                            >
                                <SidebarIcon size={18} />
                            </Button>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        {THEME_TOGGLE_ACTIVE && <ThemeToggle />}
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <span className="text-primary font-medium text-sm">
                                    {user?.email?.[0].toUpperCase()}
                                </span>
                            </div>
                            <div className="hidden md:block">
                                <div className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-[150px]">{user?.email}</div>
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
