import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, Edit2, Check, Camera, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Checkbox } from '@/components/ui/checkbox.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';

const renderParticipantGroup = (participants, groupTitle, t) => {
  if (!participants || participants.length === 0) return null;
  return (
    <div className="space-y-4 mt-2">
      <h4 className="font-bold text-gray-700">{groupTitle}</h4>
      {participants.map((p, index) => (
        <div key={`${groupTitle}-${index}`} className="p-3 border rounded-lg bg-gray-50">
          <p className="font-semibold flex items-center"><User className="w-4 h-4 mr-2" /> {p.role || groupTitle} #{index + 1}</p>
          <p><strong>{t('form.common.firstName')}:</strong> {p.firstName}</p>
          <p><strong>{t('form.common.lastName')}:</strong> {p.lastName}</p>
          <p><strong>{t('form.common.email')}:</strong> {p.email}</p>
        </div>
      ))}
    </div>
  );
};

function ReviewScreen({ formType, formData, onComplete, onBack, onEdit }) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(formData);
  const formTitle = t(`form.${formType}.title`);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    onEdit(editedData);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedData(formData);
    setIsEditing(false);
  };

  const handleInputChange = (fieldId, value) => {
    setEditedData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleParticipantChange = (index, field, value, participantType) => {
    const updatedParticipants = [...(editedData[participantType] || [])];
    updatedParticipants[index][field] = value;
    handleInputChange(participantType, updatedParticipants);
  };

  const handleFileChange = (fieldId, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleInputChange(fieldId, {
          name: file.name,
          type: file.type,
          dataUrl: reader.result
        });
      };
      reader.readAsDataURL(file);
    } else {
      handleInputChange(fieldId, null);
    }
  };
  
  const formatFieldLabel = (key) => {
    const translationKey = `form.${formType}.${key}_label`;
    const commonKey = `form.common.${key}`;
    const translated = t(translationKey, { defaultValue: t(commonKey, { defaultValue: '' }) });

    if(translated) return translated;

    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/Id$/, 'ID');
  };

  const renderValue = (key, value) => {
    if (['participants', 'releasors', 'additionalParticipants', 'partyA', 'partyB'].includes(key) && Array.isArray(value)) {
      return renderParticipantGroup(value, formatFieldLabel(key), t);
    }
    if (key === 'releasee' && typeof value === 'object' && value !== null) {
      return renderParticipantGroup([value], 'Releasee', t);
    }
    if (key === 'idPhoto' && value && value.dataUrl) {
      return (
        <div className="mt-2">
          <img src={value.dataUrl} alt="ID Preview" className="max-w-full sm:max-w-xs max-h-48 rounded-lg border" />
          <p className="text-sm text-gray-500 mt-1">{value.name}</p>
        </div>
      );
    }
    if (typeof value === 'boolean') {
      return value ? '✓ Yes' : '✗ No';
    }
    if (!value) return <span className="text-gray-400">Not specified</span>;
    return value.toString();
  };

  const renderEditableParticipantGroup = (participants, participantType, label) => {
    return (
      <div className="space-y-4">
        <Label className="font-semibold">{label}</Label>
        {participants.map((p, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-3 bg-gray-50">
            <p className="font-medium flex items-center"><User className="w-4 h-4 mr-2" /> {p.role || label} #{index + 1}</p>
            <div className="space-y-1">
              <Label htmlFor={`firstName-${participantType}-${index}`}>{t('form.common.firstName')}</Label>
              <Input id={`firstName-${participantType}-${index}`} value={p.firstName} onChange={(e) => handleParticipantChange(index, 'firstName', e.target.value, participantType)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`lastName-${participantType}-${index}`}>{t('form.common.lastName')}</Label>
              <Input id={`lastName-${participantType}-${index}`} value={p.lastName} onChange={(e) => handleParticipantChange(index, 'lastName', e.target.value, participantType)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`email-${participantType}-${index}`}>{t('form.common.email')}</Label>
              <Input id={`email-${participantType}-${index}`} type="email" value={p.email} onChange={(e) => handleParticipantChange(index, 'email', e.target.value, participantType)} />
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderEditableField = (key, value, label) => {
     if (key === 'participants') {
        return renderEditableParticipantGroup(value, key, label);
    }

    if (key === 'idPhoto') {
      return (
        <div className="space-y-2">
          <Label>{label}</Label>
          <div className="flex items-center space-x-4">
            <Input
              id={key}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(key, e.target.files[0])}
              className="hidden"
            />
            <Button asChild variant="outline">
              <Label htmlFor={key} className="cursor-pointer flex items-center space-x-2">
                <Camera className="w-4 h-4" />
                <span>{value ? 'Change Photo' : 'Upload Photo'}</span>
              </Label>
            </Button>
            {value && <span className="text-sm text-gray-600 truncate">{value.name}</span>}
          </div>
          {value && value.dataUrl && <img src={value.dataUrl} alt="ID Preview" className="mt-2 max-w-full sm:max-w-xs max-h-32 rounded-lg border" />}
        </div>
      );
    }
    if (typeof formData[key] === 'boolean') {
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={key}
            checked={!!editedData[key]}
            onCheckedChange={(checked) => handleInputChange(key, checked)}
          />
          <Label htmlFor={key} className="text-sm">{label}</Label>
        </div>
      );
    }

    if (key.includes('Terms') || key.includes('Clauses') || key.includes('purpose') || key.includes('description')) {
      return (
        <div className="space-y-2">
          <Label htmlFor={key}>{label}</Label>
          <Textarea
            id={key}
            value={editedData[key] || ''}
            onChange={(e) => handleInputChange(key, e.target.value)}
            className="min-h-[80px]"
          />
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <Label htmlFor={key}>{label}</Label>
        <Input
          id={key}
          value={editedData[key] || ''}
          onChange={(e) => handleInputChange(key, e.target.value)}
          className="h-10"
        />
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-xl p-6 md:p-8"
      >
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-800">
            {t('review.title', { formTitle })}
          </h2>
          {!isEditing && (
            <Button
              variant="outline"
              onClick={handleEdit}
              className="flex items-center space-x-2 w-full sm:w-auto"
            >
              <Edit2 className="w-4 h-4" />
              <span>{t('review.edit')}</span>
            </Button>
          )}
        </div>

        <div className="space-y-6">
          {Object.entries(isEditing ? editedData : formData).map(([key, value]) => {
            if (Array.isArray(value) && value.length === 0) return null;
            if (value === null || value === undefined) return null;
            return (
              <div key={key} className="border-b border-gray-100 pb-4">
                {isEditing ? (
                  renderEditableField(key, value, formatFieldLabel(key))
                ) : (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      {formatFieldLabel(key)}
                    </Label>
                    <div className="mt-1 text-gray-800 break-words">
                      {renderValue(key, value)}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {isEditing && (
          <div className="flex flex-col-reverse sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 mt-6 pt-6 border-t">
            <Button variant="outline" onClick={handleCancelEdit} className="w-full sm:w-auto">
              {t('review.cancel')}
            </Button>
            <Button onClick={handleSaveEdit} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
              <Check className="w-4 h-4 mr-2" />
              {t('review.saveChanges')}
            </Button>
          </div>
        )}

        {!isEditing && (
          <>
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800" dangerouslySetInnerHTML={{ __html: t('review.nextStepNotice')}} />
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-between mt-8 pt-6 border-t gap-4">
              <Button
                variant="outline"
                onClick={onBack}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 h-12 px-6"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t('review.backToForm')}</span>
              </Button>

              <Button
                onClick={onComplete}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 h-12 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                <span>{t('review.reviewAndSign')}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default ReviewScreen;