import React from 'react';
import { Contact, IndustryConfig, CustomFieldType, UploadedFile } from '../../types';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Icon from '../ui/Icon';

const InfoItem: React.FC<{ label: string; value?: string | number | null | UploadedFile[] }> = ({ label, value }) => (
    <div>
        <p className="text-sm text-text-secondary">{label}</p>
        {Array.isArray(value) ? (
            <div className="space-y-1 mt-1">
                {value.map(file => (
                    <a key={file.id} href={file.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-2">
                        <Icon name="zap" className="w-4 h-4" /> {file.name}
                    </a>
                ))}
            </div>
        ) : (
            <p className="font-semibold text-text-default">{value || 'N/A'}</p>
        )}
    </div>
);

interface CriticalInfoCardProps {
    patient: Contact;
    isEditMode: boolean;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    onCustomFieldChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    onRemoveFile: (fieldName: string, fileId: string) => void;
    industryConfig: IndustryConfig;
}

const CriticalInfoCard: React.FC<CriticalInfoCardProps> = ({ patient, isEditMode, onInputChange, onCustomFieldChange, onRemoveFile, industryConfig }) => {
    
    const renderField = (field: (typeof industryConfig.schema)[0]) => {
        const fieldName = `customFields.${field.name}`;
        const fieldValue = patient.customFields?.[field.name];

        if (isEditMode) {
            switch(field.type) {
                case CustomFieldType.Text:
                    return <Input key={field.name} label={field.label} name={fieldName} value={fieldValue || ''} onChange={onCustomFieldChange} />;
                case CustomFieldType.Number:
                    return <Input key={field.name} label={field.label} name={fieldName} type="number" value={fieldValue || ''} onChange={onCustomFieldChange} />;
                case CustomFieldType.Date:
                    return <Input key={field.name} label={field.label} name={fieldName} type="date" value={(fieldValue || '').split('T')[0]} onChange={onCustomFieldChange} />;
                case CustomFieldType.Dropdown:
                    return (
                        <Select key={field.name} label={field.label} name={fieldName} value={fieldValue || ''} onChange={onCustomFieldChange}>
                             <option value="">Select...</option>
                            {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </Select>
                    );
                case CustomFieldType.File:
                    const currentFiles: UploadedFile[] = fieldValue || [];
                    return (
                      <div key={field.name}>
                        <Input label={field.label} name={fieldName} type="file" onChange={onCustomFieldChange} multiple />
                         {currentFiles.length > 0 && (
                            <div className="mt-2 space-y-2">
                                {currentFiles.map(file => (
                                    <div key={file.id} className="flex items-center justify-between bg-bg-default p-2 rounded-md text-sm">
                                        <span className="text-text-secondary">{file.name}</span>
                                        <button onClick={() => onRemoveFile(field.name, file.id)} className="text-danger p-1 rounded-full hover:bg-danger/10">
                                            <Icon name="close" className="w-3 h-3"/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                      </div>
                    );
                default:
                    return null;
            }
        }
        return <InfoItem key={field.name} label={field.label} value={fieldValue} />;
    }
    
    return (
        <Card title={`${industryConfig.contactLabel.slice(0,-1)} Information`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                {/* Custom Fields */}
                {industryConfig.schema.map(renderField)}
            </div>
        </Card>
    );
};

export default CriticalInfoCard;