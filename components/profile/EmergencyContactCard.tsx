
import React from 'react';
import { Contact } from '../../types';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Card from '../ui/Card';

const InfoItem: React.FC<{ label: string; value?: string | null; className?: string }> = ({ label, value, className }) => (
    <div className={className}>
        <p className="text-sm text-text-secondary">{label}</p>
        {label === 'Status' ? (
             <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${value === 'Active' ? 'bg-success/10 text-success' : 'bg-yellow-500/10 text-yellow-500'}`}>
                {value}
            </span>
        ) : (
            <p className="font-semibold text-text-default">{value || 'N/A'}</p>
        )}
    </div>
);

interface EmergencyContactCardProps {
    patient: Contact;
    isEditMode: boolean;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const EmergencyContactCard: React.FC<EmergencyContactCardProps> = ({ patient, isEditMode, onInputChange }) => {
    const { emergencyContact, insurance } = patient;

    return (
        <Card title="Emergency Contact & Insurance">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {isEditMode ? (
                    <>
                        <Input label="First Name" name="emergencyContact.firstName" value={emergencyContact?.firstName || ''} onChange={onInputChange} className="md:col-span-2"/>
                        <Input label="Last Name" name="emergencyContact.lastName" value={emergencyContact?.lastName || ''} onChange={onInputChange} className="md:col-span-2"/>
                        <Input label="Insurance Company" name="insurance.provider" value={insurance?.provider || ''} onChange={onInputChange} className="md:col-span-2"/>
                        <Input label="Health Care Card Number" name="insurance.policyNumber" value={insurance?.policyNumber || ''} onChange={onInputChange} className="md:col-span-2"/>
                        <Input label="Primary Phone" name="emergencyContact.phone" value={emergencyContact?.phone || ''} onChange={onInputChange} className="md:col-span-2"/>
                        <Select label="Status" name="insurance.status" value={insurance?.status || 'Inactive'} onChange={onInputChange} className="md:col-span-2">
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </Select>
                    </>
                ) : (
                    <>
                        <InfoItem label="First Name" value={emergencyContact?.firstName} className="md:col-span-2" />
                        <InfoItem label="Last Name" value={emergencyContact?.lastName} className="md:col-span-2"/>
                        <InfoItem label="Insurance Company" value={insurance?.provider} className="md:col-span-2"/>
                        <InfoItem label="Health Care Card Number" value={insurance?.policyNumber} className="md:col-span-2"/>
                        <InfoItem label="Primary Phone" value={emergencyContact?.phone} className="md:col-span-2"/>
                        <InfoItem label="Status" value={insurance?.status} className="md:col-span-2"/>
                    </>
                )}
            </div>
        </Card>
    );
};

export default EmergencyContactCard;