'use client';

import { useState, useEffect } from 'react';
import { isGeminiKeyValid, isRapidApiKeyValid } from '@/lib/utils/env-checker';

export default function ApiDebugPage() {
  const [apiStatuses, setApiStatuses] = useState({
    gemini: { loading: true, valid: false, error: null as string | null },
    rapidApi: { loading: true, valid: false, error: null as string | null },
  });

  useEffect(() => {
    // Check Gemini API key
    checkGeminiApi();

    // Check RapidAPI key
    checkRapidApi();
  }, []);

  const checkGeminiApi = async () => {
    try {
      const isValid = isGeminiKeyValid();

      // If key seems valid, test an actual API call
      if (isValid) {
        const response = await fetch('/api/gemini/recipes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cuisine: 'Indian',
            maxPrepTime: 30,
          }),
        });

        if (response.ok) {
          setApiStatuses((prev) => ({
            ...prev,
            gemini: { loading: false, valid: true, error: null },
          }));
        } else {
          const error = await response.text();
          setApiStatuses((prev) => ({
            ...prev,
            gemini: { loading: false, valid: false, error: `API error: ${response.status}. ${error}` },
          }));
        }
      } else {
        setApiStatuses((prev) => ({
          ...prev,
          gemini: { loading: false, valid: false, error: 'API key appears to be invalid or missing' },
        }));
      }
    } catch (error) {
      setApiStatuses((prev) => ({
        ...prev,
        gemini: {
          loading: false,
          valid: false,
          error: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      }));
    }
  };

  const checkRapidApi = async () => {
    try {
      const isValid = isRapidApiKeyValid();

      // If key seems valid, test an actual API call
      if (isValid) {
        try {
          const options = {
            method: 'GET',
            headers: {
              'x-rapidapi-host': 'exercise-db-fitness-workout-gym.p.rapidapi.com',
              'x-rapidapi-key': process.env.NEXT_PUBLIC_RAPIDAPI_KEY || '',
            },
          };

          const response = await fetch('/api/workouts/equipment', {
            method: 'GET',
          });

          if (response.ok) {
            const data = await response.json();

            // Check if we got mock data
            const isMockData =
              data.length > 0 && data.every((item: string) => MOCK_EQUIPMENT.includes(item.toLowerCase()));

            if (isMockData) {
              setApiStatuses((prev) => ({
                ...prev,
                rapidApi: {
                  loading: false,
                  valid: false,
                  error: 'Using mock data - API key may be invalid or rate limited',
                },
              }));
            } else {
              setApiStatuses((prev) => ({
                ...prev,
                rapidApi: { loading: false, valid: true, error: null },
              }));
            }
          } else {
            const error = await response.text();
            setApiStatuses((prev) => ({
              ...prev,
              rapidApi: { loading: false, valid: false, error: `API error: ${response.status}. ${error}` },
            }));
          }
        } catch (error) {
          setApiStatuses((prev) => ({
            ...prev,
            rapidApi: {
              loading: false,
              valid: false,
              error: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          }));
        }
      } else {
        setApiStatuses((prev) => ({
          ...prev,
          rapidApi: { loading: false, valid: false, error: 'API key appears to be invalid or missing' },
        }));
      }
    } catch (error) {
      setApiStatuses((prev) => ({
        ...prev,
        rapidApi: {
          loading: false,
          valid: false,
          error: `Error checking key: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      }));
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">API Configuration Debug</h1>

      <div className="grid gap-6">
        {/* Gemini API Status */}
        <div className="border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Gemini API Status</h2>
            <div
              className={`h-4 w-4 rounded-full ${
                apiStatuses.gemini.loading ? 'bg-yellow-500' : apiStatuses.gemini.valid ? 'bg-green-500' : 'bg-red-500'
              }`}
            ></div>
          </div>

          {apiStatuses.gemini.loading ? (
            <p className="text-yellow-600">Testing Gemini API connection...</p>
          ) : apiStatuses.gemini.valid ? (
            <p className="text-green-600">✅ Gemini API is properly configured and working!</p>
          ) : (
            <div className="text-red-600">
              <p className="font-medium">❌ Gemini API issue detected:</p>
              <p className="mt-1">{apiStatuses.gemini.error || 'Unknown error'}</p>
              <div className="mt-4 p-4 bg-gray-100 rounded-md text-gray-800 text-sm">
                <h3 className="font-medium mb-2">Troubleshooting steps:</h3>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Check that GEMINI_API_KEY is properly set in your .env.local file</li>
                  <li>Verify that the API key starts with 'AIza'</li>
                  <li>Make sure you haven't exceeded your API quota</li>
                  <li>Try restarting your development server</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* RapidAPI Status */}
        <div className="border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">RapidAPI Status</h2>
            <div
              className={`h-4 w-4 rounded-full ${
                apiStatuses.rapidApi.loading
                  ? 'bg-yellow-500'
                  : apiStatuses.rapidApi.valid
                    ? 'bg-green-500'
                    : 'bg-red-500'
              }`}
            ></div>
          </div>

          {apiStatuses.rapidApi.loading ? (
            <p className="text-yellow-600">Testing RapidAPI connection...</p>
          ) : apiStatuses.rapidApi.valid ? (
            <p className="text-green-600">✅ RapidAPI is properly configured and working!</p>
          ) : (
            <div className="text-red-600">
              <p className="font-medium">❌ RapidAPI issue detected:</p>
              <p className="mt-1">{apiStatuses.rapidApi.error || 'Unknown error'}</p>
              <div className="mt-4 p-4 bg-gray-100 rounded-md text-gray-800 text-sm">
                <h3 className="font-medium mb-2">Troubleshooting steps:</h3>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Check that NEXT_PUBLIC_RAPIDAPI_KEY is properly set in your .env.local file</li>
                  <li>Make sure you've subscribed to the Exercise DB API on RapidAPI</li>
                  <li>Verify you haven't exceeded your rate limits or quota</li>
                  <li>Try restarting your development server</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setApiStatuses({
                gemini: { loading: true, valid: false, error: null },
                rapidApi: { loading: true, valid: false, error: null },
              });
              checkGeminiApi();
              checkRapidApi();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Recheck API Status
          </button>
        </div>
      </div>
    </div>
  );
}

// Mock equipment data for comparison
const MOCK_EQUIPMENT = [
  'barbell',
  'dumbbell',
  'kettlebell',
  'cable',
  'resistance band',
  'bosu ball',
  'stability ball',
  'medicine ball',
  'ez barbell',
  'body weight',
  'smith machine',
  'jump rope',
  'suspension trainer',
  'pull-up bar',
  'bench',
  'squat rack',
  'battle ropes',
  'weight plate',
  'foam roller',
  'yoga mat',
];
