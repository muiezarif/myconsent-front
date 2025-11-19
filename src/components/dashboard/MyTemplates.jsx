
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Pencil, FileUp, Info, PlusCircle, Trash2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext.jsx';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Textarea } from '@/components/ui/textarea.jsx';
import { toast } from '@/components/ui/use-toast';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const templateInfo = {
  'content-release': {
    title: 'Content Release Agreement',
    description: 'Use this for granting permission to use photos, videos, or other media. It protects the user from claims of unauthorized use.',
  },
  'general-consent': {
    title: 'General Consent Agreement',
    description: 'A formal agreement to ensure all parties consent to an activity, outlining boundaries and confirming voluntary participation.',
  },
  'nda': {
    title: 'Non-Disclosure Agreement (NDA)',
    description: 'Use this to protect confidential information shared between parties. It legally binds them not to disclose sensitive details.',
  },
  structure: {
    heading: 'Formatting Guide',
    body: 'To structure your custom template, you must use simple HTML tags. The system uses these tags to correctly parse and display your document. Each section needs a title wrapped in <h3> tags and content in <p> tags.',
    example: {
      heading: 'Example:',
      code: `<h3>Section Title One</h3>\n<p>The first paragraph of your content goes here. It can be as long as you need it to be.</p>\n\n<h3>Another Section Title</h3>\n<p>This is the content for the second section.</p>`
    }
  }
};

function MyTemplates() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userTemplates, setUserTemplates] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(null);

  useEffect(() => {
    if (user) {
      const storedTemplates = JSON.parse(localStorage.getItem(`userTemplates_${user.id}`)) || [];
      setUserTemplates(storedTemplates);
    }
  }, [user]);

  const saveUserTemplates = (templates) => {
    setUserTemplates(templates);
    localStorage.setItem(`userTemplates_${user.id}`, JSON.stringify(templates));
  };
  
  const handleSaveTemplate = () => {
    if (!currentTemplate || !currentTemplate.name || !currentTemplate.content) {
      toast({ title: "Missing Information", description: "Please provide a name and content for the template.", variant: "destructive" });
      return;
    }

    let templates = [...userTemplates];
    if (currentTemplate.id) {
      templates = templates.map(t => t.id === currentTemplate.id ? currentTemplate : t);
      toast({ title: "Template Updated!", description: "Your custom template has been saved." });
    } else {
      templates.push({ ...currentTemplate, id: `custom_${Date.now()}` });
      toast({ title: "Template Created!", description: "Your new custom template is ready." });
    }
    
    saveUserTemplates(templates);
    setIsModalOpen(false);
    setCurrentTemplate(null);
  };

  const handleDeleteTemplate = (templateId) => {
    if (window.confirm("Are you sure you want to delete this template? This action cannot be undone.")) {
      const updatedTemplates = userTemplates.filter(t => t.id !== templateId);
      saveUserTemplates(updatedTemplates);
      toast({ title: "Template Deleted", description: "Your custom template has been removed." });
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (e) => {
            setCurrentTemplate(prev => ({ ...prev, content: e.target.result }));
            toast({ title: "File Loaded", description: "You can now save your changes." });
        };
        reader.readAsText(file);
    } else {
        toast({ title: "Invalid File", description: "Please upload a plain text (.txt) file.", variant: "destructive" });
    }
  };

  const handleUseTemplate = (template) => {
    navigate('/', { state: { templateId: template.id, templateName: template.name } });
  };

  const openModalForNew = () => {
    setCurrentTemplate({ id: null, name: '', content: '' });
    setIsModalOpen(true);
  };

  const openModalForEdit = (template) => {
    setCurrentTemplate(template);
    setIsModalOpen(true);
  };

  const defaultTemplateKeys = ['content-release', 'general-consent', 'nda'];

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-6 rounded-2xl shadow-xl"
      >
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold">My Templates</h2>
          <Button onClick={openModalForNew}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Create Custom Template
          </Button>
        </div>
        <p className="text-gray-600 mb-6">Create new templates or manage your existing ones.</p>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700 mt-6 border-b pb-2">Custom Templates</h3>
          {userTemplates.length > 0 ? userTemplates.map(template => (
            <div key={template.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-green-500 flex-shrink-0" />
                <p className="font-semibold">{template.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => handleUseTemplate(template)}>
                  <Play className="w-4 h-4 mr-2" />
                  Use
                </Button>
                <Button variant="outline" size="sm" onClick={() => openModalForEdit(template)}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteTemplate(template.id)}>
                   <Trash2 className="w-4 h-4 mr-2" />
                   Delete
                </Button>
              </div>
            </div>
          )) : (
            <p className="text-gray-500 italic">You haven't created any custom templates yet.</p>
          )}

          <h3 className="text-lg font-semibold text-gray-700 mt-8 border-b pb-2">Default Templates</h3>
          {defaultTemplateKeys.map(key => (
            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-purple-500 flex-shrink-0" />
                <p className="font-semibold">{t(`form.${key}.title`)}</p>
                <Tooltip delayDuration={100}>
                  <TooltipTrigger asChild>
                    <button className="text-gray-400 hover:text-gray-600">
                      <Info className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-md p-4" side="top">
                    <div className="space-y-3">
                      <div>
                        <p className="font-bold mb-1">{templateInfo[key].title}</p>
                        <p className="text-sm">{templateInfo[key].description}</p>
                      </div>
                      <div className="border-t pt-3">
                        <p className="font-bold mb-1">{templateInfo.structure.heading}</p>
                        <p className="text-sm mb-2">{templateInfo.structure.body}</p>
                        <div className="mt-2 p-2 bg-slate-100 rounded">
                           <p className="text-xs font-semibold mb-1">{templateInfo.structure.example.heading}</p>
                           <code className="text-xs whitespace-pre-wrap font-mono text-slate-600">
                             {templateInfo.structure.example.code}
                           </code>
                        </div>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-sm text-gray-500 italic">Default templates cannot be edited.</p>
            </div>
          ))}
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>{currentTemplate?.id ? 'Edit' : 'Create'} Custom Template</DialogTitle>
              <DialogDescription>
                Name your template and provide the content below. Use the required HTML format.
              </DialogDescription>
            </DialogHeader>
            <div className="my-4 grid gap-4">
              <div>
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  value={currentTemplate?.name || ''}
                  onChange={(e) => setCurrentTemplate(prev => ({...prev, name: e.target.value}))}
                  placeholder="e.g., My Project NDA"
                />
              </div>
              <div>
                <Label htmlFor="template-content">Template Content</Label>
                <Textarea 
                    id="template-content"
                    value={currentTemplate?.content || ''}
                    onChange={(e) => setCurrentTemplate(prev => ({...prev, content: e.target.value}))}
                    className="min-h-[300px] font-mono text-sm"
                    placeholder="<h3>Section Title</h3><p>Section content...</p>"
                />
              </div>
            </div>
            <DialogFooter className="sm:justify-between">
              <label htmlFor="upload-file-upload" className="cursor-pointer">
                <Button asChild variant="outline">
                  <span><FileUp className="w-4 h-4 mr-2"/> Upload .txt File</span>
                </Button>
                <input id="upload-file-upload" type="file" accept=".txt" className="hidden" onChange={handleFileUpload} />
              </label>
              <div>
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="mr-2">Cancel</Button>
                <Button onClick={handleSaveTemplate}>Save Template</Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </motion.div>
    </TooltipProvider>
  );
}

export default MyTemplates;
