import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DollarSign, CreditCard, Heart } from 'lucide-react';

const DonationOptionsDialog = ({ children }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 rounded-full">
              <Heart className="w-8 h-8 text-pink-500" />
            </div>
          </div>
          <DialogTitle className="text-2xl text-center font-bold">Support Our Platform</DialogTitle>
          <DialogDescription className="text-center text-gray-600 px-4">
            Choose your preferred way to donate. Your support keeps this service running and ad-free!
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Button asChild className="w-full h-14 text-lg bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white flex items-center justify-center space-x-3">
            <a href="https://cash.app/$Homieshub" target="_blank" rel="noopener noreferrer">
              <DollarSign className="w-6 h-6" />
              <span>Donate with Cash App</span>
            </a>
          </Button>
          <Button asChild className="w-full h-14 text-lg bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white flex items-center justify-center space-x-3">
            <a href="https://donate.stripe.com/fZu9ASbadcfU5VzbX4f7i09" target="_blank" rel="noopener noreferrer">
              <CreditCard className="w-6 h-6" />
              <span>Donate with Card (Stripe)</span>
            </a>
          </Button>
        </div>
        <DialogFooter className="text-center justify-center">
            <p className="text-xs text-gray-500">You will be redirected to a secure payment page.</p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DonationOptionsDialog;