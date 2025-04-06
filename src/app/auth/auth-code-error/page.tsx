'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AuthCodeError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case 'no_code':
        return 'No authentication code was provided. Please try signing in again.';
      case 'unexpected_error':
        return 'An unexpected error occurred during authentication. Please try again.';
      default:
        return errorCode || 'An error occurred during authentication. Please try again.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full mx-4 p-8 bg-card/50 backdrop-blur-sm rounded-lg border border-border shadow-lg"
      >
        <h1 className="text-2xl font-semibold text-foreground mb-4">Authentication Error</h1>
        <p className="text-muted-foreground mb-6">{getErrorMessage(error)}</p>
        <div className="flex flex-col gap-4">
          <Button asChild className="w-full">
            <Link href="/login">Return to Login</Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/">Go to Homepage</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
