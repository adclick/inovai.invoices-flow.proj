
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useServerSideAuth = (action: string, resourceType?: string) => {
  const { user, session } = useAuth();

  return useQuery({
    queryKey: ["server-auth", user?.id, action, resourceType],
    queryFn: async () => {
      if (!user || !session) {
        throw new Error("No authenticated user");
      }

      // Log the action attempt for security audit
      const { error } = await supabase.rpc('log_security_event', {
        p_action: action,
        p_resource_type: resourceType || 'client_action',
        p_details: { user_id: user.id }
      });

      if (error) {
        console.error('Failed to log security event:', error);
      }

      // Verify user roles server-side
      const { data: isAdmin, error: adminError } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });

      const { data: isSuperAdmin, error: superAdminError } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'super_admin'
      });

      if (adminError || superAdminError) {
        throw new Error("Failed to verify user permissions");
      }

      return {
        isAuthenticated: true,
        isAdmin: Boolean(isAdmin),
        isSuperAdmin: Boolean(isSuperAdmin),
        hasAdminAccess: Boolean(isAdmin || isSuperAdmin)
      };
    },
    enabled: Boolean(user && session),
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
