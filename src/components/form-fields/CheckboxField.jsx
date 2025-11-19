import React from 'react';
import { Checkbox } from '@/components/ui/checkbox.jsx';
import { Label } from '@/components/ui/label.jsx';

const CheckboxField = ({ field, value, onInputChange, t }) => {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={field.id}
        checked={!!value}
        onCheckedChange={(checked) => onInputChange(field.id, checked)}
      />
      <Label htmlFor={field.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {t(field.labelKey)}
      </Label>
    </div>
  );
};

export default CheckboxField;