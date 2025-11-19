import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Download, RotateCcw, CheckCircle, Eye, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { generatePdf } from '@/lib/pdfGenerator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import FormPreview from '@/components/FormPreview';
import { useAuth } from '@/contexts/AuthContext.jsx';

function ExportScreen({ formType, formData, signatures, onStartOver, onSaveDocument }) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { t } = useTranslation();
  const { user } = useAuth();
  const formTitle = t(`form.${formType}.title`);

  const handleDownloadPDF = async () => {
    toast({
      title: t('export.toast.generating'),
      description: t('export.toast.generatingDesc'),
    });
    try {
      const pdfBlob = await generatePdf(formType, formData, signatures, t, true); // Get blob
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${formTitle.replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      
      toast({
        title: t('export.toast.success'),
        description: t('export.toast.successDesc'),
      });
    } catch (error) {
      console.error("PDF Generation Error:", error);
      toast({
        title: t('export.toast.error'),
        description: t('export.toast.errorDesc'),
        variant: "destructive"
      });
    }
  };

const handleSave = async () => {
  if (!user || !onSaveDocument) return;

  setIsSaving(true);
  try {
    await onSaveDocument();
    toast({
      title: "Document Saved!",
      description: "Your document has been saved to your dashboard.",
    });
  } catch (error) {
    console.error("Saving Document Error:", error);
    toast({
      title: "Error Saving Document",
      description: "There was a problem saving your document.",
      variant: "destructive",
    });
  } finally {
    setIsSaving(false);
  }
};


  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {t('export.title')}
        </h1>
        <p className="text-lg text-gray-600">
          {t('export.subtitle', { formTitle })}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white rounded-2xl shadow-xl p-6 md:p-8"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
          {t('export.downloadSectionTitle')}
        </h3>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full sm:w-auto h-14 text-lg flex items-center justify-center space-x-3"
              >
                <Eye className="w-5 h-5" />
                <span>{t('export.preview')}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>{t('export.previewTitle', { formTitle })}</DialogTitle>
              </DialogHeader>
              <div className="flex-grow overflow-y-auto p-1 pr-4">
                <FormPreview formType={formType} formData={formData} signatures={signatures} />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">{t('export.close')}</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            onClick={handleDownloadPDF}
            className="w-full sm:w-auto h-14 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 flex items-center justify-center space-x-3"
          >
            <Download className="w-5 h-5" />
            <span>{t('export.downloadPdf')}</span>
          </Button>

          {user && (
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full sm:w-auto h-14 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 flex items-center justify-center space-x-3"
            >
              <Save className="w-5 h-5" />
              <span>{isSaving ? 'Saving...' : 'Save to Dashboard'}</span>
            </Button>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-4 text-center">
          {t('export.downloadNotice')}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mt-8"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          {t('export.finishedTitle')}
        </h3>
        <p className="text-gray-600 mb-6">
          {t('export.finishedDesc')}
        </p>
        <Button
          onClick={onStartOver}
          variant="outline"
          className="w-full h-12 flex items-center justify-center space-x-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{t('export.createAnother')}</span>
        </Button>
      </motion.div>
    </div>
  );
}

export default ExportScreen;
