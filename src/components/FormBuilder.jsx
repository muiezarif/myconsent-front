import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formSteps } from '@/config/form-steps.js';
import { renderField } from '@/components/form-fields/renderField.jsx';

/**
 * Props:
 * - formType
 * - onComplete(formData)
 * - onBack()
 * - initialData
 * - onChange(formData)       -> called whenever user types
 * - onStepCommit(index, data)-> called when user clicks Next / Review for a step
 */
function FormBuilder({ formType, onComplete, onBack, initialData, onChange, onStepCommit }) {
  const { t } = useTranslation();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState(initialData);

  const steps = formSteps[formType] || [];
  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;

  // Notify parent on any change (for UI / preview / saving)
  useEffect(() => {
    if (onChange) {
      onChange(formData);
    }
  }, [formData, onChange]);

  const handleNext = () => {
    const dataForStep = formData;

    // 🔔 Inform parent that this step is "committed"
    if (onStepCommit) {
      onStepCommit(currentStepIndex, dataForStep);
    }

    if (isLastStep) {
      onComplete(dataForStep);
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    } else {
      onBack();
    }
  };

  if (!currentStep) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <p className="text-gray-600">
            {t('formBuilder.noSteps', 'No steps configured for this form type.')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">
            {t('formBuilder.step', { current: currentStepIndex + 1, total: steps.length })}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(((currentStepIndex + 1) / steps.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full"
            initial={{ width: `${(currentStepIndex / steps.length) * 100}%` }}
            animate={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </div>
      </div>

      <motion.div
        key={currentStepIndex}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-xl p-6 md:p-8"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {t(currentStep.titleKey)}
        </h2>

        <div className="space-y-6">
          {currentStep.fields.map((field) => (
            <div key={field.id}>
              {renderField(field, formData, setFormData, t)}
            </div>
          ))}
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-between mt-8 pt-6 border-top gap-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 h-12 px-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('formBuilder.back')}</span>
          </Button>

          <Button
            onClick={handleNext}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 h-12 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            <span>{isLastStep ? t('formBuilder.reviewForm') : t('formBuilder.next')}</span>
            {isLastStep ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default FormBuilder;
