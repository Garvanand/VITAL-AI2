'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import { ChatWindow } from './ChatWindow';

export function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <AnimatePresence>{isOpen && <ChatWindow onClose={() => setIsOpen(false)} />}</AnimatePresence>

      <motion.button
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          background: 'linear-gradient(135deg, rgba(21, 227, 227, 0.95), rgba(21, 227, 227, 0.7))',
          boxShadow:
            '0 4px 20px rgba(0, 0, 0, 0.2), 0 0 15px rgba(21, 227, 227, 0.5), 0 0 0 2px rgba(255, 248, 0, 0.1)',
        }}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-primary-foreground" />
        ) : (
          <MessageCircle className="w-6 h-6 text-primary-foreground" />
        )}

        {/* Yellow highlight ring */}
        <span
          className="absolute w-full h-full rounded-full"
          style={{
            border: '1px solid rgba(255, 248, 0, 0.3)',
            filter: 'blur(1px)',
          }}
        ></span>

        {/* Pulsing effect for the chat button */}
        {!isOpen && (
          <>
            <span
              className="absolute w-full h-full rounded-full animate-ping opacity-20"
              style={{
                background: 'radial-gradient(circle, rgba(21, 227, 227, 0.8), rgba(21, 227, 227, 0))',
                animation: 'pulse 3s ease-in-out infinite',
              }}
            ></span>
            <span
              className="absolute -inset-1 rounded-full"
              style={{
                background: 'linear-gradient(45deg, rgba(255, 248, 0, 0.1), rgba(255, 248, 0, 0))',
                filter: 'blur(2px)',
                opacity: 0.6,
                animation: 'pulse 8s ease-in-out infinite alternate',
              }}
            ></span>
          </>
        )}
      </motion.button>
    </>
  );
}
