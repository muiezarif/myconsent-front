import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Home, Heart, LogIn, User, LayoutDashboard, LogOut, UserPlus, Settings } from 'lucide-react';
import DonationOptionsDialog from '@/components/DonationOptionsDialog';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext.jsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function MainLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleStartClick = () => {
    if (location.pathname === '/') {
      window.location.reload();
    } else {
      navigate('/');
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('app.title')}</title>
        <meta name="description" content={t('app.description')} />
        <meta property="og:title" content={t('app.title')} />
        <meta property="og:description" content={t('app.description')} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <header className="container mx-auto px-2 pt-4 pb-2 md:px-4 md:pt-6 md:pb-4 flex justify-between items-center">
          <div className="flex-1 flex justify-start">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Button variant="outline" onClick={handleStartClick} className="h-8 px-3 text-sm flex items-center space-x-1 md:h-9 md:px-4 md:text-base">
                <Home className="w-4 h-4" />
                <span>Start</span>
              </Button>
            </motion.div>
          </div>
          
          <div className="flex-1 flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <DonationOptionsDialog>
                <Button variant="ghost" className="h-8 px-2 text-sm flex items-center space-x-1 text-pink-500 hover:text-pink-600 md:h-9 md:px-3 md:text-base">
                  <Heart className="w-4 h-4 fill-current" />
                  <span className="hidden sm:inline">{t('app.supportUs')}</span>
                </Button>
              </DonationOptionsDialog>
            </motion.div>
          </div>

          <div className="flex-1 flex justify-end items-center gap-1 md:gap-2">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
            >
                <LanguageSwitcher />
            </motion.div>
             <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="flex items-center gap-1 md:gap-2"
            >
                {user ? (
                   <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="h-8 px-3 text-sm flex items-center space-x-1 md:h-9 md:px-4 md:text-base">
                        <User className="w-4 h-4" />
                        <span className="hidden sm:inline">{user.email.split('@')[0]}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                       <DropdownMenuItem asChild>
                        <Link to="/dashboard/settings">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                    <>
                    <Button asChild variant="ghost" className="h-8 px-3 text-sm md:h-9 md:px-4 md:text-base">
                        <Link to="/login" className="flex items-center space-x-1">
                            <LogIn className="w-4 h-4" />
                            <span className="hidden sm:inline">Login</span>
                        </Link>
                    </Button>
                     <Button asChild className="h-8 px-3 text-sm md:h-9 md:px-4 md:text-base">
                        <Link to="https://www.viddy.cloud/register" target='_blank' className="flex items-center space-x-1">
                            <UserPlus className="w-4 h-4" />
                            <span className="hidden sm:inline">Register</span>
                        </Link>
                    </Button>
                    </>
                )}
            </motion.div>
          </div>
        </header>

        <main className="container mx-auto px-4 pb-8 max-w-4xl">
           <Outlet />
        </main>
      </div>
    </>
  );
}

export default MainLayout;