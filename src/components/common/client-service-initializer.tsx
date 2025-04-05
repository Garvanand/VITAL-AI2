'use client';

import { useEffect } from 'react';
import { initClientServices } from '@/lib/init-services';
import { FloatingChatButton } from '@/components/chat/FloatingChatButton';

/**
 * This component initializes client-side services when mounted.
 * It also renders the global floating chat button.
 */
export default function ClientServiceInitializer() {
  useEffect(() => {
    // Initialize client services
    initClientServices();
  }, []);

  // Return the floating chat button component for global availability
  return <FloatingChatButton />;
}
