import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FileText, Edit, Settings, Bot } from 'lucide-react';
import MyDocuments from '@/components/dashboard/MyDocuments';
import MyTemplates from '@/components/dashboard/MyTemplates';
import AccountSettings from '@/components/dashboard/AccountSettings';

const tabs = [
  { name: 'My Documents', path: '/dashboard', icon: FileText },
  { name: 'My Templates', path: '/dashboard/templates', icon: Edit },
  { name: 'Create With AI', path: '/create-with-ai', icon: Bot },
  { name: 'Account Settings', path: '/dashboard/settings', icon: Settings },
];

function Dashboard() {
  const { t } = useTranslation();
  const location = useLocation();

  const isTabActive = (tabPath) => {
    if (tabPath === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/dashboard/';
    }
    return location.pathname.startsWith(tabPath);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="md:w-1/4">
          <nav className="flex flex-col gap-2">
            {tabs.map(tab => (
              <Link
                key={tab.path}
                to={tab.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-lg ${
                  isTabActive(tab.path)
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{t(tab.name, tab.name)}</span>
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1">
          <Routes>
            <Route index element={<MyDocuments />} />
            <Route path="templates" element={<MyTemplates />} />
            <Route path="settings" element={<AccountSettings />} />
          </Routes>
        </main>
      </div>
    </motion.div>
  );
}

export default Dashboard;