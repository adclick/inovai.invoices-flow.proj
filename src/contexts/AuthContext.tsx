import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UserRoles {
  isAdmin: boolean;
  isFinance: boolean;
  isSuperAdmin: boolean;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  roles: UserRoles;
  signOut: () => Promise<void>;
  checkHasRole: (role: string) => boolean;
}

const defaultRoles: UserRoles = {
  isAdmin: false,
  isFinance: false,
  isSuperAdmin: false,
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  roles: defaultRoles,
  signOut: async () => {},
  checkHasRole: () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [roles, setRoles] = useState<UserRoles>(defaultRoles);

  // Fetch user roles from the database
  const fetchUserRoles = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      const userRoles = data || [];
      
      setRoles({
        isAdmin: userRoles.some(r => r.role === 'admin'),
        isSuperAdmin: userRoles.some(r => r.role === 'super_admin'),
        isFinance: userRoles.some(r => r.role === 'finance'),
      });
    } catch (error: any) {
      console.error('Error fetching user roles:', error.message);
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
        
        // Show toast notifications for auth events
        if (event === 'SIGNED_IN' && !session?.user?.user_metadata?.hasSeenSignInToast) {
          toast.success('Signed in successfully');
          // Mark that we've shown the toast for this session
          if (session?.user) {
            supabase.auth.updateUser({
              data: { hasSeenSignInToast: true }
			});
          }
        } else if (event === 'SIGNED_OUT') {
          toast.info('Signed out successfully');
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
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(`Error signing out: ${error.message}`);
    }
  };

  const checkHasRole = (role: string): boolean => {
    switch (role) {
      case 'admin':
        return roles.isAdmin || roles.isSuperAdmin;
      case 'super_admin':
        return roles.isSuperAdmin;
      case 'finance':
        return roles.isFinance;
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
