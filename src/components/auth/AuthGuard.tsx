
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useServerSideAuth } from "@/hooks/useServerSideAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireSuperAdmin?: boolean;
  action?: string;
  resourceType?: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAdmin = false,
  requireSuperAdmin = false,
  action = "access_protected_resource",
  resourceType,
}) => {
  const { user, isLoading: authLoading } = useAuth();
  const { data: authData, isLoading: serverAuthLoading, error } = useServerSideAuth(action, resourceType);

  // Show loading while checking authentication
  if (authLoading || serverAuthLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Verifying permissions...</span>
      </div>
    );
  }

  // Handle authentication errors
  if (error || !user || !authData?.isAuthenticated) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          You must be logged in to access this resource.
        </AlertDescription>
      </Alert>
    );
  }

  // Check admin requirements
  if (requireSuperAdmin && !authData.isSuperAdmin) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Super admin privileges required to access this resource.
        </AlertDescription>
      </Alert>
    );
  }

  if (requireAdmin && !authData.hasAdminAccess) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Admin privileges required to access this resource.
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
};
