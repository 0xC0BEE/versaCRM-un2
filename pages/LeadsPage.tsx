
import React from 'react';
import Card from '../components/ui/Card';
import { Link } from 'react-router-dom';

const LeadsPage: React.FC = () => {
  return (
    <Card title="Leads">
        <div className="text-center p-8">
            <h2 className="text-xl font-semibold mb-2">Lead management has moved!</h2>
            <p className="text-text-secondary mb-4">
                We've upgraded our lead management to a powerful new pipeline view.
            </p>
            <Link 
                to="/deals" 
                className="inline-block px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
                Go to Deals Pipeline
            </Link>
        </div>
    </Card>
  );
};

export default LeadsPage;