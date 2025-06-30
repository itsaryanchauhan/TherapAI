import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Video, VideoOff, MessageSquare, Phone, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import UpgradePrompt from './UpgradePrompt';
import { generateVoiceResponse, transcribeAudio } from '../services/elevenlabs';
import { generateVideoResponse } from '../services/tavus';
import { saveMessage, createSession } from '../services/supabase';

type ChatMode = 'chat' | 'voice' | 'video';

interface ChatInterfaceProps {
  onNewMessage?: (message: Message) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onNewMessage }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      session_id: 'initial',
      content: "Hello! I'm your AI therapist specialized in helping startup founders navigate the emotional challenges of entrepreneurship. I'm here to listen, support, and provide guidance. What's on your mind today?",
      is_user: false,
      timestamp: new Date(),
      word_count: 35
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentMode, setCurrentMode] = useState<ChatMode>('chat');
  const [sessionId, setSessionId] = useState<string>('');
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const { isDark } = useTheme();
  const { user } = useAuth();
  const { hasApiKey, getMissingKeys } = useSettings();

  // Helper function to check if user can access a feature based on API keys
  const canAccessFeature = (feature: 'voice' | 'video') => {
    if (feature === 'voice') {
      return hasApiKey('elevenlabs');
    } else if (feature === 'video') {
      return hasApiKey('tavus');
    }
    return false;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (user && !sessionId) {
      initializeSession();
    }
  }, [user]);

  const initializeSession = async () => {
    if (!user) return;
    try {
      const newSessionId = await createSession(user.id, currentMode);
      setSessionId(newSessionId);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const generateTherapeuticResponse = (userMessage: string): string => {
    const responses = [
      "I hear the weight of responsibility in your words. Building a startup while managing your mental health is incredibly challenging. What specific aspect of this pressure feels most overwhelming right now?",
      "It sounds like you're experiencing the classic founder's dilemma - the gap between vision and reality. This is completely normal, and many successful entrepreneurs have felt exactly what you're feeling. Let's explore what's driving these feelings.",
      "Your vulnerability in sharing this shows real strength. The entrepreneurial journey is often isolating, but you're not alone in these struggles. What support systems do you currently have in place?",
      "I can sense the frustration and perhaps some self-doubt. Remember, pivoting isn't failing - it's learning and adapting. What insights have you gained from this experience that you might not have seen before?",
      "The pressure to succeed can be overwhelming, especially when it feels like everyone is watching. Let's take a step back - what originally motivated you to start this journey, and how can we reconnect with that purpose?",
      "It's okay to feel lost sometimes. Even the most successful founders have moments of uncertainty. What would you tell a fellow founder who came to you with the same concerns?",
      "Your feelings are completely valid. The startup world often glorifies the struggle without acknowledging the real emotional toll. How are you taking care of your mental health during this challenging time?",
      "I understand this feels insurmountable right now. Sometimes the best strategy is to focus on what you can control today. What's one small step you could take that would make you feel more grounded?"
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !user) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}_user`,
      session_id: sessionId,
      content: inputValue,
      is_user: true,
      timestamp: new Date(),
      word_count: inputValue.split(' ').length
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setIsGeneratingResponse(true);

    // Save user message
    try {
      await saveMessage(userMessage);
    } catch (error) {
      console.error('Error saving user message:', error);
    }

    // Generate AI response
    const responseText = generateTherapeuticResponse(inputValue);
    let audioUrl = '';
    let videoUrl = '';

    // Generate voice response if in voice/video mode and user has access
    if ((currentMode === 'voice' || currentMode === 'video') && canAccessFeature('voice')) {
      try {
        const voiceResponse = await generateVoiceResponse(responseText);
        if (voiceResponse.status === 'ready') {
          audioUrl = voiceResponse.audioUrl;
        }
      } catch (error) {
        console.error('Error generating voice:', error);
      }
    }

    // Generate video response if in video mode and user has access
    if (currentMode === 'video' && canAccessFeature('video')) {
      try {
        const videoResponse = await generateVideoResponse(responseText);
        if (videoResponse.status === 'ready') {
          videoUrl = videoResponse.videoUrl;
        }
      } catch (error) {
        console.error('Error generating video:', error);
      }
    }

    // Simulate AI thinking time
    setTimeout(async () => {
      const aiResponse: Message = {
        id: `msg_${Date.now()}_ai`,
        session_id: sessionId,
        content: responseText,
        is_user: false,
        timestamp: new Date(),
        audio_url: audioUrl || undefined,
        video_url: videoUrl || undefined,
        word_count: responseText.split(' ').length
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
      setIsGeneratingResponse(false);

      // Save AI response
      try {
        await saveMessage(aiResponse);
      } catch (error) {
        console.error('Error saving AI message:', error);
      }

      if (onNewMessage) {
        onNewMessage(aiResponse);
      }
    }, 2000 + Math.random() * 1000);

    if (onNewMessage) {
      onNewMessage(userMessage);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleModeChange = (mode: ChatMode) => {
    if (mode !== 'chat' && !canAccessFeature(mode === 'voice' ? 'voice' : 'video')) {
      setShowUpgradePrompt(true);
      return;
    }
    setCurrentMode(mode);
  };

  const startRecording = async () => {
    if (!canAccessFeature('voice')) {
      setShowUpgradePrompt(true);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const transcription = await transcribeAudio(audioBlob);
        setInputValue(transcription);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className={`flex flex-col h-full transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-white'
      }`}>
      {/* Mode Selector */}
      <div className={`border-b p-4 transition-colors duration-300 ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
        }`}>
        <div className="flex items-center justify-center space-x-2">
          {[
            { mode: 'chat' as ChatMode, icon: MessageSquare, label: 'Chat' },
            { mode: 'voice' as ChatMode, icon: Phone, label: 'Voice' },
            { mode: 'video' as ChatMode, icon: Monitor, label: 'Video' }
          ].map(({ mode, icon: Icon, label }) => (
            <motion.button
              key={mode}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleModeChange(mode)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${currentMode === mode
                  ? 'bg-blue-500 text-white shadow-lg'
                  : isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                } ${!canAccessFeature(mode === 'voice' ? 'voice' : mode === 'video' ? 'video' : 'voice') && mode !== 'chat' ? 'opacity-50' : ''}`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{label}</span>
              {!canAccessFeature(mode === 'voice' ? 'voice' : mode === 'video' ? 'video' : 'voice') && mode !== 'chat' && (
                <span className="text-xs bg-yellow-500 text-black px-1 rounded">PRO</span>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} mode={currentMode} />
          ))}
        </AnimatePresence>

        {isTyping && <TypingIndicator />}

        {isGeneratingResponse && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex justify-start`}
          >
            <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
              }`}>
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span className="text-sm">
                  {currentMode === 'video' ? 'Generating video response...' :
                    currentMode === 'voice' ? 'Generating voice response...' :
                      'Thinking...'}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={`border-t p-4 transition-colors duration-300 ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
        }`}>
        <div className="flex items-center space-x-3">
          {/* Voice Recording */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleRecording}
            className={`p-3 rounded-full transition-all duration-200 ${isRecording
                ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse shadow-lg'
                : canAccessFeature('voice')
                  ? isDark
                    ? 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                  : 'bg-gray-300 text-gray-400 cursor-not-allowed'
              }`}
            title={isRecording ? 'Stop recording' : 'Start voice recording'}
            disabled={!canAccessFeature('voice')}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </motion.button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share what's on your mind..."
              className={`w-full px-4 py-3 pr-12 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              disabled={isGeneratingResponse}
            />

            {/* Send Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isGeneratingResponse}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-all duration-200 ${inputValue.trim() && !isGeneratingResponse
                  ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg'
                  : isDark
                    ? 'bg-gray-600 text-gray-400'
                    : 'bg-gray-200 text-gray-400'
                } disabled:cursor-not-allowed`}
            >
              <Send className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Upgrade Prompt Modal */}
      <UpgradePrompt
        isOpen={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
      />
    </div>
  );
};

export default ChatInterface;