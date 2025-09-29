
import { useContext } from 'react';
// FIX: The DataContext is now correctly implemented, and this import resolves the module-not-found error.
import { DataContext } from '../contexts/DataContext';

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
