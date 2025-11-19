import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Plus, User, X, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


const ParticipantsField = ({ field, formData, onFormChange, t }) => {
  const participants = formData.participants || [];
  const [activeParticipant, setActiveParticipant] = useState(0);

  const handleInputChange = (fieldId, value) => {
    onFormChange(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleParticipantChange = (index, fieldName, value) => {
    const updatedParticipants = [...participants];
    updatedParticipants[index][fieldName] = value;
    handleInputChange('participants', updatedParticipants);
  };

  const addParticipant = () => {
    const defaultRole = field.roleOptions[0]?.value || 'Participant';
    const newParticipant = { 
      firstName: '', 
      lastName: '', 
      email: '', 
      role: defaultRole
    };
    const newParticipants = [...participants, newParticipant];
    handleInputChange('participants', newParticipants);
    setActiveParticipant(newParticipants.length - 1);
  };

  const removeParticipant = (index) => {
    if (participants.length <= field.min) return;
    const updatedParticipants = participants.filter((_, i) => i !== index);
    handleInputChange('participants', updatedParticipants);
    setActiveParticipant(Math.max(0, index - 1));
  };

  const currentParticipant = participants[activeParticipant] || {};

  return (
    <div className="space-y-4 rounded-lg border bg-gray-50 p-4">
      <div className="flex items-center justify-between">
        <Label className="font-semibold text-gray-700 flex items-center gap-2">
            {t(field.labelKey)}
             <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-400 cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{t(field.descriptionKey)}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </Label>
        {participants.length < (field.max || Infinity) && (
          <Button size="sm" variant="outline" onClick={addParticipant} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> {t('form.common.addParticipant')}
          </Button>
        )}
      </div>
      {participants.length > 0 && (
        <>
          <div className="flex flex-wrap gap-2 border-b pb-2">
            {participants.map((p, index) => (
              <div key={index} className="relative">
                <Button
                  variant={activeParticipant === index ? 'default' : 'secondary'}
                  onClick={() => setActiveParticipant(index)}
                  className={cn("h-9 pl-3 pr-8", activeParticipant === index && "bg-indigo-600 hover:bg-indigo-700")}
                >
                  <User className="mr-2 h-4 w-4" />
                  {t('form.common.participant', {index: index + 1})}
                </Button>
                {participants.length > field.min && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeParticipant(index)}
                    className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-red-500 text-white hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor={`role-${activeParticipant}`}>{t('form.common.role')}</Label>
                <Select onValueChange={(value) => handleParticipantChange(activeParticipant, 'role', value)} value={currentParticipant.role}>
                  <SelectTrigger id={`role-${activeParticipant}`}>
                    <SelectValue placeholder={t('form.common.role')} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.roleOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <p className="font-medium">{t(option.labelKey)}</p>
                          <p className="text-xs text-muted-foreground">{t(option.descriptionKey)}</p>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`firstName-${activeParticipant}`}>{t('form.common.firstName')}</Label>
              <Input id={`firstName-${activeParticipant}`} value={currentParticipant.firstName || ''} onChange={(e) => handleParticipantChange(activeParticipant, 'firstName', e.target.value)} placeholder={t('form.common.firstName')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`lastName-${activeParticipant}`}>{t('form.common.lastName')}</Label>
              <Input id={`lastName-${activeParticipant}`} value={currentParticipant.lastName || ''} onChange={(e) => handleParticipantChange(activeParticipant, 'lastName', e.target.value)} placeholder={t('form.common.lastName')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`email-${activeParticipant}`}>{t('form.common.email')}</Label>
              <Input id={`email-${activeParticipant}`} type="email" value={currentParticipant.email || ''} onChange={(e) => handleParticipantChange(activeParticipant, 'email', e.target.value)} placeholder={t('form.common.email')} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ParticipantsField;