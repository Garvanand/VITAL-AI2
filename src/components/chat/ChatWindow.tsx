'use client';

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface ChatWindowProps {
  onClose: () => void;
}

export function ChatWindow({ onClose }: ChatWindowProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Ensure iframe content loads properly
  useEffect(() => {
    const handleIframeLoad = () => {
      // This could be expanded to include any post-load modifications if needed
      console.log('Chatbot iframe loaded');
    };

    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('load', handleIframeLoad);
    }

    return () => {
      if (iframe) {
        iframe.removeEventListener('load', handleIframeLoad);
      }
    };
  }, []);

  return (
    <motion.div
      className="fixed bottom-24 right-6 z-50 w-[90vw] sm:w-[450px] rounded-xl overflow-hidden shadow-2xl"
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      style={{
        background: 'linear-gradient(180deg, rgba(12, 24, 36, 0.95), rgba(18, 24, 30, 0.92))',
        boxShadow:
          '0 10px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(21, 227, 227, 0.2), 0 0 0 1px rgba(255, 248, 0, 0.08)',
        backdropFilter: 'blur(12px)',
        height: '80vh',
        maxHeight: '600px',
      }}
    >
      {/* Header with gradient similar to the site theme */}
      <div
        className="flex items-center justify-between p-3 border-b"
        style={{
          background: 'linear-gradient(90deg, rgba(21, 227, 227, 0.15), rgba(21, 227, 227, 0.05))',
          borderBottom: '1px solid rgba(255, 248, 0, 0.1)',
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{
              background: 'linear-gradient(135deg, #15E3E3, #15E3E3)',
              boxShadow: '0 0 8px rgba(21, 227, 227, 0.6)',
            }}
          ></div>
          <h3 className="font-medium text-primary-foreground">VitalAI Healthcare Assistant</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-500/20 transition-colors"
          aria-label="Close chat"
        >
          <X className="w-5 h-5 text-gray-300" />
        </button>
      </div>

      {/* Content area with iframe embedding the chatbot */}
      <div className="w-full" style={{ height: 'calc(100% - 49px)' }}>
        <iframe
          ref={iframeRef}
          src="https://healthcare-bot-v2.vercel.app/"
          className="w-full h-full border-none"
          style={{ height: '100%' }}
          allow="camera; microphone; fullscreen; clipboard-read; clipboard-write"
          title="VitalAI Healthcare Chatbot"
          loading="eager"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads"
        ></iframe>
      </div>

      {/* Optional: Glow effects to match site theme */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] z-10"
        style={{
          background:
            'linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(21, 227, 227, 0.3) 50%, rgba(255, 255, 255, 0) 100%)',
          opacity: 0.6,
          filter: 'blur(1px)',
        }}
      ></div>
    </motion.div>
  );
}
