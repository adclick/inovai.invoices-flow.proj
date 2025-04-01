
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ProfileSection: React.FC = () => {
  const { user, roles } = useAuth();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Profile</CardTitle>
        <CardDescription>Manage your account information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium">Email</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium">Roles</h3>
            <div className="flex flex-wrap gap-2 mt-1">
              {roles.isAdmin && (
                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                  Admin
                </span>
              )}
              {roles.isSuperAdmin && (
                <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100">
                  Super Admin
                </span>
              )}
              {roles.isFinance && (
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                  Finance
                </span>
              )}
              {!roles.isAdmin && !roles.isSuperAdmin && !roles.isFinance && (
                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100">
                  Basic User
                </span>
              )}
            </div>
          </div>
          
          <div className="pt-4">
            <Button variant="outline">Update Profile</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSection;
