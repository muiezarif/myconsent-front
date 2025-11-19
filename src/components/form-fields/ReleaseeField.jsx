import React from 'react';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';

const ReleaseeField = ({ field, formData, onFormChange }) => {
  const releaseeData = formData.releasee || {};

  const handleInputChange = (fieldName, value) => {
    onFormChange(prev => ({
      ...prev,
      releasee: {
        ...prev.releasee,
        [fieldName]: value,
        role: 'Releasee'
      }
    }));
  };

  return (
    <div className="space-y-4 rounded-lg border bg-gray-50 p-4">
      <Label className="font-semibold text-gray-700">{field.label}</Label>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="releaseeName">Name</Label>
          <Input
            id="releaseeName"
            value={releaseeData.name || ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter releasee's name or company"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="releaseeEmail">Email</Label>
          <Input
            id="releaseeEmail"
            type="email"
            value={releaseeData.email || ''}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Enter releasee's email"
          />
        </div>
      </div>
    </div>
  );
};

export default ReleaseeField;