import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export interface FeedbackData {
  responseId: string;
  responseType: string;
  rating: 'positive' | 'negative' | null;
  comment: string;
  context?: Record<string, any>;
}

// In-memory storage as server-side fallback (will reset on server restart)
let feedbackStore: FeedbackData[] = [];

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: FeedbackData = await request.json();
    const { responseId, responseType, rating, comment, context } = body;

    // Validate required fields
    if (!responseId || !responseType) {
      return NextResponse.json({ error: 'Missing required fields: responseId or responseType' }, { status: 400 });
    }

    // Create a unique ID for this feedback entry
    const feedbackId = `feedback-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;

    // Create feedback entry with timestamp
    const feedbackEntry: FeedbackData & { id: string; timestamp: string } = {
      id: feedbackId,
      responseId,
      responseType,
      rating,
      comment,
      context: context || {},
      timestamp: new Date().toISOString(),
    };

    // Store feedback in memory (server-side)
    feedbackStore.push(feedbackEntry);

    // Log feedback for analysis
    console.log(`Feedback recorded: ${responseType} - ${rating}`, {
      feedbackId,
      responseId,
      responseType,
      rating,
      commentLength: comment?.length || 0,
    });

    return NextResponse.json({
      success: true,
      message: 'Feedback recorded successfully',
      feedbackId,
    });
  } catch (error) {
    console.error('Error processing feedback:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  // Return all feedback (admin purposes only)
  return NextResponse.json({
    feedback: feedbackStore,
    count: feedbackStore.length,
  });
}
