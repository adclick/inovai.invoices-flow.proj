import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';

interface SidebarContextType {
  // This represents the user's persisted preference for the sidebar state on desktop.
  isSidebarPreferenceOpen: boolean;
  // This toggles the user's persisted preference.
  toggleSidebarPreference: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

const SIDEBAR_STORAGE_KEY = 'sidebarOpenPreference';

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const getInitialSidebarPreference = () => {
    if (typeof window !== 'undefined') {
      const storedState = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (storedState !== null) {
        try {
          return JSON.parse(storedState);
        } catch (e) {
          console.error("Error parsing sidebar preference from localStorage", e);
          return true; // Default to true if parsing fails
        }
      }
    }
    return true; // Default to true (expanded) if nothing is stored or SSR
  };

  const [isSidebarPreferenceOpen, setIsSidebarPreferenceOpen] = useState<boolean>(getInitialSidebarPreference);

  const toggleSidebarPreference = useCallback(() => {
    setIsSidebarPreferenceOpen(prev => {
      const newState = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(newState));
      }
      return newState;
    });
  }, []);

  // Listen to storage events to sync across tabs (optional, but good practice)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === SIDEBAR_STORAGE_KEY && event.newValue !== null) {
        try {
          setIsSidebarPreferenceOpen(JSON.parse(event.newValue));
        } catch (e) {
          console.error("Error parsing sidebar preference from storage event", e);
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, []);

  return (
    <SidebarContext.Provider value={{ isSidebarPreferenceOpen, toggleSidebarPreference }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}; 