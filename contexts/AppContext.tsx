
import React, { createContext, useState, useMemo, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface IntegrationsState {
    slack: boolean;
    googleCalendar: boolean;
}

export interface AppContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  selectedIndustry: string | null;
  setSelectedIndustry: (industry: string | null) => void;
  integrations: IntegrationsState;
  connectIntegration: (name: keyof IntegrationsState) => void;
  disconnectIntegration: (name: keyof IntegrationsState) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('versacrm_theme') as Theme | null;
    return savedTheme || 'light';
  });

  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(() => {
      return localStorage.getItem('versacrm_selected_industry');
  });

  const [integrations, setIntegrations] = useState<IntegrationsState>({
      slack: false,
      googleCalendar: false,
  });

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem('versacrm_theme', theme);
  }, [theme]);
  
  useEffect(() => {
    if (selectedIndustry) {
      localStorage.setItem('versacrm_selected_industry', selectedIndustry);
    } else {
        localStorage.removeItem('versacrm_selected_industry');
    }
  }, [selectedIndustry]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const connectIntegration = (name: keyof IntegrationsState) => {
      setIntegrations(prev => ({ ...prev, [name]: true }));
  };

  const disconnectIntegration = (name: keyof IntegrationsState) => {
      setIntegrations(prev => ({ ...prev, [name]: false }));
  };


  const contextValue = useMemo(() => ({
    theme,
    setTheme,
    toggleTheme,
    selectedIndustry,
    setSelectedIndustry,
    integrations,
    connectIntegration,
    disconnectIntegration,
  }), [theme, selectedIndustry, integrations]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};