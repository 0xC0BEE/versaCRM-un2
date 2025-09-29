
// components/profile/BillingInfoCard.tsx

import React from 'react';
import { Contact } from '../../types';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Card from '../ui/Card';

const InfoItem: React.FC<{ label: string; value?: string | number | null }> = ({ label, value }) => (
    <div>
        <p className="text-sm text-text-secondary">{label}</p>
        <p className="font-semibold text-text-default">{typeof value === 'number' ? `$${value.toFixed(2)}` : value || 'N/A'}</p>
    </div>
);

interface BillingInfoCardProps {
  patient: Contact;
  isEditMode: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const BillingInfoCard: React.FC<BillingInfoCardProps> = ({ patient, isEditMode, onInputChange }) => {
  const { billingInfo } = patient;

  return (
    <Card title="Billing Information">
      <div className="space-y-4">
        {isEditMode ? (
            <>
                <Input label="Account Balance" name="billingInfo.accountBalance" type="number" value={billingInfo.accountBalance} onChange={onInputChange} />
                <Select label="Payment Method" name="billingInfo.paymentMethod" value={billingInfo.paymentMethod} onChange={onInputChange}>
                    <option value="Unspecified">Unspecified</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                </Select>
                <Input label="Next Billing Date" name="billingInfo.nextBillingDate" type="date" value={billingInfo.nextBillingDate?.split('T')[0] || ''} onChange={onInputChange} />
            </>
        ) : (
            <>
                <InfoItem label="Account Balance" value={billingInfo.accountBalance} />
                <InfoItem label="Payment Method" value={billingInfo.paymentMethod} />
                <InfoItem label="Next Billing Date" value={billingInfo.nextBillingDate ? new Date(billingInfo.nextBillingDate).toLocaleDateString() : 'N/A'} />
            </>
        )}
      </div>
    </Card>
  );
};

export default BillingInfoCard;
