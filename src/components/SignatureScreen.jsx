import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { toast } from '@/components/ui/use-toast';
import SignatureCanvas from '@/components/SignatureCanvas';

function SignatureScreen({ onComplete, onBack }) {
  const { t } = useTranslation();
  const sigRef = useRef(null);
  const [signatureDate, setSignatureDate] = useState(new Date().toISOString().split('T')[0]);
  const [hasSignature, setHasSignature] = useState(false);

  const handleComplete = () => {
    if (sigRef.current.isEmpty()) {
      toast({
        title: t('signature.toast.sigRequiredTitle'),
        description: t('signature.toast.sigRequiredDesc'),
        variant: "destructive"
      });
      return;
    }

    if (!signatureDate) {
      toast({
        title: t('signature.toast.dateRequiredTitle'),
        description: t('signature.toast.dateRequiredDesc'),
        variant: "destructive"
      });
      return;
    }
    
    onComplete({
      signature: sigRef.current.toDataURL(),
      date: signatureDate
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-xl p-6 md:p-8"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {t('signature.title')}
        </h2>

        <div className="space-y-6">
          <div>
            <Label className="text-lg font-medium text-gray-700 mb-4 block">
              {t('signature.digitalSignatureLabel')}
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 sm:p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 flex items-center">
                  <PenTool className="w-4 h-4 mr-2" />
                  {t('signature.signaturePadHint')}
                </span>
              </div>
              <SignatureCanvas
                signatureRef={sigRef}
                onBegin={() => setHasSignature(true)}
                onEnd={() => setHasSignature(!sigRef.current.isEmpty())}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="signatureDate" className="text-lg font-medium text-gray-700">
              {t('signature.dateLabel')}
            </Label>
            <Input
              id="signatureDate"
              type="date"
              value={signatureDate}
              onChange={(e) => setSignatureDate(e.target.value)}
              className="h-12"
            />
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800" dangerouslySetInnerHTML={{ __html: t('signature.legalNotice') }} />
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-between mt-8 pt-6 border-t gap-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 h-12 px-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('signature.backToReview')}</span>
          </Button>

          <Button
            onClick={handleComplete}
            disabled={!hasSignature}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 h-12 px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            <span>{t('signature.completeForm')}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default SignatureScreen;