'use client';

// Interface for LLM parameters
export interface LLMParameters {
  temperature: number;
  topP: number;
  topK: number;
  maxOutputTokens: number;
}

// Default parameters for different response types
const DEFAULT_PARAMETERS: Record<string, LLMParameters> = {
  'indian-cuisine': {
    temperature: 0.6,
    topP: 0.9,
    topK: 40,
    maxOutputTokens: 2048,
  },
  'ingredient-based': {
    temperature: 0.4, // Lower temperature for more precise recipes
    topP: 0.85,
    topK: 30,
    maxOutputTokens: 2048,
  },
  'mental-health': {
    temperature: 0.3,
    topP: 0.85,
    topK: 20,
    maxOutputTokens: 1024,
  },
  'fitness-plan': {
    temperature: 0.3,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 1500,
  },
  default: {
    temperature: 0.7,
    topP: 0.9,
    topK: 40,
    maxOutputTokens: 1024,
  },
};

// Store current optimal parameters (start with defaults)
let currentOptimalParameters: Record<string, LLMParameters> = { ...DEFAULT_PARAMETERS };

// Storage keys
const STORAGE_KEY_PARAMETERS = 'vital_ai_llm_parameters';
const STORAGE_KEY_FEEDBACK = 'vital_ai_llm_feedback';

// Feedback structure
interface BaseFeedback {
  responseId: string;
  responseType: string;
  rating: 'positive' | 'negative' | null;
  comment: string;
  context?: Record<string, any>;
  timestamp: string;
}

export type StoredFeedback = BaseFeedback;

// In-memory feedback storage
let feedbackStore: StoredFeedback[] = [];

/**
 * Get the optimized LLM parameters for a specific response type
 */
export function getOptimizedParameters(responseType: string): LLMParameters {
  return currentOptimalParameters[responseType] || currentOptimalParameters.default;
}

/**
 * Saves user feedback in local storage for later review
 * In a production environment, this would likely send the feedback to a server
 */
export function saveFeedback(feedback: StoredFeedback): void {
  try {
    // Get existing feedback from localStorage
    const existingFeedbackStr = localStorage.getItem('userFeedback');
    const existingFeedback: StoredFeedback[] = existingFeedbackStr ? JSON.parse(existingFeedbackStr) : [];

    // Add new feedback
    existingFeedback.push(feedback);

    // Save back to localStorage
    localStorage.setItem('userFeedback', JSON.stringify(existingFeedback));

    console.log('Feedback saved:', feedback);
  } catch (error) {
    console.error('Error saving feedback:', error);
  }
}

/**
 * Load feedback from local storage (client-side only)
 */
function loadFeedbackFromStorage(): StoredFeedback[] {
  if (typeof window === 'undefined') return [];

  try {
    const storedFeedback = localStorage.getItem(STORAGE_KEY_FEEDBACK);
    if (!storedFeedback) return [];

    return JSON.parse(storedFeedback) as StoredFeedback[];
  } catch (error) {
    console.error('Error loading feedback from local storage:', error);
    return [];
  }
}

/**
 * Save parameters to local storage (client-side only)
 */
function saveParametersToStorage(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY_PARAMETERS, JSON.stringify(currentOptimalParameters));
    console.log('LLM parameters saved to local storage');
  } catch (error) {
    console.error('Error saving parameters to local storage:', error);
  }
}

/**
 * Load parameters from local storage (client-side only)
 */
function loadParametersFromStorage(): Record<string, LLMParameters> | null {
  if (typeof window === 'undefined') return null;

  try {
    const storedParameters = localStorage.getItem(STORAGE_KEY_PARAMETERS);
    if (!storedParameters) return null;

    return JSON.parse(storedParameters) as Record<string, LLMParameters>;
  } catch (error) {
    console.error('Error loading parameters from local storage:', error);
    return null;
  }
}

/**
 * Analyze feedback data and update LLM parameters
 */
