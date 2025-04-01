import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

const Dashboard: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        {/* Header Section */}
        <div>
          <h1 className="text-[32px] font-semibold text-slate-800 dark:text-slate-100">Admin Dashboard</h1>
          <p className="text-base text-slate-600 dark:text-slate-400 mt-1">Review and manage freelancer invoices</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400">All time</span>
              </div>
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Total Invoices</h2>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">0</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400">Awaiting action</span>
              </div>
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Pending Review</h2>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">0</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400">Processed successfully</span>
              </div>
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Approved</h2>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">0</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400">Requires correction</span>
              </div>
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Rejected</h2>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">0</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity Section */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">Recent Activity</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">Latest invoice submissions</p>
              <div className="mt-6 text-center text-slate-600 dark:text-slate-400 py-8">
                <p>No recent activity to display</p>
              </div>
            </div>
          </div>

          {/* Active Freelancers Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">Active Freelancers</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">Freelancers with pending invoices</p>
              <div className="mt-6 text-center text-slate-600 dark:text-slate-400 py-8">
                <p>No active freelancers at the moment.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Management Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Invoice Management</h2>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Search invoices..."
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="flex space-x-2 mb-6">
              <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-full text-sm font-medium">All</button>
              <button className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-sm font-medium">Pending</button>
              <button className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-sm font-medium">Approved</button>
              <button className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-sm font-medium">Rejected</button>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              <div className="grid grid-cols-4 gap-4 px-4 py-2 font-medium">
                <div>Invoice</div>
                <div>Freelancer</div>
                <div>Amount</div>
                <div>Status</div>
              </div>
              <div className="text-center py-8">
                <p>No invoices to display</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
