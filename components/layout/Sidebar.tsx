import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { SIDEBAR_LINKS } from '../../constants';
import Icon from '../ui/Icon';
import { useIndustryConfig } from '../../hooks/useIndustryConfig';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { currentUser } = useAuth();
  const industryConfig = useIndustryConfig();

  if (!currentUser) return null;

  const links = SIDEBAR_LINKS[currentUser.role] || [];
  
  // Dynamically update the contact link label
  const dynamicLinks = links.map(link => {
      // FIX: Handle the case where industryConfig is null during initial loading.
      if (link.path === '/contacts') {
          // Provide a fallback name to prevent a crash.
          return { ...link, name: industryConfig?.contactLabel || 'Contacts' };
      }
      return link;
  });

  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      ></div>
    
      <aside className={`fixed lg:relative z-30 w-64 bg-bg-card h-full flex-shrink-0 flex flex-col border-r border-border-default transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-4 border-b border-border-default flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="bg-primary p-2 rounded-lg">
                <Icon name="logo" className="text-white"/>
            </div>
            <h1 className="text-xl font-bold text-text-default">VersaCRM</h1>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-text-secondary">
             <Icon name="close"/>
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {dynamicLinks.map(link => (
            <NavLink
              key={link.name}
              to={link.path}
              end={link.path === '/dashboard'}
              onClick={() => setIsOpen(false)} // Close on mobile nav click
              className={({ isActive }) =>
                `flex items-center px-4 py-2.5 rounded-lg transition-colors duration-200 text-sm font-medium ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-text-secondary hover:bg-bg-default hover:text-text-default'
                }`
              }
            >
              <Icon name={link.icon as any} className="mr-3" />
              <span>{link.name}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-border-default">
            <p className="text-xs text-text-secondary">&copy; 2024 VersaCRM. All rights reserved.</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;