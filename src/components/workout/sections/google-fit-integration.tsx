'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Footprints, Flame, Timer, BadgeCheck, Link as LinkIcon, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWorkout } from '../context/workout-context';

export function GoogleFitIntegration() {
  const { googleFit, connectGoogleFit, disconnectGoogleFit } = useWorkout();
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      await connectGoogleFit();
    } catch (error) {
      console.error('Failed to connect to Google Fit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    disconnectGoogleFit();
  };

  const handleRefresh = async () => {
    if (googleFit.connected) {
      setIsLoading(true);
      try {
        await connectGoogleFit();
      } catch (error) {
        console.error('Failed to refresh Google Fit data:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-primary" fill="currentColor">
            <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm-1-11h2v7h-2zm0-3h2v2h-2z" />
          </svg>
          <h3 className="text-lg font-medium text-foreground">Google Fit</h3>
        </div>

        {googleFit.connected ? (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading} className="gap-1">
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              <span>Refresh</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDisconnect}
              className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
            >
              Disconnect
            </Button>
          </div>
        ) : null}
      </div>

      {!googleFit.connected ? (
        <div className="text-center py-6">
          <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <LinkIcon className="w-8 h-8 text-primary" />
          </div>
          <h4 className="text-lg font-medium mb-2 text-foreground">Connect to Google Fit</h4>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            Connect your Google Fit account to automatically sync your activity data and track your progress.
          </p>
          <Button onClick={handleConnect} disabled={isLoading} className="gap-2 bg-primary hover:bg-primary/90">
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1V11.1Z"
                />
              </svg>
            )}
            Connect with Google Fit
          </Button>
        </div>
      ) : (
        <div>
          <div className="flex items-center mb-4">
            <div className="bg-primary/10 rounded-full p-2">
              <BadgeCheck className="w-5 h-5 text-primary" />
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-foreground">Connected to Google Fit</div>
              <div className="text-xs text-muted-foreground">Last synced: {new Date().toLocaleTimeString()}</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-card/30 backdrop-blur-sm rounded-lg p-4 text-center border border-border/50"
            >
              <div className="flex justify-center mb-2">
                <Footprints className="w-6 h-6 text-primary" />
              </div>
              <div className="font-mono text-xl font-bold text-foreground">{googleFit.steps.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground mt-1">Steps</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-card/30 backdrop-blur-sm rounded-lg p-4 text-center border border-border/50"
            >
              <div className="flex justify-center mb-2">
                <Flame className="w-6 h-6 text-orange-400" />
              </div>
              <div className="font-mono text-xl font-bold text-foreground">{googleFit.calories.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground mt-1">Calories Burned</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-card/30 backdrop-blur-sm rounded-lg p-4 text-center border border-border/50"
            >
              <div className="flex justify-center mb-2">
                <Timer className="w-6 h-6 text-primary" />
              </div>
              <div className="font-mono text-xl font-bold text-foreground">{googleFit.activeMinutes}</div>
              <div className="text-xs text-muted-foreground mt-1">Active Minutes</div>
            </motion.div>
          </div>

          <div className="text-center mt-6">
            <div className="text-sm text-muted-foreground mb-2">Your daily goal: 10,000 steps</div>
            <div className="h-2 bg-card/50 rounded-full mb-2">
              <motion.div
                className="h-2 bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (googleFit.steps / 10000) * 100)}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              {Math.round((googleFit.steps / 10000) * 100)}% of daily goal completed
            </div>
          </div>

          {googleFit.steps < 5000 && (
            <div className="flex items-center mt-4 p-3 bg-yellow-950/20 text-yellow-400 rounded-lg text-sm border border-yellow-900/50">
              <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
              <div>
                <span className="font-medium">You're a bit behind today!</span> Take a quick walk to boost your step
                count.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