export function analyzeFeedbackAndUpdateParameters(): void {
  try {
    // Get feedback data
    const feedbackData = feedbackStore.length > 0 ? feedbackStore : loadFeedbackFromStorage();

    if (!feedbackData || feedbackData.length === 0) {
      console.log('No feedback data to analyze');
      return;
    }

    // Get recent feedback (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentFeedback = feedbackData.filter((feedback) => {
      const feedbackDate = new Date(feedback.timestamp);
      return feedbackDate >= sevenDaysAgo;
    });

    // Group feedback by response type
    const feedbackByType: Record<string, StoredFeedback[]> = {};

    recentFeedback.forEach((feedback) => {
      const type = feedback.responseType;
      if (!feedbackByType[type]) {
        feedbackByType[type] = [];
      }
      feedbackByType[type].push(feedback);
    });

    // Analyze each response type and update parameters
    Object.entries(feedbackByType).forEach(([type, feedbacks]) => {
      // Skip if we don't have enough feedback for this type
      if (feedbacks.length < 3) return;

      // Calculate positive feedback ratio
      const positiveCount = feedbacks.filter((f) => f.rating === 'positive').length;
      const totalRated = feedbacks.filter((f) => f.rating === 'positive' || f.rating === 'negative').length;

      if (totalRated === 0) return;

      const positiveRatio = positiveCount / totalRated;

      // Get current parameters for this type
      const currentParams = currentOptimalParameters[type] || DEFAULT_PARAMETERS.default;

      // Adjust parameters based on feedback ratio
      let newParams: LLMParameters = { ...currentParams };

      if (positiveRatio < 0.4) {
        // Poor performance, reduce creativity, increase precision
        newParams = {
          ...newParams,
          temperature: Math.max(0.1, newParams.temperature - 0.1),
          topP: Math.max(0.5, newParams.topP - 0.05),
        };
      } else if (positiveRatio > 0.8) {
        // Good performance, can try more creative outputs
        newParams = {
          ...newParams,
          temperature: Math.min(1.0, newParams.temperature + 0.05),
          topP: Math.min(1.0, newParams.topP + 0.02),
        };
      }

      // Update the current optimal parameters
      currentOptimalParameters[type] = newParams;

      console.log(`Updated parameters for ${type} based on ${feedbacks.length} feedbacks:`, newParams);
    });

    // Save updated parameters
    saveParametersToStorage();
  } catch (error) {
    console.error('Error analyzing feedback:', error);
  }
}

/**
 * Get a prompt with optimal parameters for the given response type
 */
export function getEnhancedPrompt(basePrompt: string, responseType: string): string {
  // Here we can implement prompt engineering techniques based on feedback
  // For now, just returning the base prompt
  return basePrompt;
}

/**
 * Initialize the LLM tuning service
 */
export function initLLMTuning(): void {
  console.log('Initializing LLM tuning service...');

  try {
    // Load feedback from storage
    const storedFeedback = loadFeedbackFromStorage();
    if (storedFeedback.length > 0) {
      feedbackStore = storedFeedback;
      console.log(`Loaded ${storedFeedback.length} feedback entries from storage`);
    }

    // Load parameters from storage
    const storedParameters = loadParametersFromStorage();
    if (storedParameters) {
      // Merge with defaults to ensure we have all required parameters
      currentOptimalParameters = {
        ...DEFAULT_PARAMETERS,
        ...storedParameters,
      };
      console.log('Loaded optimal parameters from storage');
    }

    // Analyze feedback and update parameters
    analyzeFeedbackAndUpdateParameters();

    // Schedule regular analysis of feedback (once per day)
    if (typeof window !== 'undefined') {
      const ANALYSIS_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
      setInterval(analyzeFeedbackAndUpdateParameters, ANALYSIS_INTERVAL);
    }

    console.log('LLM tuning service initialized successfully');
  } catch (error) {
    console.error('Error initializing LLM tuning service:', error);
  }
}

// Export the default parameters for reference
export { DEFAULT_PARAMETERS };
