
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { INITIAL_INDUSTRY_CONFIG } from '../constants';
import { Industry, IndustryConfig } from '../types';

export interface IndustryContextType {
  industryConfigs: Record<Industry, IndustryConfig>;
  updateIndustrySchema: (industry: Industry, newConfig: IndustryConfig) => void;
}

export const IndustryContext = createContext<IndustryContextType | undefined>(undefined);

export const IndustryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [industryConfigs, setIndustryConfigs] = useState<Record<Industry, IndustryConfig>>(() => {
    try {
        const savedConfigs = localStorage.getItem('versacrm_industry_configs');
        return savedConfigs ? JSON.parse(savedConfigs) : INITIAL_INDUSTRY_CONFIG;
    } catch (error) {
        console.error("Failed to parse industry configs from localStorage", error);
        // FIX: Corrected the typo in the fallback variable name.
        return INITIAL_INDUSTRY_CONFIG;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('versacrm_industry_configs', JSON.stringify(industryConfigs));
    } catch (error) {
      console.error("Failed to save industry configs to localStorage", error);
    }
  }, [industryConfigs]);

  const updateIndustrySchema = useCallback((industry: Industry, newConfig: IndustryConfig) => {
    setIndustryConfigs(prev => ({
      ...prev,
      [industry]: newConfig,
    }));
  }, []);

  return (
    <IndustryContext.Provider value={{ industryConfigs, updateIndustrySchema }}>
      {children}
    </IndustryContext.Provider>
  );
};
