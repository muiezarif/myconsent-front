import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { User, Shield, LogOut, Coins } from 'lucide-react';
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
import api from '@/api/myconsent.js';

function AccountSettings() {
  const { user, logout, changeEmail, changePassword } = useAuth();
  const navigate = useNavigate();

  const [emailData, setEmailData] = useState({ newEmail: '', password: '' });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Credits state
  const [credits, setCredits] = useState(null);
  const [isLoadingCredits, setIsLoadingCredits] = useState(false);
  const [buyingPack, setBuyingPack] = useState(null); // 'small' | 'medium' | 'large' | null

  const handleLogout = () => {
    logout();
    navigate('/');
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
  };

  const handleEmailChange = (e) => {
    e.preventDefault();
    const result = changeEmail(user.id, emailData.password, emailData.newEmail);
    if (result.success) {
      toast({ title: 'Success', description: result.message });
      setEmailData({ newEmail: '', password: '' });
      setIsEmailModalOpen(false);
    } else {
      toast({
        title: 'Error',
        description: result.message,
        variant: 'destructive',
      });
    }
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match.',
        variant: 'destructive',
      });
      return;
    }
    const result = changePassword(
      user.id,
      passwordData.currentPassword,
      passwordData.newPassword
    );
    if (result.success) {
      toast({ title: 'Success', description: result.message });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsPasswordModalOpen(false);
    } else {
      toast({
        title: 'Error',
        description: result.message,
        variant: 'destructive',
      });
    }
  };

  // --- Credits: fetch balance ---

  useEffect(() => {
    if (!user) return;

    let isMounted = true;

    const fetchCredits = async () => {
      try {
        setIsLoadingCredits(true);
        const { data } = await api.get('/credits/balance');
        if (!isMounted) return;
        setCredits(typeof data?.credits === 'number' ? data.credits : 0);
      } catch (err) {
        if (!isMounted) return;
        console.error('Failed to load credits balance:', err);
        toast({
          variant: 'destructive',
          title: 'Could not load credits',
          description:
            err.response?.data?.message ||
            err.response?.data?.error ||
            'There was a problem fetching your AI credits balance.',
        });
      } finally {
        if (isMounted) setIsLoadingCredits(false);
      }
    };

    fetchCredits();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // --- Credits: buy via Stripe Checkout for a selected pack ---

  const handleBuyCredits = async (packKey) => {
    try {
      setBuyingPack(packKey);
      const { data } = await api.post('/credits/checkout-session', { pack: packKey });

      if (data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        toast({
          variant: 'destructive',
          title: 'Error starting checkout',
          description:
            'The server did not return a Stripe checkout URL. Please try again or contact support.',
        });
      }
    } catch (err) {
      console.error('Failed to create checkout session:', err);
      toast({
        variant: 'destructive',
        title: 'Error starting checkout',
        description:
          err.response?.data?.message ||
          err.response?.data?.error ||
          'There was a problem connecting to the payment system.',
      });
      setBuyingPack(null);
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
        {/* Account info */}
        <div className="p-5 border rounded-lg">
          <h3 className="font-semibold text-lg mb-4 flex items-center">
            <User className="w-5 h-5 mr-3 text-blue-600" /> Account Information
          </h3>
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
                    <DialogDescription>
                      Enter your new email and current password to confirm.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="new-email">New Email</Label>
                      <Input
                        id="new-email"
                        type="email"
                        value={emailData.newEmail}
                        onChange={(e) =>
                          setEmailData({ ...emailData, newEmail: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="current-password-email">Current Password</Label>
                      <Input
                        id="current-password-email"
                        type="password"
                        value={emailData.password}
                        onChange={(e) =>
                          setEmailData({ ...emailData, password: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="secondary">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button type="submit">Save Changes</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Credits & AI usage */}
        <div className="p-5 border rounded-lg">
          <h3 className="font-semibold text-lg mb-4 flex items-center">
            <Coins className="w-5 h-5 mr-3 text-purple-600" /> Credits &amp; AI Usage
          </h3>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-gray-500 mb-1">Available AI Credits</p>
                <p className="font-semibold text-xl">
                  {isLoadingCredits
                    ? 'Loading...'
                    : credits !== null
                    ? `${credits} credit${credits === 1 ? '' : 's'}`
                    : '—'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Credits are used whenever you interact with the AI assistant (chat or voice).
                </p>
                <p className="text-xs text-gray-400 mt-1 max-w-md">
                  Choose a pack below to top up your balance. Payments are processed securely by
                  Stripe.
                </p>
              </div>
            </div>

            {/* Packs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Small pack */}
              <div className="border rounded-lg p-4 flex flex-col justify-between">
                <div>
                  <p className="text-sm font-semibold mb-1">Starter Pack</p>
                  <p className="text-2xl font-bold flex items-baseline gap-1">
                    $5 <span className="text-xs text-gray-500">/ one-time</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">5 credits</p>
                </div>
                <Button
                  onClick={() => handleBuyCredits('small')}
                  disabled={buyingPack === 'small'}
                  className="mt-4 w-full flex items-center justify-center gap-2"
                  variant="outline"
                >
                  {buyingPack === 'small' ? (
                    <>
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Coins className="w-4 h-4" />
                      Buy 5 credits
                    </>
                  )}
                </Button>
              </div>

              {/* Medium pack */}
              <div className="border rounded-lg p-4 flex flex-col justify-between">
                <div>
                  <p className="text-sm font-semibold mb-1">Standard Pack</p>
                  <p className="text-2xl font-bold flex items-baseline gap-1">
                    $9.99 <span className="text-xs text-gray-500">/ one-time</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">10 credits</p>
                </div>
                <Button
                  onClick={() => handleBuyCredits('medium')}
                  disabled={buyingPack === 'medium'}
                  className="mt-4 w-full flex items-center justify-center gap-2"
                >
                  {buyingPack === 'medium' ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Coins className="w-4 h-4" />
                      Buy 10 credits
                    </>
                  )}
                </Button>
              </div>

              {/* Large pack */}
              <div className="border rounded-lg p-4 flex flex-col justify-between">
                <div>
                  <p className="text-sm font-semibold mb-1">Pro Pack</p>
                  <p className="text-2xl font-bold flex items-baseline gap-1">
                    $18.99 <span className="text-xs text-gray-500">/ one-time</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">20 credits</p>
                </div>
                <Button
                  onClick={() => handleBuyCredits('large')}
                  disabled={buyingPack === 'large'}
                  className="mt-4 w-full flex items-center justify-center gap-2"
                  variant="outline"
                >
                  {buyingPack === 'large' ? (
                    <>
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Coins className="w-4 h-4" />
                      Buy 20 credits
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Security / logout */}
        <div className="p-5 border rounded-lg">
          <h3 className="font-semibold text-lg mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-3 text-green-600" /> Security
          </h3>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* Password change UI intentionally hidden for now */}
              <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
                <DialogTrigger asChild>
                  {/* <Button variant="outline">
                    <KeyRound className="w-4 h-4 mr-2" /> Change Password
                  </Button> */}
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handlePasswordChange}>
                    <DialogHeader>
                      <DialogTitle>Change Password</DialogTitle>
                      <DialogDescription>
                        Enter your current and new password.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input
                          id="current-password"
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              currentPassword: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input
                          id="new-password"
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              newPassword: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              confirmPassword: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="secondary">
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="text-gray-600">
                Log out from your account on this device.
              </p>
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
