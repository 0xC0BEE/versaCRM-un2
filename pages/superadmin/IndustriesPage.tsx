
import React, { useState, useContext } from 'react';
import Card from '../../components/ui/Card';
import { IndustryContext } from '../../contexts/IndustryContext';
import { Industry, CustomField, CustomFieldType, IndustryConfig } from '../../types';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';
import CustomFieldEditorModal from '../../components/modals/CustomFieldEditorModal';

const IndustriesPage: React.FC = () => {
  const industryContext = useContext(IndustryContext);
  if (!industryContext) {
    return <div>Loading Industry Context...</div>;
  }
  const { industryConfigs, updateIndustrySchema } = industryContext;

  const [selectedIndustry, setSelectedIndustry] = useState<Industry>(Industry.Healthcare);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | null>(null);

  const currentConfig = industryConfigs[selectedIndustry];

  const handleAddField = () => {
      setEditingField(null);
      setIsModalOpen(true);
  };

  const handleEditField = (field: CustomField) => {
      setEditingField(field);
      setIsModalOpen(true);
  };

  const handleSaveField = (field: CustomField) => {
    const newSchema = editingField
      ? currentConfig.schema.map(f => (f.name === editingField.name ? field : f))
      : [...currentConfig.schema, field];
    
    updateIndustrySchema(selectedIndustry, { ...currentConfig, schema: newSchema });
    setIsModalOpen(false);
  };

  const handleDeleteField = (fieldName: string) => {
    if (window.confirm('Are you sure you want to delete this field? This may affect existing contact data.')) {
        const newSchema = currentConfig.schema.filter(f => f.name !== fieldName);
        updateIndustrySchema(selectedIndustry, { ...currentConfig, schema: newSchema });
    }
  };


  return (
    <>
    <Card 
        title="Custom Objects Builder"
        actions={<Button onClick={handleAddField}><Icon name="plus" /> Add Field</Button>}
    >
        <div className="mb-6">
            <Select label="Select Industry to Configure" value={selectedIndustry} onChange={e => setSelectedIndustry(e.target.value as Industry)}>
                {Object.keys(industryConfigs).map(key => (
                    <option key={key} value={key}>{industryConfigs[key as Industry].label}</option>
                ))}
            </Select>
        </div>

        <div className="overflow-x-auto -m-6">
          <table className="min-w-full">
            <thead className="bg-bg-default">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Field Label</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Field Name (ID)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-bg-card divide-y divide-border-default">
              {currentConfig.schema.map(field => (
                <tr key={field.name}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{field.label}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary font-mono">{field.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{field.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end items-center gap-2">
                        <button onClick={() => handleEditField(field)} className="p-1 text-secondary hover:text-primary"><Icon name="edit" /></button>
                        <button onClick={() => handleDeleteField(field.name)} className="p-1 text-secondary hover:text-danger"><Icon name="trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    </Card>
    {isModalOpen && (
        <CustomFieldEditorModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveField}
            field={editingField}
        />
    )}
    </>
  );
};

export default IndustriesPage;
