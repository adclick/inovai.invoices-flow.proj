
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  LayoutDashboard, 
  Users, 
  BarChart2, 
  Settings, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <div 
        className={`bg-white dark:bg-gray-800 shadow-md transition-all duration-300 ease-in-out
                   ${sidebarOpen ? 'w-64' : 'w-16'} fixed h-full z-10`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <div className={`flex items-center ${sidebarOpen ? '' : 'hidden'}`}>
            <span className="text-xl font-bold">InvoicesFlow</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="rounded-full"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </Button>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            <li>
              <Link
                to="/dashboard"
                className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <LayoutDashboard size={20} />
                {sidebarOpen && <span className="ml-3">Dashboard</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/clients"
                className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Users size={20} />
                {sidebarOpen && <span className="ml-3">Clients</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/jobs"
                className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <BarChart2 size={20} />
                {sidebarOpen && <span className="ml-3">Jobs</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/settings"
                className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Settings size={20} />
                {sidebarOpen && <span className="ml-3">Settings</span>}
              </Link>
            </li>
          </ul>
          <Separator className="my-4" />
          <button
            onClick={signOut}
            className="flex w-full items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="ml-3">Sign Out</span>}
          </button>
        </nav>
      </div>

      {/* Main content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <header className="bg-white dark:bg-gray-800 shadow-sm h-16 flex items-center px-6">
          <div className="ml-auto">
            <div className="flex items-center space-x-2">
              <div className="text-sm">
                <div className="font-medium">{user?.email}</div>
              </div>
            </div>
          </div>
        </header>
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
