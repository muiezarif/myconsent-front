import React from 'react';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Label } from '@/components/ui/label.jsx';

const TextareaField = ({ field, value, onInputChange, t }) => {
  const label = t(field.labelKey);
  return (
    <div className="space-y-2">
      <Label htmlFor={field.id}>{label}</Label>
      <Textarea
        id={field.id}
        value={value || ''}
        onChange={(e) => onInputChange(field.id, e.target.value)}
        className="min-h-[100px]"
        placeholder={label}
      />
    </div>
  );
};

export default TextareaField;