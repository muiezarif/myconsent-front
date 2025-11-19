import React from 'react';
import ParticipantsField from './ParticipantsField';
import CheckboxField from './CheckboxField';
import TextareaField from './TextareaField';
import FileField from './FileField';
import DefaultField from './DefaultField';

export const renderField = (field, formData, setFormData, t) => {
  const value = formData[field.id];
  const handleInputChange = (fieldId, value) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };
  const handleFileChange = (fieldId, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleInputChange(fieldId, { name: file.name, type: file.type, dataUrl: reader.result });
      };
      reader.readAsDataURL(file);
    } else {
      handleInputChange(fieldId, null);
    }
  };

  switch (field.type) {
    case 'participants':
      return <ParticipantsField field={field} formData={formData} onFormChange={setFormData} t={t} />;
    case 'checkbox':
      return <CheckboxField field={field} value={value} onInputChange={handleInputChange} t={t} />;
    case 'textarea':
      return <TextareaField field={field} value={value} onInputChange={handleInputChange} t={t} />;
    case 'file':
      return <FileField field={field} value={value} onFileChange={handleFileChange} t={t} />;
    default:
      return <DefaultField field={field} value={value} onInputChange={handleInputChange} t={t} />;
  }
};