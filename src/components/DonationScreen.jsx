import React from 'react';
import { motion } from 'framer-motion';
import { Heart, DollarSign, CreditCard, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

function DonationScreen({ onComplete }) {
  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-8 text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 rounded-full mb-6">
          <Heart className="w-8 h-8 text-pink-500" />
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Support Our Platform
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          This service is absolutely free to use. If you find it helpful, please consider making a small donation to keep it running and ad-free.
        </p>

        <div className="space-y-4 mb-10">
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

        <Button
          onClick={onComplete}
          variant="ghost"
          className="w-full h-12 text-lg text-gray-700 hover:bg-gray-100 flex items-center justify-center space-x-2"
        >
          <span>Continue to Download</span>
          <ArrowRight className="w-5 h-5" />
        </Button>
      </motion.div>
    </div>
  );
}

export default DonationScreen;