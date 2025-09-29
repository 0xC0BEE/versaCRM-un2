
import { useContext } from 'react';
import { IndustryContext } from '../contexts/IndustryContext';
import { useAuth } from './useAuth';
import { useData } from './useData';
import { Industry } from '../types';

export const useIndustryConfig = () => {
  const context = useContext(IndustryContext);
  const { currentUser } = useAuth();
  const { useOrganization } = useData();

  if (context === undefined) {
    throw new Error('useIndustryConfig must be used within an IndustryProvider');
  }

  // This hook now smartly returns the config for the logged-in user's organization
  const { data: organization } = useOrganization(currentUser?.organizationId);

  if (organization) {
    return context.industryConfigs[organization.industry as Industry];
  }
  
  // Fallback for Super Admin or users without an org
  return null;
};
