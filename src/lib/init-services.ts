import { initLLMTuning } from '@/lib/services/llm-tuning';

/**
 * Initialize all application services that need to be started on application load
 */
export async function initializeServices() {
  console.log('Initializing application services...');

  try {
    // Initialize LLM tuning service
    await initLLMTuning();
    console.log('LLM tuning service initialized successfully');

    // Add other service initializations here as needed
  } catch (error) {
    console.error('Error initializing services:', error);
  }
}

/**
 * Call this function to initialize services on the client side
 */
export function initClientServices() {
  // Only run in browser environment
  if (typeof window !== 'undefined') {
    // Use setTimeout to ensure this runs after the app is mounted
    setTimeout(() => {
      initializeServices().catch((err) => {
        console.error('Failed to initialize client services:', err);
      });
    }, 1000);
  }
}
