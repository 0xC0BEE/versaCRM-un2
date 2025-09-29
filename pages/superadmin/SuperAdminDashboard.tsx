import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAppContext } from '../../hooks/useAppContext';
import { useData } from '../../hooks/useData';
import StatCard from '../../components/dashboard/StatCard';
import Icon from '../../components/ui/Icon';
import Spinner from '../../components/ui/Spinner';
import { INITIAL_INDUSTRY_CONFIG } from '../../constants';
import { Industry } from '../../types';

const SuperAdminDashboard: React.FC = () => {
  const { selectedIndustry } = useAppContext();
  const { useOrganizations } = useData();

  // Safety Check 1: Handle the case where no industry is selected yet.
  if (!selectedIndustry) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-bg-card rounded-lg shadow-md border border-border-default">
        <Icon name="building" className="w-12 h-12 text-primary mb-4" />
        <h2 className="text-2xl font-semibold mb-4">Welcome, Super Admin</h2>
        <p className="text-text-secondary">Please select an industry from the header dropdown to view its dashboard.</p>
      </div>
    );
  }

  const industryConfig = INITIAL_INDUSTRY_CONFIG[selectedIndustry as Industry];

  // Safety Check 2: Handle invalid industry values from localStorage.
  if (!industryConfig) {
      return (
          <div className="p-8 bg-bg-card rounded-lg shadow-md border border-danger">
              <h2 className="text-2xl font-semibold mb-4 text-danger">Invalid Industry Selected</h2>
              <p className="text-text-secondary">The industry ('{selectedIndustry}') is not valid. Please select a valid industry from the header.</p>
          </div>
      );
  }
  
  const { data: organizations, isLoading } = useOrganizations({ industry: selectedIndustry });
  
  const chartData = organizations?.map(org => ({
      name: org.name,
      contacts: org.contactCount,
      revenue: Math.floor(org.contactCount * (Math.random() * 500 + 100)) // Estimated revenue
  })) || [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        {industryConfig.icon} {industryConfig.label} Industry Dashboard
      </h1>
      
      {isLoading ? <Spinner /> : (
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard title="Total Organizations" value={organizations?.length || 0} icon="building" />
            <StatCard title="Total Contacts" value={organizations?.reduce((acc, org) => acc + org.contactCount, 0) || 0} icon="users" />
            <StatCard title="Total Revenue (Est.)" value={`$${(chartData.reduce((acc, d) => acc + d.revenue, 0) / 1000).toFixed(1)}k`} icon="chart" />
        </div>
        
        <div className="bg-bg-card p-6 rounded-lg shadow-md border border-border-default">
            <h2 className="text-xl font-semibold mb-4">Performance by Organization</h2>
            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="var(--color-primary)" />
                    <YAxis yAxisId="right" orientation="right" stroke="var(--color-success)" />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="contacts" fill="var(--color-primary)" name="Active Contacts"/>
                    <Bar yAxisId="right" dataKey="revenue" fill="var(--color-success)" name="Est. Monthly Revenue"/>
                </BarChart>
            </ResponsiveContainer>
        </div>
        </>
      )}
    </div>
  );
};

export default SuperAdminDashboard;