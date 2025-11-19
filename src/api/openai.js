import { toast } from '@/components/ui/use-toast';

const getOpenAICompletion = async (messages) => {
  toast({
    title: '🚧 AI Feature Not Implemented',
    description: "The AI chat functionality isn't connected yet. This is just a UI demonstration!",
    variant: 'destructive',
    duration: 5000,
  });

  // Placeholder response to simulate AI interaction
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        choices: [
          {
            message: {
              role: 'assistant',
              content: "Thanks for the details! Based on what you've told me, I'll start drafting the agreement. First, what is the effective date of this agreement?",
            },
          },
        ],
      });
    }, 1500);
  });
};

export { getOpenAICompletion };