'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, ThumbsDown, MessageSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { saveFeedback } from '@/lib/services/llm-tuning';

export interface FeedbackData {
  responseId: string;
  responseType: string;
  rating: 'positive' | 'negative' | null;
  comment: string;
  context?: Record<string, any>;
}

interface FeedbackCollectorProps {
  responseId: string;
  responseType: string;
  context?: Record<string, any>;
  onFeedbackSubmitted?: (feedbackData: FeedbackData) => void;
  className?: string;
}

export function FeedbackCollector({
  responseId,
  responseType,
  context = {},
  onFeedbackSubmitted,
  className = '',
}: FeedbackCollectorProps) {
  const [rating, setRating] = useState<'positive' | 'negative' | null>(null);
  const [comment, setComment] = useState('');
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleRating = async (newRating: 'positive' | 'negative') => {
    setRating(newRating);

    // Submit the feedback immediately if no comment
    if (!isCommentOpen) {
      await submitFeedback(newRating, '');
    }
  };

  const handleCommentToggle = () => {
    setIsCommentOpen(!isCommentOpen);
  };

  const submitFeedback = async (submittedRating: 'positive' | 'negative' | null, submittedComment: string) => {
    setIsSubmitting(true);

    try {
      const feedbackData: FeedbackData & { timestamp: string } = {
        responseId,
        responseType,
        rating: submittedRating,
        comment: submittedComment,
        context,
        timestamp: new Date().toISOString(),
      };

      // Save feedback to local storage
      saveFeedback(feedbackData);

      // Call the callback if provided
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted(feedbackData);
      }

      setIsSubmitted(true);
      toast({
        title: 'Feedback recorded',
        description: 'Thank you for your feedback!',
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Error recording feedback',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitComment = async () => {
    await submitFeedback(rating, comment);
    setIsCommentOpen(false);
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <AnimatePresence>
        {!isSubmitted ? (
          <motion.div
            className="flex items-center space-x-2 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <span className="text-muted-foreground">Was this response helpful?</span>
            <Button
              variant="ghost"
              size="sm"
              className={`p-1 ${rating === 'positive' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : ''}`}
              onClick={() => handleRating('positive')}
              disabled={isSubmitting}
            >
              <ThumbsUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`p-1 ${rating === 'negative' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : ''}`}
              onClick={() => handleRating('negative')}
              disabled={isSubmitting}
            >
              <ThumbsDown className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="p-1" onClick={handleCommentToggle} disabled={isSubmitting}>
              <MessageSquare className="h-4 w-4" />
            </Button>
          </motion.div>
        ) : (
          <motion.div className="text-sm text-muted-foreground" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            Thanks for your feedback!
          </motion.div>
        )}

        {isCommentOpen && (
          <motion.div
            className="mt-2 space-y-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Additional comments</span>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleCommentToggle}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What could be improved?"
              className="text-sm min-h-[80px]"
              disabled={isSubmitting}
            />
            <Button size="sm" onClick={handleSubmitComment} disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
