// src/pages/MyDocuments.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FileText, Trash2, Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext.jsx';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { generatePdf } from '@/lib/pdfGenerator';
import FormPreview from '@/components/FormPreview';
import api from '@/api/myconsent.js';

function MyDocuments() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load contracts from backend on mount / when user changes
  useEffect(() => {
    const fetchContracts = async () => {
      if (!user) {
        setContracts([]);
        return;
      }

      setLoading(true);
      try {
        const { data } = await api.get('/contracts');
        if (data?.ok && Array.isArray(data.items)) {
          setContracts(data.items);
        } else {
          setContracts([]);
        }
      } catch (e) {
        console.error('Failed to load contracts', e);
        toast({
          title: 'Error',
          description: 'Could not load your documents.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, [user]);

  const handleDeleteDoc = async (id) => {
    try {
      await api.delete(`/contracts/${id}`);
      setContracts((prev) => prev.filter((c) => c._id !== id));
      toast({
        title: 'Document Deleted',
        description: 'The document has been removed from your list.',
      });
    } catch (e) {
      console.error('Delete contract error', e);
      toast({
        title: 'Error',
        description: 'Could not delete the document.',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadDoc = async (doc) => {
    try {
      const payload = doc.payload || {};
      const formType = payload.formType;
      const formData = payload.formData;
      const signatures = payload.signatures;

      const pdfBlob = await generatePdf(formType, formData, signatures, t, true);
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc.title.replace(/\s+/g, '-')}-${doc._id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download contract error', e);
      toast({
        title: 'Error',
        description: 'Could not generate PDF for download.',
        variant: 'destructive',
      });
    }
  };

  const renderContent = () => {
    if (!user) {
      return (
        <p className="text-gray-500 text-center py-12">
          Please log in to view your saved documents.
        </p>
      );
    }

    if (loading) {
      return (
        <p className="text-gray-500 text-center py-12">
          Loading your documents...
        </p>
      );
    }

    if (!contracts.length) {
      return (
        <p className="text-gray-500 text-center py-12">
          You have no saved documents yet.
        </p>
      );
    }

    return (
      <ul className="space-y-4">
        {contracts.map((doc) => {
          const createdAt = doc.createdAt || doc.updatedAt;
          const payload = doc.payload || {};
          const formType = payload.formType;
          const formData = payload.formData;
          const signatures = payload.signatures;

          return (
            <motion.li
              key={doc._id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center overflow-hidden">
                <FileText className="w-6 h-6 mr-4 text-indigo-500 flex-shrink-0" />
                <div className="truncate">
                  <p className="font-semibold truncate">{doc.title}</p>
                  {createdAt && (
                    <p className="text-sm text-gray-500">
                      Created: {new Date(createdAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="Preview document"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
                    <DialogHeader>
                      <DialogTitle>Preview: {doc.title}</DialogTitle>
                    </DialogHeader>
                    <div className="flex-grow overflow-y-auto p-1 pr-4">
                      <FormPreview
                        formType={formType}
                        formData={formData}
                        signatures={signatures}
                      />
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="secondary">
                          Close
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDownloadDoc(doc)}
                  aria-label="Download document"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDeleteDoc(doc._id)}
                  aria-label="Delete document"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.li>
          );
        })}
      </ul>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-6 rounded-2xl shadow-xl"
    >
      <h2 className="text-2xl font-bold mb-6">My Documents</h2>
      {renderContent()}
    </motion.div>
  );
}

export default MyDocuments;
