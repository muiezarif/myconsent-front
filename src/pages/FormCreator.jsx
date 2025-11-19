import React, { useState, Suspense, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import WelcomeScreen from '@/components/WelcomeScreen';
import FormBuilder from '@/components/FormBuilder';
import ReviewScreen from '@/components/ReviewScreen';
import SignatureScreen from '@/components/SignatureScreen';
import AgreementScreen from '@/components/AgreementScreen';
import DonationScreen from '@/components/DonationScreen';
import ExportScreen from '@/components/ExportScreen';
import { formSteps } from '@/config/form-steps';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { agreements } from '@/config/agreements.js';
import api from '@/api/myconsent.js'; // ✅ backend client
import { generatePdf } from '../lib/pdfGenerator';

function FormCreator() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState('welcome');
  const [selectedFormType, setSelectedFormType] = useState('');
  const [selectedFormTitle, setSelectedFormTitle] = useState('');
  const [customAgreementContent, setCustomAgreementContent] = useState(null);
  const [formData, setFormData] = useState({});
  const [signatures, setSignatures] = useState({});
  const [userTemplates, setUserTemplates] = useState([]);

  useEffect(() => {
    if (user) {
      const storedTemplates = JSON.parse(localStorage.getItem(`userTemplates_${user.id}`)) || [];
      setUserTemplates(storedTemplates);
    } else {
      setUserTemplates([]);
    }
  }, [user]);

  useEffect(() => {
    if (location.state?.templateId) {
      const { templateId, templateName } = location.state;
      handleFormTypeSelect(templateId, templateName);
      window.history.replaceState({}, document.title);
    }
  }, [location, user]);

  const handleFormTypeSelect = (formType, formTitle) => {
    setSelectedFormType(formType);
    setSelectedFormTitle(formTitle);

    let initialData = {
      participants: [{ firstName: '', lastName: '', email: '', role: 'Releasor' }],
    };
    
    if (formType.startsWith('custom_')) {
      const template = userTemplates.find(t => t.id === formType);
      if (!template) {
        const storedTemplates = JSON.parse(localStorage.getItem(`userTemplates_${user.id}`)) || [];
        const foundTemplate = storedTemplates.find(t => t.id === formType);
        if (foundTemplate) {
          setCustomAgreementContent(foundTemplate.content);
        }
      } else {
        setCustomAgreementContent(template.content);
      }
      initialData.participants.push({ firstName: '', lastName: '', email: '', role: 'Releasee' });
    } else if (formSteps[formType]) {
      const firstStep = formSteps[formType][0];
      const participantField = firstStep.fields.find(f => f.type === 'participants');
      if (participantField && participantField.defaultParticipants) {
        initialData.participants = participantField.defaultParticipants;
      } else {
        initialData.participants.push({ firstName: '', lastName: '', email: '', role: 'Releasee' });
      }
    } else {
      initialData.participants.push({ firstName: '', lastName: '', email: '', role: 'Releasee' });
    }
    
    setFormData(initialData);
    setSignatures({});
    setCurrentStep('builder');
  };

  const handleFormComplete = (data) => {
    setFormData(data);
    setCurrentStep('review');
  };

  const handleReviewComplete = () => {
    setCurrentStep('agreement');
  };

  const handleAgreementComplete = (signatureData) => {
    setSignatures(signatureData);
    setCurrentStep('donation');
  };

  const handleDonationComplete = () => {
    setCurrentStep('export');
  };

  const handleSignatureComplete = (signatureData) => {
    setSignatures({ participant: signatureData });
    setCurrentStep('donation');
  };

  const handleStartOver = () => {
    setCurrentStep('welcome');
    setSelectedFormType('');
    setSelectedFormTitle('');
    setCustomAgreementContent(null);
    setFormData({});
    setSignatures({});
  };

const handleSaveDocument = async () => {
  if (!user) return;

  // 1. Build a human title
  let title;
  if (selectedFormType.startsWith('custom_')) {
    title = selectedFormTitle || 'Custom Agreement';
  } else {
    title = t(`form.${selectedFormType}.title`);
  }

  // 2. Build payload (metadata you want to keep)
  const payload = {
    formType: selectedFormType,
    formTitle: title,
    formData,
    signatures,
    customAgreementContent,
  };

  // 3. Generate the same PDF used for download
  const pdfBlob = await generatePdf(selectedFormType, formData, signatures, t, true);
  const fileName = `${title.replace(/\s+/g, '-')}.pdf`;

  // 4. Create FormData and POST to /contracts/upload
  const formDataToSend = new FormData();
  formDataToSend.append('file', pdfBlob, fileName);
  formDataToSend.append('title', title);
  formDataToSend.append('payload', JSON.stringify(payload));

  const { data } = await api.post('/contracts/upload', formDataToSend, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  console.log('contracts/upload response:', data);
  return data;
};


  const getAgreementForType = (formType) => {
    if (formType.startsWith('custom_')) {
      return customAgreementContent ? { title: selectedFormTitle, rawContent: customAgreementContent } : null;
    }
    const lang = i18n.language;
    return agreements[lang]?.[formType] || agreements['en']?.[formType];
  };

  const renderCurrentStep = () => {
    const agreement = getAgreementForType(selectedFormType);
    const builderType = formSteps[selectedFormType] ? selectedFormType : 'general-consent';

    switch (currentStep) {
      case 'welcome':
        return <WelcomeScreen onFormTypeSelect={handleFormTypeSelect} userTemplates={userTemplates} />;
      case 'builder':
        return (
          <FormBuilder
            formType={builderType}
            onComplete={handleFormComplete}
            onBack={handleStartOver}
            initialData={formData}
          />
        );
      case 'review':
        return (
          <ReviewScreen
            formType={selectedFormType}
            formData={formData}
            onComplete={handleReviewComplete}
            onBack={() => setCurrentStep('builder')}
            onEdit={(data) => setFormData(data)}
            agreementContent={agreement}
          />
        );
      case 'agreement':
        return (
          <AgreementScreen
            formType={selectedFormType}
            formData={formData}
            onComplete={handleAgreementComplete}
            onBack={() => setCurrentStep('review')}
            agreementContent={agreement}
          />
        );
      case 'signature':
        return (
          <SignatureScreen
            onComplete={handleSignatureComplete}
            onBack={() => setCurrentStep('review')}
          />
        );
      case 'donation':
        return <DonationScreen onComplete={handleDonationComplete} />;
      case 'export':
        return (
          <ExportScreen
            formType={selectedFormType}
            formData={formData}
            signatures={signatures}
            onStartOver={handleStartOver}
            onSaveDocument={handleSaveDocument} // ✅ now async + backend
            agreementContent={agreement}
          />
        );
      default:
        return <WelcomeScreen onFormTypeSelect={handleFormTypeSelect} userTemplates={userTemplates} />;
    }
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderCurrentStep()}
        </motion.div>
      </AnimatePresence>
    </Suspense>
  );
}

export default FormCreator;
