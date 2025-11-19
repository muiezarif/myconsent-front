import React, { useState, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, User, CheckCircle, Edit, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { toast } from '@/components/ui/use-toast';
import SignatureCanvas from '@/components/SignatureCanvas.jsx';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const AgreementTextRenderer = ({ formType }) => {
    const { t } = useTranslation();
    const paragraphs = [];
    let i = 1;
    while (t(`agreements.${formType}.p${i}`, { defaultValue: '' })) {
        paragraphs.push(<p key={i} dangerouslySetInnerHTML={{ __html: t(`agreements.${formType}.p${i}`) }} />);
        i++;
    }
    return <div className="prose prose-sm max-w-none space-y-4 text-gray-700">{paragraphs}</div>;
};

function AgreementScreen({ formType, formData, onComplete, onBack }) {
    const { t } = useTranslation();
    const participants = useMemo(() => {
        return (formData.participants || []).filter(p => p && (p.firstName || p.name));
    }, [formData]);
    
    const signatureRefs = useRef(participants.map(() => React.createRef()));
    
    const [signatures, setSignatures] = useState(participants.map(() => null));
    const [signatureDate, setSignatureDate] = useState(new Date().toISOString().split('T')[0]);
    const [activeSignerIndex, setActiveSignerIndex] = useState(null);

    useEffect(() => {
        if (!formType) {
            onBack();
        }
    }, [formType, onBack]);

    if (!formType) {
        return null;
    }

    const title = t(`agreements.${formType}.title`);

    const handleSaveSignature = () => {
        if (activeSignerIndex === null) return;
        const sigRef = signatureRefs.current[activeSignerIndex];
        if (sigRef.current && !sigRef.current.isEmpty()) {
            const newSignatures = [...signatures];
            newSignatures[activeSignerIndex] = sigRef.current.toDataURL('image/png');
            setSignatures(newSignatures);
        }
        setActiveSignerIndex(null);
    };

    const handleComplete = () => {
        if (signatures.some(s => s === null)) {
            toast({
                title: t('agreement.toast.sigRequiredTitle'),
                description: t('agreement.toast.sigRequiredDesc'),
                variant: "destructive"
            });
            return;
        }
        
        const signatureData = {
            signatures: participants.map((p, i) => ({
                ...p,
                signature: signatures[i]
            })),
            date: signatureDate
        };

        onComplete(signatureData);
    };

    const renderSignaturePad = () => {
        if (activeSignerIndex === null) return null;

        const sigRef = signatureRefs.current[activeSignerIndex];
        const participant = participants[activeSignerIndex];
        const name = `${participant.firstName || ''} ${participant.lastName || ''}`.trim();

        return (
            <motion.div
                key={activeSignerIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 border-t"
            >
                <h4 className="font-semibold text-center mb-2">{t('agreement.signatureFor', { name, role: participant.role })}</h4>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 sm:p-4 bg-gray-50">
                    <SignatureCanvas
                        signatureRef={sigRef}
                        onBegin={() => { }}
                        onEnd={() => { }}
                    />
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setActiveSignerIndex(null)} className="w-full sm:w-auto">{t('agreement.cancel')}</Button>
                    <Button onClick={handleSaveSignature} className="w-full sm:w-auto">{t('agreement.saveSignature')}</Button>
                </div>
            </motion.div>
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
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 text-center flex-grow">
                {title}
            </h2>
        </div>
        
        <div className="mb-8">
            <Accordion type="single" collapsible className="w-full border rounded-lg px-2 sm:px-4 bg-gray-50">
                <AccordionItem value="item-1">
                    <AccordionTrigger>
                        <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4" />
                            <span>{t('agreement.viewFull')}</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <AgreementTextRenderer formType={formType} />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>

        <div className="mt-8 pt-6 border-t">
          <h3 className="text-xl font-bold text-gray-800 mb-4">{t('agreement.signaturesTitle')}</h3>
          <p className="text-sm text-gray-600 mb-6">{t('agreement.signaturesDesc')}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {participants.map((p, index) => (
                <div key={index} className={cn("p-4 border rounded-lg", activeSignerIndex === index && 'ring-2 ring-indigo-500')}>
                <Label className="font-semibold text-gray-700 flex items-center justify-between">
                  <span>{p.role}</span>
                  {signatures[index] && <CheckCircle className="w-5 h-5 text-green-600" />}
                </Label>
                <div className="mt-2 p-3 bg-gray-100 rounded-lg flex items-center text-sm">
                  <User className="w-5 h-5 mr-3 text-gray-500" />
                  <span className="font-medium truncate">{`${p.firstName || ''} ${p.lastName || ''}`.trim()}</span>
                </div>
                {signatures[index] ? (
                  <div className="mt-2 text-center">
                    <img src={signatures[index]} alt={`${p.role} Signature`} className="mx-auto h-16 bg-white border rounded-md" />
                    <Button variant="link" className="text-xs h-auto p-1" onClick={() => setActiveSignerIndex(index)}>{t('agreement.editSignature')}</Button>
                  </div>
                ) : (
                  <Button className="w-full mt-3" onClick={() => setActiveSignerIndex(index)}>
                    <Edit className="w-4 h-4 mr-2" /> {t('agreement.signHere')}
                  </Button>
                )}
              </div>
            ))}
          </div>
          
          <AnimatePresence>
            {renderSignaturePad()}
          </AnimatePresence>

          <div className="mt-6 space-y-2">
            <Label htmlFor="signatureDate" className="text-lg font-medium text-gray-700">{t('agreement.dateLabel')}</Label>
            <Input id="signatureDate" type="date" value={signatureDate} onChange={(e) => setSignatureDate(e.target.value)} className="h-12" />
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-between mt-8 pt-6 border-t gap-4">
          <Button variant="outline" onClick={onBack} className="w-full sm:w-auto flex items-center justify-center space-x-2 h-12 px-6">
            <ArrowLeft className="w-4 h-4" />
            <span>{t('agreement.backToReview')}</span>
          </Button>

          <Button
            onClick={handleComplete}
            disabled={signatures.some(s => s === null)}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 h-12 px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            <span>{t('agreement.agreeAndComplete')}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

AgreementScreen.getAgreementTextComponent = (formType) => {
    const AgreementTextComponent = () => {
        const { t } = useTranslation();
        const paragraphs = [];
        let i = 1;
        while (t(`agreements.${formType}.p${i}`, { defaultValue: '' })) {
            paragraphs.push(<p key={i} dangerouslySetInnerHTML={{ __html: t(`agreements.${formType}.p${i}`) }} />);
            i++;
        }
        return <div className="prose prose-sm max-w-none space-y-4 text-gray-700">{paragraphs}</div>;
    }
    return AgreementTextComponent;
};

export default AgreementScreen;