
import React, { useState, FormEvent, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { mockUsers } from '../data/mockData';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (currentUser) {
      navigate(from, { replace: true });
    }
  }, [currentUser, navigate, from]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const user = await login(email);
    if (user) {
      navigate(from, { replace: true });
    } else {
      setError('Invalid email. Please use one from the list.');
    }
    setIsLoading(false);
  };
  
  const handleQuickLogin = async (loginEmail: string) => {
    setEmail(loginEmail);
    setIsLoading(true);
    setError('');
    const user = await login(loginEmail);
     if (user) {
      navigate(from, { replace: true });
    }
    setIsLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-default p-4">
      <div className="max-w-4xl w-full mx-auto bg-bg-card rounded-xl shadow-lg border border-border-default grid grid-cols-1 md:grid-cols-2">
        <div className="p-8">
            <div className="flex items-center gap-2 mb-6">
                <div className="bg-primary p-2 rounded-lg">
                    <Icon name="logo" className="text-white"/>
                </div>
                <h1 className="text-2xl font-bold text-text-default">VersaCRM</h1>
            </div>
            <h2 className="text-xl font-semibold text-text-default mb-2">Welcome Back!</h2>
            <p className="text-text-secondary mb-6">Log in or select a user to continue.</p>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-secondary">Email Address</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 w-full px-3 py-2 border border-border-default rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-bg-card"
                />
              </div>
              {error && <p className="text-danger text-sm">{error}</p>}
              <Button type="submit" isLoading={isLoading} className="w-full">
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
        </div>
        <div className="bg-bg-default rounded-r-xl p-8">
            <h2 className="text-lg font-semibold mb-4 text-text-default">Quick Logins</h2>
            <div className="space-y-2">
                {mockUsers.map(user => (
                    <button 
                        key={user.id}
                        onClick={() => handleQuickLogin(user.email)}
                        className="w-full text-left p-3 rounded-lg hover:bg-bg-card transition-colors border border-transparent hover:border-border-default"
                    >
                        <p className="font-semibold text-text-default">{user.name}</p>
                        <p className="text-sm text-text-secondary">{user.email} - ({user.role})</p>
                    </button>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;