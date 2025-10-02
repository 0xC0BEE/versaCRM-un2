

import React from 'react';
import { Organization } from '../../../types';
import Card from '../../../components/ui/Card';
import { useOutletContext } from 'react-router-dom';

const InteractionsTab: React.FC = () => {
  // FIX: Get organization data from parent route's context.
  const { organization } = useOutletContext<{ organization: Organization }>();
  return (
    <Card title="Contact Interactions">
      <p>Interaction logs for {organization.name}. This feature is under construction.</p>
    </Card>
  );
};

export default InteractionsTab;