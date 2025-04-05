import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET() {
  try {
    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API key is missing', status: 'error' }, { status: 400 });
    }

    // Validate the API key format
    if (!process.env.GEMINI_API_KEY.startsWith('AIza')) {
      return NextResponse.json({ error: 'Gemini API key appears to be invalid', status: 'error' }, { status: 400 });
    }

    // Initialize the API with the configured key
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Make a simple API request to verify the key is working
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent('Hello world');
      await result.response;

      return NextResponse.json({ status: 'ok', message: 'Gemini API is configured correctly' }, { status: 200 });
    } catch (apiError) {
      console.error('Gemini API verification failed:', apiError);
      return NextResponse.json(
        {
          error: 'Gemini API key validation failed',
          details: apiError instanceof Error ? apiError.message : 'Unknown error',
          status: 'error',
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({ error: 'Failed to check Gemini API health', status: 'error' }, { status: 500 });
  }
}
