
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

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
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800">
            <h2 className="text-lg font-medium mb-2">Total Clients</h2>
            <p className="text-3xl font-bold">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800">
            <h2 className="text-lg font-medium mb-2">Active Jobs</h2>
            <p className="text-3xl font-bold">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800">
            <h2 className="text-lg font-medium mb-2">Pending Payments</h2>
            <p className="text-3xl font-bold">0</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
