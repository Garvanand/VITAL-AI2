'use client';

import { useEffect } from 'react';
import { initClientServices } from '@/lib/init-services';

/**
 * This component initializes client-side services when mounted.
 * It renders nothing in the DOM.
 */
export default function ClientServiceInitializer() {
  useEffect(() => {
    // Initialize client services
    initClientServices();
  }, []);

  // Return null as this component doesn't render anything
  return null;
}
