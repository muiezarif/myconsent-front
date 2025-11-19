import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { User, Shield, LogOut, Star, Mail, KeyRound } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';

function AccountSettings() {
  const { user, logout, changeEmail, changePassword } = useAuth();
  const navigate = useNavigate();
  const [emailData, setEmailData] = useState({ newEmail: '', password: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
  };
  
  const handleManageMembership = () => {
    toast({
      title: '🚧 Coming Soon!',
      description: 'Membership management features are on the way! 🚀',
    });
  };

  const handleEmailChange = (e) => {
    e.preventDefault();
    const result = changeEmail(user.id, emailData.password, emailData.newEmail);
    if (result.success) {
      toast({ title: "Success", description: result.message });
      setEmailData({ newEmail: '', password: '' });
      setIsEmailModalOpen(false);
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: "Error", description: "New passwords do not match.", variant: "destructive" });
      return;
    }
    const result = changePassword(user.id, passwordData.currentPassword, passwordData.newPassword);
    if (result.success) {
      toast({ title: "Success", description: result.message });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsPasswordModalOpen(false);
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-6 rounded-2xl shadow-xl"
    >
      <h2 className="text-2xl font-bold mb-6">Account Settings</h2>

      <div className="space-y-8">
        <div className="p-5 border rounded-lg">
          <h3 className="font-semibold text-lg mb-4 flex items-center"><User className="w-5 h-5 mr-3 text-blue-600"/> Account Information</h3>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-gray-500">Email Address</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
              <DialogTrigger asChild>
                {/* <Button variant="outline"><Mail className="w-4 h-4 mr-2" /> Change Email</Button> */}
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleEmailChange}>
                  <DialogHeader>
                    <DialogTitle>Change Email Address</DialogTitle>
                    <DialogDescription>Enter your new email and current password to confirm.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="new-email">New Email</Label>
                      <Input id="new-email" type="email" value={emailData.newEmail} onChange={(e) => setEmailData({...emailData, newEmail: e.target.value})} required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="current-password-email">Current Password</Label>
                      <Input id="current-password-email" type="password" value={emailData.password} onChange={(e) => setEmailData({...emailData, password: e.target.value})} required />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                    <Button type="submit">Save Changes</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="p-5 border rounded-lg">
          <h3 className="font-semibold text-lg mb-4 flex items-center"><Star className="w-5 h-5 mr-3 text-yellow-500"/> Membership</h3>
           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="font-medium">Current Plan: Free Tier</p>
                <p className="text-sm text-gray-500">Enjoy basic features, including saving documents and customizing templates.</p>
              </div>
              {/* <Button onClick={handleManageMembership}>
                  Manage Membership
              </Button> */}
            </div>
        </div>

        <div className="p-5 border rounded-lg">
          <h3 className="font-semibold text-lg mb-4 flex items-center"><Shield className="w-5 h-5 mr-3 text-green-600"/> Security</h3>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* <p className="text-gray-600">Change your account password.</p> */}
              <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
                <DialogTrigger asChild>
                  {/* <Button variant="outline"><KeyRound className="w-4 h-4 mr-2" /> Change Password</Button> */}
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handlePasswordChange}>
                    <DialogHeader>
                      <DialogTitle>Change Password</DialogTitle>
                      <DialogDescription>Enter your current and new password.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input id="current-password" type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} required />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} required />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input id="confirm-password" type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} required />
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                      <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="text-gray-600">Log out from your account on this device.</p>
              <Button variant="destructive" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Log Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default AccountSettings;