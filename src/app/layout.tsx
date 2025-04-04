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

// Prevent the Grammarly extension from modifying the DOM
// This helps avoid hydration mismatches caused by browser extensions
const preventExtensions = {
  __html: `
    (function() {
      // Attempt to disable Grammarly on this site
      if (typeof window !== 'undefined') {
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'attributes') {
              // Remove attributes added by extensions
              if (mutation.attributeName === 'data-new-gr-c-s-check-loaded' || 
                  mutation.attributeName === 'data-gr-ext-installed' ||
                  mutation.attributeName === 'dm-allow-colors' ||
                  mutation.attributeName === 'dm-allow-transitions') {
                const target = mutation.target;
                if (target && target instanceof HTMLElement) {
                  target.removeAttribute(mutation.attributeName);
                }
              }
            }
          });
        });
        
        // Start observing the body for attribute changes
        observer.observe(document.documentElement, { 
          attributes: true,
          attributeFilter: ['data-new-gr-c-s-check-loaded', 'data-gr-ext-installed', 'dm-allow-colors', 'dm-allow-transitions']
        });
        
        // Disable Grammarly
        document.body.setAttribute('data-gramm', 'false');
        document.body.setAttribute('data-gramm_editor', 'false');
        document.body.setAttribute('data-enable-grammarly', 'false');
      }
    })()
  `,
};

// Script to help debug hydration issues in development
const hydrationDebugging = {
  __html: `
    ${
      process.env.NODE_ENV === 'development'
        ? `
    (function() {
      if (typeof window !== 'undefined') {
        window.__NEXT_HYDRATION_ERRORS = true;
        window.addEventListener('error', function(event) {
          if (event.message && event.message.includes('hydration')) {
            console.warn('Hydration error details:', event);
          }
        });
      }
    })()
    `
        : ''
    }
  `,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className="min-h-full dark">
      <head>
        {/* Script to prevent third-party extensions from modifying the DOM before hydration */}
        <script dangerouslySetInnerHTML={preventExtensions} />
        {/* Development-only script for hydration debugging */}
        <script dangerouslySetInnerHTML={hydrationDebugging} />
      </head>
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
