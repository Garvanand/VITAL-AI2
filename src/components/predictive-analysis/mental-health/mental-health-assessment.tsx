'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, SmilePlus, Smile, Meh, Frown, Angry } from 'lucide-react';

// Sample responses for demonstration (would be replaced by actual API)
const BOT_RESPONSES = {
  greeting:
    "Hello! I'm your mental health support assistant. I'm here to listen, provide support, and help you with personalized CBT exercises and self-care strategies. How are you feeling today?",

  great:
    "I'm glad to hear you're feeling great! It's important to recognize and appreciate these positive moments. What's been contributing to your positive mood lately?",

  good: "It's good to hear you're doing well. Acknowledging when we're in a good place mentally is an important part of self-awareness. Is there anything specific that's having a positive impact on your mood?",

  okay: "Thanks for sharing that you're feeling okay. Sometimes being 'okay' is just fine - not every day needs to be exceptional. Is there anything on your mind you'd like to talk about?",

  down: "I'm sorry to hear you're feeling down. It takes courage to acknowledge these feelings. Would you like to talk about what might be contributing to this feeling? Sometimes putting things into words can help us process them better.",

  struggling:
    "I appreciate you sharing that you're struggling right now. That can be really difficult, and reaching out is an important step. Would it help to explore what's making things hard right now, or would you prefer some grounding techniques to help in the moment?",

  generic: [
    'I understand how that might feel. Could you tell me more about that?',
    'Thank you for sharing that with me. How long have you been feeling this way?',
    'That sounds challenging. What strategies have helped you cope with similar situations in the past?',
    'It takes courage to talk about these things. Have you considered how your thoughts might be influencing these feelings?',
    "I'm here to support you. What would feel most helpful right now - exploring this further, or discussing some potential coping strategies?",
    'Your feelings are valid. Sometimes it can help to practice mindfulness when dealing with difficult emotions. Would you like to try a brief mindfulness exercise?',
    "I hear you. Remember that it's okay to prioritize your own well-being. What's one small thing you could do today to care for yourself?",
  ],
};

export function MentalHealthAssessment() {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: BOT_RESPONSES.greeting,
    },
  ]);
  const [userInput, setUserInput] = useState('');
  const [userMood, setUserMood] = useState<{ emoji: string; label: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const moods = [
    { emoji: '😊', label: 'Great' },
    { emoji: '🙂', label: 'Good' },
    { emoji: '😐', label: 'Okay' },
    { emoji: '😔', label: 'Down' },
    { emoji: '😢', label: 'Struggling' },
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleMoodSelect = async (mood: { emoji: string; label: string }) => {
    setUserMood(mood);
    const moodMessage = `I'm feeling ${mood.label}`;
    addMessage('user', moodMessage);
    await getChatbotResponse(moodMessage);
  };

  const addMessage = (type: 'user' | 'bot', content: string) => {
    setMessages((prev) => [...prev, { type, content }]);
  };

  const handleSubmit = async () => {
    if (!userInput.trim()) return;

    addMessage('user', userInput);
    const currentInput = userInput;
    setUserInput('');
    await getChatbotResponse(currentInput);
  };

  // Simulated chatbot response - would be replaced with actual API call
  const getChatbotResponse = async (userMessage: string) => {
    setLoading(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      let response = '';

      // Check if this is a mood message
      if (userMessage.includes("I'm feeling")) {
        const mood = userMessage.split("I'm feeling ")[1].toLowerCase();

        switch (mood) {
          case 'great':
            response = BOT_RESPONSES.great;
            break;
          case 'good':
            response = BOT_RESPONSES.good;
            break;
          case 'okay':
            response = BOT_RESPONSES.okay;
            break;
          case 'down':
            response = BOT_RESPONSES.down;
            break;
          case 'struggling':
            response = BOT_RESPONSES.struggling;
            break;
          default:
            response = BOT_RESPONSES.generic[Math.floor(Math.random() * BOT_RESPONSES.generic.length)];
        }
      } else {
        // For any other message, provide a random response
        response = BOT_RESPONSES.generic[Math.floor(Math.random() * BOT_RESPONSES.generic.length)];
      }

      addMessage('bot', response);
    } catch (err) {
      addMessage('bot', 'I apologize, but I am having trouble responding right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getMoodIcon = (label: string) => {
    switch (label) {
      case 'Great':
        return <SmilePlus className="h-6 w-6" />;
      case 'Good':
        return <Smile className="h-6 w-6" />;
      case 'Okay':
        return <Meh className="h-6 w-6" />;
      case 'Down':
        return <Frown className="h-6 w-6" />;
      case 'Struggling':
        return <Angry className="h-6 w-6" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      className="max-w-4xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold text-primary">Mental Health Support</h2>
            <p className="text-muted-foreground mt-2">
              A safe space to share your thoughts and receive supportive guidance
            </p>
          </div>

          <div className="p-6 border-b bg-background/30">
            <p className="mb-3 text-sm font-medium">How are you feeling today?</p>
            <div className="flex flex-wrap gap-3">
              {moods.map((mood) => (
                <motion.button
                  key={mood.label}
                  className={`mood-btn p-3 rounded-full flex flex-col items-center transition-colors ${
                    userMood?.label === mood.label ? 'bg-primary/20 text-primary' : 'bg-background hover:bg-primary/10'
                  }`}
                  onClick={() => handleMoodSelect(mood)}
                  title={mood.label}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-2xl">{mood.emoji}</span>
                  <span className="text-xs mt-1">{mood.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="h-[400px] overflow-y-auto p-6 bg-background/30">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  className={`mb-4 flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-primary/90 text-primary-foreground ml-4'
                        : 'bg-card text-card-foreground mr-4'
                    }`}
                  >
                    {message.content}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div className="flex justify-start mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="bg-card max-w-[80%] p-4 rounded-lg flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </motion.div>
              )}
              <div ref={chatEndRef} />
            </AnimatePresence>
          </div>

          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <Textarea
                className="flex-1 resize-none min-h-[80px]"
                value={userInput}
                onChange={(e) => {
                  const text = e.target.value;
                  if (text.length <= 2000) {
                    setUserInput(text);
                  }
                }}
                placeholder="Type your message here..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
              <Button
                className="bg-primary/90 hover:bg-primary"
                onClick={handleSubmit}
                disabled={loading || userInput.trim().length === 0}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            <div className="text-xs text-muted-foreground mt-2 text-right">{userInput.length}/2000 characters</div>
          </div>

          <div className="p-4 bg-amber-50/10 border-t text-sm text-muted-foreground">
            <p>
              <strong>Disclaimer:</strong> This AI assistant is not a replacement for professional mental health care.
              If you're experiencing a crisis or need immediate help, please contact emergency services or a mental
              health professional.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
