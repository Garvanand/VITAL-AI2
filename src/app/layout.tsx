import { Inter } from 'next/font/google';
import '../styles/globals.css';
import '../styles/layout.css';
import { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import { UserProvider } from '@/contexts/UserContext';
import NavBarWithUser from '@/components/navigation/NavBarWithUser';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://paddle-billing.vercel.app'),
  title: 'Vital-AI',
  description:
    'Vital-AI is a powerful team design collaboration app and image editor. With plans for businesses of all sizes, streamline your workflow with real-time collaboration, advanced editing tools, and seamless project management.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={'min-h-full dark'}>
      <body className={inter.className}>
        <UserProvider>
          <NavBarWithUser
            logo={{
              src: '/logo.svg',
              alt: 'Vital-AI',
              width: 180,
              height: 48,
            }}
          />
          {children}
          <Toaster />
        </UserProvider>
      </body>
    </html>
  );
}
