import React from 'react';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';

const DefaultField = ({ field, value, onInputChange, t }) => {
  const label = t(field.labelKey);
  return (
    <div className="space-y-2">
      <Label htmlFor={field.id}>{label}</Label>
      <Input
        id={field.id}
        type={field.type}
        value={value || ''}
        onChange={(e) => onInputChange(field.id, e.target.value)}
        className="h-12"
        placeholder={`Enter ${label.toLowerCase()}`}
      />
    </div>
  );
};

export default DefaultField;