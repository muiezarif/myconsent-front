import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Loader2, ArrowLeft, Coins } from 'lucide-react';
import api from '@/api/myconsent.js';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

const CreditsSuccess = () => {
  const query = useQuery();
  const navigate = useNavigate();

  // 🔧 remove TS generics, just use plain JS
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');
  const [creditsAdded, setCreditsAdded] = useState(null); // number | null

  useEffect(() => {
    const sessionId = query.get('session_id');
    if (!sessionId) {
      setStatus('error');
      setMessage('Missing Stripe session ID in URL.');
      return;
    }

    const confirmPurchase = async () => {
      try {
        setStatus('loading');
        const { data } = await api.post('/credits/confirm', { sessionId });

        if (data?.ok) {
          setStatus('success');
          setCreditsAdded(typeof data.added === 'number' ? data.added : null);

          toast({
            title: 'Credits added!',
            description: `Your payment was successful and your credits have been updated${
              data.added ? ` (+${data.added})` : ''
            }.`,
          });
        } else {
          setStatus('error');
          setMessage(
            data?.message ||
              data?.error ||
              'The payment was successful, but we could not confirm your credits.'
          );
          toast({
            variant: 'destructive',
            title: 'Could not confirm credits',
            description:
              data?.message ||
              data?.error ||
              'Please contact support if this continues to happen.',
          });
        }
      } catch (err) {
        console.error('Error confirming Stripe session:', err);
        setStatus('error');
        setMessage(
          err.response?.data?.message ||
            err.response?.data?.error ||
            'There was a problem confirming your payment.'
        );
        toast({
          variant: 'destructive',
          title: 'Error confirming payment',
          description:
            err.response?.data?.message ||
            err.response?.data?.error ||
            'Please contact support if this continues.',
        });
      }
    };

    confirmPurchase();
  }, [query, navigate]);

  const goToAccountSettings = () => {
    navigate('/dashboard/settings');
  };

  const goToDashboard = () => {
    navigate('/dashboard');
  };

  const isLoading = status === 'loading';
  const isSuccess = status === 'success';
  const isError = status === 'error';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center"
      >
        {isLoading && (
          <>
            <div className="flex items-center justify-center mb-4">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
            <h1 className="text-xl font-semibold mb-2">Confirming your payment…</h1>
            <p className="text-gray-500 text-sm">
              We&apos;re securely confirming your Stripe payment and updating your credits.
            </p>
          </>
        )}

        {isSuccess && (
          <>
            <div className="flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-xl font-semibold mb-2">Payment successful!</h1>
            <p className="text-gray-600 text-sm mb-4">
              Your credits have been added to your MyConsent account.
            </p>
            {creditsAdded !== null && (
              <p className="font-medium text-lg mb-4">
                <span className="inline-flex items-center gap-2">
                  <Coins className="w-5 h-5 text-purple-600" />
                  +{creditsAdded} credits
                </span>
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 mt-4 justify-center">
              <Button
                variant="outline"
                onClick={goToDashboard}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
              <Button onClick={goToAccountSettings} className="flex items-center gap-2">
                <Coins className="w-4 h-4" />
                View Credits
              </Button>
            </div>
          </>
        )}

        {isError && (
          <>
            <div className="flex items-center justify-center mb-4">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-xl font-semibold mb-2">We couldn&apos;t confirm your credits</h1>
            <p className="text-gray-600 text-sm mb-4">
              The payment might still be successful on Stripe, but something went wrong while
              confirming it with MyConsent.
            </p>
            {message && <p className="text-xs text-red-500 mb-4">{message}</p>}
            <div className="flex flex-col sm:flex-row gap-3 mt-4 justify-center">
              <Button
                variant="outline"
                onClick={goToDashboard}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
              <Button onClick={goToAccountSettings} className="flex items-center gap-2">
                <Coins className="w-4 h-4" />
                Check Credits
              </Button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default CreditsSuccess;
