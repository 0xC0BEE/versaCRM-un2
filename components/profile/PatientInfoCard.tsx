// components/profile/PatientInfoCard.tsx

import React from 'react';
import { Contact, IndustryConfig, User } from '../../types';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Card from '../ui/Card';

const InfoItem: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => (
    <div>
        <p className="text-sm text-text-secondary">{label}</p>
        <p className="font-semibold text-text-default">{value || 'N/A'}</p>
    </div>
);

interface PatientInfoCardProps {
    patient: Contact;
    isEditMode: boolean;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    teamMembers: User[];
    industryConfig: IndustryConfig;
}

const PatientInfoCard: React.FC<PatientInfoCardProps> = ({ patient, isEditMode, onInputChange, teamMembers, industryConfig }) => {
    
    return (
        <Card title={`${industryConfig.contactLabel.slice(0,-1)} Information`}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {isEditMode ? (
                    <>
                        <Input label="Full Name" name="name" value={patient.name} onChange={onInputChange} />
                        <Input label="Email" name="email" value={patient.email} onChange={onInputChange} />
                        <Input label="Phone" name="phone" value={patient.phone} onChange={onInputChange} />
                        <Input label={industryConfig.fieldLabels.primaryId} name="primaryId" value={patient.primaryId || ''} onChange={onInputChange} />
                    </>
                ) : (
                    <>
                        <InfoItem label="Full Name" value={patient.name} />
                        <InfoItem label="Email" value={patient.email} />
                        <InfoItem label="Phone" value={patient.phone} />
                        <InfoItem label={industryConfig.fieldLabels.primaryId} value={patient.primaryId} />
                    </>
                )}
            </div>
        </Card>
    );
};

export default PatientInfoCard;