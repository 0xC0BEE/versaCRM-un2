import React from 'react';
import { Navigate } from 'react-router-dom';

const TeamMemberConsole: React.FC = () => {
  // This page is now replaced by the unified /my-tasks page for consistency.
  return <Navigate to="/my-tasks" replace />;
};

export default TeamMemberConsole;