
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Clock, CheckCircle, XCircle, AlertCircle, Users, FileText, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const Dashboard: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
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
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-transparent rounded-lg" />
          <div className="relative p-6">
            <h1 className="text-[32px] font-semibold text-slate-800 dark:text-slate-100">Admin Dashboard</h1>
            <p className="text-base text-slate-600 dark:text-slate-400 mt-1">Review and manage freelancer invoices</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="stat-card border-blue-100 dark:border-blue-900/30">
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                    <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">All time</span>
                </div>
                <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Total Invoices</h2>
                <p className="text-3xl font-bold text-accent dark:text-accent">0</p>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card border-orange-100 dark:border-orange-900/30">
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-full">
                    <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">Awaiting action</span>
                </div>
                <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Pending Review</h2>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">0</p>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card border-green-100 dark:border-green-900/30">
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-full">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">Processed successfully</span>
                </div>
                <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Approved</h2>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">0</p>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card border-red-100 dark:border-red-900/30">
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-full">
                    <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">Requires correction</span>
                </div>
                <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Rejected</h2>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">0</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity Section */}
          <Card className="lg:col-span-2 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Clock className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest invoice submissions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mt-2 text-center text-slate-600 dark:text-slate-400 py-8">
                <p>No recent activity to display</p>
              </div>
            </CardContent>
          </Card>

          {/* Active Freelancers Section */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Users className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <CardTitle>Active Freelancers</CardTitle>
                  <CardDescription>Freelancers with pending invoices</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mt-2 text-center text-slate-600 dark:text-slate-400 py-8">
                <p>No active freelancers at the moment.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoice Management Section */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <FileText className="w-5 h-5 text-accent" />
                </div>
                <CardTitle>Invoice Management</CardTitle>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search invoices..."
                    className="pl-10 pr-4 py-2 rounded-lg border border-border bg-background/30 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 w-64"
                  />
                </div>
                <Button variant="outline" size="icon" className="rounded-lg border-border">
                  <Filter size={18} className="text-slate-600 dark:text-slate-400" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
              <button className="px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-medium whitespace-nowrap">All</button>
              <button className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-sm font-medium whitespace-nowrap transition-colors">Pending</button>
              <button className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-sm font-medium whitespace-nowrap transition-colors">Approved</button>
              <button className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-sm font-medium whitespace-nowrap transition-colors">Rejected</button>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              <div className="grid grid-cols-4 gap-4 px-4 py-2 font-medium border-b border-border">
                <div>Invoice</div>
                <div>Freelancer</div>
                <div>Amount</div>
                <div>Status</div>
              </div>
              <div className="text-center py-8">
                <p>No invoices to display</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
