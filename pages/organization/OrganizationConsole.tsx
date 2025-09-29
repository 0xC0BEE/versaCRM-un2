
import React from 'react';
import { Outlet } from 'react-router-dom';

// This component is now effectively a passthrough for routing.
// The layout and navigation are handled by MainLayout and the new top-level pages.
const OrganizationConsole: React.FC = () => {
  return <Outlet />;
};

export default OrganizationConsole;
