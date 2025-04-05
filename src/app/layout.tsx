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
        // Wait for DOM to be ready
        function disableGrammarly() {
          const body = document.body;
          if (body) {
            // Disable Grammarly
            body.setAttribute('data-gramm', 'false');
            body.setAttribute('data-gramm_editor', 'false');
            body.setAttribute('data-enable-grammarly', 'false');
          }
        }

        // Set up observer after the body is available
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
          disableGrammarly();
        } else {
          document.addEventListener('DOMContentLoaded', disableGrammarly);
        }

        // Start observing the document for attribute changes once it's ready
        document.addEventListener('DOMContentLoaded', function() {
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
          
          // Start observing the document for attribute changes
          observer.observe(document.documentElement, { 
            attributes: true,
            attributeFilter: ['data-new-gr-c-s-check-loaded', 'data-gr-ext-installed', 'dm-allow-colors', 'dm-allow-transitions']
          });
        });
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
        // Set up debugging flags
        window.__NEXT_HYDRATION_ERRORS = true;
        
        // Handle hydration errors
        window.addEventListener('error', function(event) {
          if (event.message && event.message.includes('hydration')) {
            console.warn('Hydration error details:', event);
          }
        });

        // Add DOM error debugging with safe access
        window.addEventListener('error', function(event) {
          if (event.message && event.message.includes('Cannot read properties of null')) {
            // Create a safe object with only serializable properties
            const safeErrorDetails = {
              message: event.message,
              filename: event.filename,
              lineno: event.lineno,
              colno: event.colno,
              stack: event.error?.stack
            };
            
            try {
              // Try to get info about the target but don't crash if it fails
              if (event.target) {
                safeErrorDetails.targetInfo = {
                  tagName: event.target.tagName,
                  id: event.target.id,
                  className: event.target.className
                };
              }
            } catch (e) {
              safeErrorDetails.targetAccessError = String(e);
            }
            
            console.error('DOM Error Details:', safeErrorDetails);
          }
        });
      }
    })()
    `
        : ''
    }
  `,
};

// Script to safely access DOM properties
const safeDomScript = {
  __html: `
    (function() {
      if (typeof window !== 'undefined') {
        // Fix "Cannot read properties of null" errors by providing a safety wrapper
        window.safeSetAttribute = function(element, attr, value) {
          try {
            if (element && typeof element.setAttribute === 'function') {
              element.setAttribute(attr, value);
              return true;
            }
            return false;
          } catch(e) {
            console.warn('Error setting attribute', e);
            return false;
          }
        };

        // Ensure all DOM operations are wrapped in a try-catch
        window.safeDOM = {
          query: function(selector) {
            try {
              return document.querySelector(selector);
            } catch(e) {
              console.warn('Error querying DOM', e);
              return null;
            }
          },
          queryAll: function(selector) {
            try {
              return document.querySelectorAll(selector);
            } catch(e) {
              console.warn('Error querying DOM elements', e);
              return [];
            }
          }
        };
      }
    })()
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
        {/* Safety wrapper for DOM operations */}
        <script dangerouslySetInnerHTML={safeDomScript} />
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
