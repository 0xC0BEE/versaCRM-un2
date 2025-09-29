import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useAppContext } from '../../hooks/useAppContext';
import Icon from '../ui/Icon';
import { useData } from '../../hooks/useData';
import NotificationPanel from './NotificationPanel';
import { UserRole, Industry } from '../../types';
import Select from '../ui/Select';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme, selectedIndustry, setSelectedIndustry } = useAppContext();
  const { useAlerts } = useData();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  const { data: alerts } = useAlerts(currentUser?.id);
  const unreadCount = alerts?.filter(a => !a.read).length || 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-bg-card shadow-sm p-4 flex justify-between items-center z-10 border-b border-border-default">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden text-text-secondary hover:text-text-default"
          aria-label="Toggle sidebar"
        >
          <Icon name="menu" />
        </button>
        <div className="relative hidden sm:block">
           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="search" className="text-text-secondary" />
           </div>
          <input
            type="text"
            placeholder="Search..."
            className="bg-bg-default rounded-md pl-10 pr-4 py-2 w-64 focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        {currentUser?.role === UserRole.SuperAdmin && (
            <div className="hidden sm:block">
              <Select 
                value={selectedIndustry || ''} 
                onChange={(e) => setSelectedIndustry(e.target.value || null)}
                className="text-sm w-48"
              >
                <option value="">Filter by Industry...</option>
                {Object.values(Industry).map(ind => <option key={ind} value={ind}>{ind}</option>)}
              </Select>
            </div>
          )}

        <button onClick={toggleTheme} className="p-2 rounded-full text-text-secondary hover:bg-bg-default" aria-label="Toggle theme">
          <Icon name={theme === 'light' ? 'moon' : 'sun'} />
        </button>
        
        <div className="relative" ref={notificationRef}>
            <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 rounded-full text-text-secondary hover:bg-bg-default relative" 
                aria-label="Notifications"
            >
                <Icon name="bell" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-danger ring-2 ring-bg-card"/>
                )}
            </button>
            {isNotificationsOpen && (
                <NotificationPanel 
                    alerts={alerts || []} 
                    onClose={() => setIsNotificationsOpen(false)} 
                />
            )}
        </div>

        <div className="relative" ref={profileRef}>
          <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                {currentUser?.name.charAt(0)}
            </div>
            <div className="hidden md:block text-left">
                <p className="font-semibold text-sm">{currentUser?.name}</p>
                <p className="text-xs text-text-secondary">{currentUser?.role}</p>
            </div>
            <Icon name="chevronDown" className={`transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-bg-card rounded-md shadow-lg border border-border-default py-1">
              <a href="#/settings" className="block px-4 py-2 text-sm text-text-default hover:bg-bg-default">Profile</a>
              <a href="#/settings" className="block px-4 py-2 text-sm text-text-default hover:bg-bg-default">Settings</a>
              <div className="border-t border-border-default my-1"></div>
              <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-bg-default flex items-center gap-2">
                <Icon name="logout" className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;