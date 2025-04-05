'use client';

import React from 'react';
import { signInWithGoogle } from '@/app/login/actions';

interface GoogleLoginButtonProps {
  label: string;
  className?: string;
}

export function GoogleLoginButton({ label, className }: GoogleLoginButtonProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await signInWithGoogle();

      if (result.error) {
        setError(result.message || 'Failed to sign in with Google');
        return;
      }

      if (result.url) {
        // Navigate to the URL returned by the server action
        window.location.href = result.url;
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className={`mx-auto w-[343px] md:w-[488px] bg-background/80 backdrop-blur-[6px] px-6 md:px-16 py-3 flex items-center justify-center gap-3 text-sm rounded-t-none rounded-lg border border-[#ffffff30] hover:bg-background/90 transition-colors ${className}`}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
        ) : (
          <img src="/assets/icons/google.svg" alt="Google" width={24} height={24} />
        )}
        <span className="text-white font-medium">{label}</span>
      </button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
