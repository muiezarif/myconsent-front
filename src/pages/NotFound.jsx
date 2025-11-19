import React from 'react';
import { Link } from 'react-router-dom';
import { Frown } from 'lucide-react';
import { Button } from '@/components/ui/button';

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50">
      <Frown className="w-24 h-24 text-indigo-400 mb-6" />
      <h1 className="text-6xl font-bold text-gray-800">404</h1>
      <p className="text-2xl text-gray-600 mt-2 mb-8">Page Not Found</p>
      <p className="text-lg text-gray-500 mb-8">
        Oops! The page you are looking for does not exist. It might have been moved or deleted.
      </p>
      <Button asChild size="lg">
        <Link to="/">Go Back to Home</Link>
      </Button>
    </div>
  );
}

export default NotFound;