import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Camera, FileImage } from 'lucide-react';

const FileField = ({ field, value, onFileChange }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={field.id}>{field.label}</Label>
      <div className="flex items-center space-x-4">
        <Input
          id={field.id}
          type="file"
          accept="image/*"
          onChange={(e) => onFileChange(field.id, e.target.files[0])}
          className="hidden"
        />
        <Button asChild variant="outline">
          <Label htmlFor={field.id} className="cursor-pointer flex items-center space-x-2">
            <Camera className="w-4 h-4" />
            <span>{value ? 'Change Photo' : 'Upload Photo'}</span>
          </Label>
        </Button>
        {value && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <FileImage className="w-4 h-4 text-green-500" />
            <span>{value.name}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileField;