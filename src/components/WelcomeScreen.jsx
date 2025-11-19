import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FileText, Shield, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formTypesConfig = [
  {
    id: 'content-release',
    icon: FileText,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'general-consent',
    icon: Shield,
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'nda',
    icon: Lock,
    color: 'from-purple-500 to-violet-500'
  }
];

function WelcomeScreen({ onFormTypeSelect }) {
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = React.useState('');

  const handleContinue = () => {
    if (selectedType) {
      onFormTypeSelect(selectedType);
    }
  };

  const formTypes = formTypesConfig.map(type => ({
      ...type,
      title: t(`form.${type.id}.title`),
      description: t(`form.${type.id}.participants_desc`)
  }));

  return (
    <div className="text-center space-y-6 md:space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-4"
      >
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          {t('welcome.mainTitle')}
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          {t('welcome.subtitle')}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white rounded-2xl shadow-xl p-6 md:p-8 glass-effect border border-white/20"
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          {t('welcome.formTypeQuestion')}
        </h2>

        <div className="grid gap-4 md:grid-cols-3 mb-6 md:mb-8">
          {formTypes.map((type) => {
            const Icon = type.icon;
            return (
              <motion.div
                key={type.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 md:p-6 rounded-xl cursor-pointer transition-all duration-200 ${
                  selectedType === type.id
                    ? 'ring-2 ring-offset-2 ring-indigo-500 bg-indigo-50'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => setSelectedType(type.id)}
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${type.color} flex items-center justify-center mb-4 mx-auto`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{type.title}</h3>
                <p className="text-sm text-gray-600">{type.description}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="space-y-4 max-w-md mx-auto">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full h-12 md:h-14 text-base md:text-lg">
              <SelectValue placeholder={t('welcome.dropdownPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {formTypes.map((type) => (
                <SelectItem key={type.id} value={type.id} className="text-base md:text-lg py-3">
                  {type.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={handleContinue}
            disabled={!selectedType}
            size="lg"
            className="w-full h-12 md:h-14 text-base md:text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl"
          >
            {t('welcome.getStarted')}
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="text-sm text-gray-500 px-4"
      >
        ✨ {t('welcome.feature1')} • 📱 {t('welcome.feature2')} • 🔒 {t('welcome.feature3')}
      </motion.div>
    </div>
  );
}

export default WelcomeScreen;