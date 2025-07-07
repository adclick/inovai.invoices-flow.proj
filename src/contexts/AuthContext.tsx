
import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UserRoles {
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  roles: UserRoles;
  signOut: () => Promise<void>;
  checkHasRole: (role: string) => boolean;
  isAuthenticated: boolean;
}

const defaultRoles: UserRoles = {
  isAdmin: false,
  isSuperAdmin: false,
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  roles: defaultRoles,
  signOut: async () => {},
  checkHasRole: () => false,
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [roles, setRoles] = useState<UserRoles>(defaultRoles);

  // Enhanced security: Server-side role verification
  const fetchUserRoles = async (userId: string) => {
    try {
      // Use server-side RPC function for secure role checking
      const { data: isAdmin, error: adminError } = await supabase.rpc('has_role', {
        _user_id: userId,
        _role: 'admin'
      });

      const { data: isSuperAdmin, error: superAdminError } = await supabase.rpc('has_role', {
        _user_id: userId,
        _role: 'super_admin'
      });

      if (adminError || superAdminError) {
        console.error('Error fetching user roles:', adminError || superAdminError);
        setRoles(defaultRoles);
        return;
      }
      
      setRoles({
        isAdmin: Boolean(isAdmin),
        isSuperAdmin: Boolean(isSuperAdmin),
      });

      // Log role verification for security audit
      setTimeout(async () => {
        await supabase.rpc('log_security_event', {
          p_action: 'roles_verified',
          p_resource_type: 'authentication',
          p_details: { 
            user_id: userId,
            is_admin: Boolean(isAdmin),
            is_super_admin: Boolean(isSuperAdmin)
          }
        });
      }, 0);

    } catch (error: any) {
      console.error('Security error - failed to verify user roles:', error.message);
      setRoles(defaultRoles);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST to avoid missing events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Avoid deadlock with Supabase by not using async in this callback
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer fetching user roles with setTimeout to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchUserRoles(session.user.id);
          }, 0);
        } else {
          setRoles(defaultRoles);
        }
        
        // Enhanced security: More restrictive toast notifications
        if (event === 'SIGNED_IN' && session?.user) {
          // Only show toast once per session
          const hasSeenToast = sessionStorage.getItem(`signin_toast_${session.user.id}`);
          if (!hasSeenToast) {
            toast.success('Signed in successfully');
            sessionStorage.setItem(`signin_toast_${session.user.id}`, 'true');
          }
        } else if (event === 'SIGNED_OUT') {
          // Clear session storage on sign out
          sessionStorage.clear();
          toast.info('Signed out successfully');
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Security: Token refreshed successfully');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserRoles(session.user.id);
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      // Log sign out attempt for security audit
      if (user) {
        await supabase.rpc('log_security_event', {
          p_action: 'signout_initiated',
          p_resource_type: 'authentication',
          p_details: { user_id: user.id }
        });
      }

      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        toast.error(`Error signing out: ${error.message}`);
      }
    } catch (error) {
      console.error('Unexpected error during sign out:', error);
      toast.error('An unexpected error occurred during sign out');
    }
  };

  const checkHasRole = (role: string): boolean => {
    switch (role) {
      case 'admin':
        return roles.isAdmin || roles.isSuperAdmin;
      case 'super_admin':
        return roles.isSuperAdmin;
      default:
        return false;
    }
  };

  const value = {
    session,
    user,
    isLoading,
    roles,
    signOut,
    checkHasRole,
    isAuthenticated: Boolean(session && user),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
