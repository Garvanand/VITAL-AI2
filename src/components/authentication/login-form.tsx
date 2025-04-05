'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { login, loginAnonymously } from '@/app/login/actions';
import { useState } from 'react';
import { AuthenticationForm } from '@/components/authentication/authentication-form';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({ description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const result = await login({ email, password });

      if (result?.error) {
        toast({
          description: result.message || 'Invalid email or password',
          variant: 'destructive',
        });
      }
      // No need for success message as the page will redirect
    } catch (error) {
      console.error('Login error:', error);
      toast({ description: 'Something went wrong. Please try again', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymousLogin = (e: React.MouseEvent) => {
    e.preventDefault();

    setIsGuestLoading(true);
    // Use a regular function to avoid potential issues with async function serialization
    loginAnonymously()
      .then((result) => {
        if (result?.error) {
          toast({
            description: result.message || 'Failed to login as guest. Please try again',
            variant: 'destructive',
          });
        }
      })
      .catch((error) => {
        console.error('Guest login error:', error);
        toast({ description: 'Something went wrong. Please try again', variant: 'destructive' });
      })
      .finally(() => {
        setIsGuestLoading(false);
      });
  };

  return (
    <form onSubmit={handleLogin} className={'px-6 md:px-16 pb-6 py-8 gap-6 flex flex-col items-center justify-center'}>
      <Image src={'/assets/icons/logo/aeroedit-icon.svg'} alt={'AeroEdit'} width={80} height={80} />
      <div className={'text-[30px] leading-[36px] font-medium tracking-[-0.6px] text-center'}>
        Log in to your account
      </div>
      <Button
        onClick={handleAnonymousLogin}
        type={'button'}
        variant={'secondary'}
        className={'w-full mt-6'}
        disabled={isGuestLoading}
      >
        {isGuestLoading ? 'Logging in...' : 'Log in as Guest'}
      </Button>
      <div className={'flex w-full items-center justify-center'}>
        <Separator className={'w-5/12 bg-border'} />
        <div className={'text-border text-xs font-medium px-4'}>or</div>
        <Separator className={'w-5/12 bg-border'} />
      </div>
      <AuthenticationForm
        email={email}
        onEmailChange={(email) => setEmail(email)}
        password={password}
        onPasswordChange={(password) => setPassword(password)}
      />
      <Button type={'submit'} variant={'secondary'} className={'w-full'} disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Log in'}
      </Button>
    </form>
  );
}
