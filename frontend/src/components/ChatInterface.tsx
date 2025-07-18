import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, MessageSquare, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import UpgradePrompt from './UpgradePrompt';
import { generateVoiceResponse, transcribeAudio } from '../services/elevenlabs';
import { generateAIResponse } from '../services/gemini';
// Note: Supabase is only used for user authentication, not for storing chat messages

// Extend Window interface for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
    localStream: MediaStream;
    localAudio: HTMLAudioElement;
  }
}

type ChatMode = 'chat' | 'voice';

interface ChatInterfaceProps {
  onNewMessage?: (message: Message) => void;
  onNavigateToSettings?: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onNewMessage, onNavigateToSettings }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentMode, setCurrentMode] = useState<ChatMode>('chat');
  const [sessionId, setSessionId] = useState<string>('');
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [upgradePromptFeature, setUpgradePromptFeature] = useState<'voice' | undefined>(undefined);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [micPermissionGranted, setMicPermissionGranted] = useState<boolean | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const { isDark } = useTheme();
  const { user } = useAuth();
  const { hasApiKey } = useSettings();

  // Check for microphone permission on component mount
  useEffect(() => {
    const checkMicPermission = async () => {
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setMicPermissionGranted(permissionStatus.state === 'granted');

        permissionStatus.onchange = () => {
          setMicPermissionGranted(permissionStatus.state === 'granted');
        };
      } catch (error) {
        console.log('Permission API not supported, will check on first use');
        setMicPermissionGranted(null);
      }
    };

    checkMicPermission();
  }, []);

  // Helper function to check if user can access a feature based on API keys
  const canAccessFeature = (feature: 'voice') => {
    if (feature === 'voice') {
      return hasApiKey('elevenlabs');
    }
    return false;
  };

  // Helper function to check if voice input (microphone) is available
  const canUseVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    const hasSpeechAPI = !!SpeechRecognition;
    const hasElevenLabsKey = hasApiKey('elevenlabs');
    const hasMicSupport = !!navigator.mediaDevices && !!navigator.mediaDevices.getUserMedia;

    if (currentMode === 'chat') {
      return hasSpeechAPI && hasMicSupport;
    } else {
      return hasElevenLabsKey && hasMicSupport;
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Session management - simplified for local storage only
  useEffect(() => {
    if (user && !sessionId) {
      // Create a simple local session ID
      const localSessionId = `local_${Date.now()}_${user.id}`;
      setSessionId(localSessionId);
      localStorage.setItem(`therapai_session_${user.id}`, localSessionId);
    }
  }, [user]);

  // Separate effect to add welcome message when API key is added
  useEffect(() => {
    if (user && sessionId && hasApiKey('gemini') && messages.length === 0) {
      const welcomeMessage: Message = {
        id: `msg_${Date.now()}_welcome`,
        session_id: sessionId,
        content: "Hello! I'm TherapAI, your personal AI therapist designed specifically for startup founders and entrepreneurs. I understand the unique emotional challenges you face while building your business.\n\nI'm here to listen without judgment, help you process stress and anxiety, work through difficult decisions, and provide support during both the highs and lows of your entrepreneurial journey.\n\nWhat's on your mind today? Feel free to share anything that's affecting you - whether it's about your business, personal struggles, or anything else you'd like to talk through.",
        is_user: false,
        timestamp: new Date(),
        word_count: 85
      };

      setMessages([welcomeMessage]);

      // No database saving - messages are stored locally only
    }
  }, [user, sessionId, hasApiKey('gemini'), messages.length]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !user) return;

    console.log('Checking API key availability...');
    console.log('Has Gemini API key:', hasApiKey('gemini'));

    if (!hasApiKey('gemini')) {
      console.log('No Gemini API key found, showing upgrade prompt');
      setShowUpgradePrompt(true);
      return;
    }

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

    try {
      // Only save user messages locally - no database saving
      const conversationHistory = messages.map(msg => ({
        role: msg.is_user ? ('user' as const) : ('assistant' as const),
        content: msg.content
      }));

      const aiResponse = await generateAIResponse({
        message: inputValue,
        conversationHistory
      });

      console.log('AI Response received:', aiResponse);

      if (!aiResponse.success || !aiResponse.response) {
        console.error('AI Response failed:', aiResponse.error);
        throw new Error(aiResponse.error || 'Failed to generate AI response');
      }

      const responseText = aiResponse.response;
      let audioUrl = '';

      // Generate voice response if in voice mode and user has ElevenLabs API key
      if (currentMode === 'voice' && hasApiKey('elevenlabs')) {
        try {
          setIsAiSpeaking(true);
          const voiceResponse = await generateVoiceResponse(responseText);
          if (voiceResponse.status === 'ready') {
            audioUrl = voiceResponse.audioUrl;
            if (audioRef.current) {
              audioRef.current.src = audioUrl;
              audioRef.current.onended = () => setIsAiSpeaking(false);
              audioRef.current.play().catch(console.error);
            }
          }
        } catch (error) {
          console.error('Error generating voice:', error);
          setIsAiSpeaking(false);
        }
      }

      // Simulate AI thinking time
      setTimeout(async () => {
        const aiMessage: Message = {
          id: `msg_${Date.now()}_ai`,
          session_id: sessionId,
          content: responseText,
          is_user: false,
          timestamp: new Date(),
          audio_url: audioUrl || undefined,
          word_count: responseText.split(' ').length
        };

        setMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);
        setIsGeneratingResponse(false);

        if (onNewMessage) {
          onNewMessage(aiMessage);
        }
      }, 1000 + Math.random() * 1000);

    } catch (error) {
      console.error('Error generating AI response:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        hasGeminiKey: hasApiKey('gemini'),
        inputValue,
        sessionId
      });
      setIsTyping(false);
      setIsGeneratingResponse(false);

      const errorMessage: Message = {
        id: `msg_${Date.now()}_error`,
        session_id: sessionId,
        content: `I'm sorry, I'm having trouble generating a response right now. Error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your API key settings and try again.`,
        is_user: false,
        timestamp: new Date(),
        word_count: 20
      };

      setMessages(prev => [...prev, errorMessage]);
    }

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
    if (mode === 'voice' && !canAccessFeature('voice')) {
      setUpgradePromptFeature('voice');
      setShowUpgradePrompt(true);
      return;
    }
    setCurrentMode(mode);
  };

  const startRecording = async () => {
    if (!canUseVoiceInput()) {
      if (currentMode === 'voice') {
        setUpgradePromptFeature('voice');
      }
      setShowUpgradePrompt(true);
      return;
    }

    // For chat mode, use Web Speech API
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Fallback to MediaRecorder for unsupported browsers
      try {
        // Permission already verified by toggleRecording, proceed directly
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          try {
            const transcription = await transcribeAudio(audioBlob);
            if (transcription) {
              setInputValue(transcription);
            }
          } catch (error) {
            console.error('Transcription failed:', error);
          }
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Error starting MediaRecorder fallback:', error);
        alert('Unable to start recording. Please try again.');
      }
      return;
    }

    // Use Web Speech API
    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            transcript += result[0].transcript;
          }
        }

        if (transcript) {
          setInputValue(prev => prev + transcript + ' ');
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);

        if (event.error === 'not-allowed') {
          alert('Microphone access is required for voice input. Please allow microphone access in your browser settings and try again.');
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setIsRecording(false);
      alert('Unable to start voice recognition. Please try again.');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
      return;
    }

    // Only request mic access on button click
    try {
      // First check if we already have permission
      if (micPermissionGranted === true) {
        startRecording();
        return;
      }

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Update permission state
      setMicPermissionGranted(true);

      // If we're just checking permission, stop the stream
      if (!isRecording) {
        stream.getTracks().forEach(track => track.stop());
      }

      // Start recording now that we have permission
      startRecording();
    } catch (error) {
      console.error("Mic access error:", error);
      setMicPermissionGranted(false);

      if (error instanceof DOMException) {
        switch (error.name) {
          case 'NotAllowedError':
            alert("Microphone access denied. Please allow it in your browser and try again.");
            break;
          case 'NotFoundError':
            alert("No microphone found. Please connect a microphone.");
            break;
          case 'NotReadableError':
            alert("Microphone is already in use by another app.");
            break;
          default:
            alert("Microphone error: " + error.message);
        }
      } else {
        alert("Unexpected error: " + error);
      }
    }
  };

  // Voice Call Interface Component
  const VoiceCallInterface = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className={`text-center mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        <motion.div
          animate={{ scale: isAiSpeaking ? [1, 1.1, 1] : 1 }}
          transition={{ duration: 0.5, repeat: isAiSpeaking ? Infinity : 0 }}
          className={`w-32 h-32 rounded-full mx-auto mb-6 flex items-center justify-center ${isAiSpeaking
            ? 'bg-blue-500 text-white'
            : isDark
              ? 'bg-gray-700 text-blue-400'
              : 'bg-blue-100 text-blue-600'
            }`}
        >
          <Phone className="w-16 h-16" />
        </motion.div>

        <h3 className="text-2xl font-bold mb-2">
          {isAiSpeaking ? 'TherapAI is speaking...' :
            isRecording ? 'Listening...' :
              isGeneratingResponse ? 'Thinking...' :
                'Ready to listen'}
        </h3>

        <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {isRecording ? 'Speak freely about what\'s on your mind' :
            isAiSpeaking ? 'AI therapist is responding' :
              isGeneratingResponse ? 'Processing your thoughts' :
                'Tap and hold to speak with your AI therapist'}
        </p>
      </div>

      {/* Voice Controls */}
      <div className="flex items-center space-x-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleRecording}
          disabled={isGeneratingResponse || isAiSpeaking}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 ${isRecording
            ? 'bg-red-500 text-white shadow-lg animate-pulse'
            : isGeneratingResponse || isAiSpeaking
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : isDark
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
        >
          {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCurrentMode('chat')}
          className={`px-6 py-3 rounded-lg transition-colors ${isDark
            ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
        >
          Switch to Chat
        </motion.button>
      </div>

      {/* Conversation History (minimized for voice mode) */}
      {messages.length > 0 && (
        <div className={`mt-8 w-full max-w-2xl max-h-40 overflow-y-auto rounded-lg p-4 ${isDark ? 'bg-gray-800' : 'bg-gray-100'
          }`}>
          <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Recent Conversation
          </h4>
          <div className="space-y-2">
            {messages.slice(-3).map((message) => (
              <div key={message.id} className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <span className="font-medium">
                  {message.is_user ? 'You: ' : 'TherapAI: '}
                </span>
                {message.content.slice(0, 100)}...
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hidden audio element for playback */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );

  return (
    <div className={`flex flex-col h-full transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-white'
      }`}>
      {/* Mode Selector */}
      <div className={`border-b p-4 transition-colors duration-300 ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
        }`}>
        <div className="flex items-center justify-center space-x-2">
          {[
            { mode: 'chat' as ChatMode, icon: MessageSquare, label: 'Chat' },
            { mode: 'voice' as ChatMode, icon: Mic, label: 'Voice' }
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
                } ${(mode === 'voice' && !canAccessFeature('voice')) ? 'opacity-50' : ''}`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{label}</span>
              {(mode === 'voice' && !canAccessFeature('voice')) && (
                <span className="text-xs bg-yellow-500 text-black px-1 rounded">PRO</span>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Render different interfaces based on mode */}
      {currentMode === 'voice' && hasApiKey('elevenlabs') ? (
        <VoiceCallInterface />
      ) : (
        <>
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-full text-center"
              >
                <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <MessageSquare className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-blue-400' : 'text-blue-500'
                    }`} />
                  {hasApiKey('gemini') ? (
                    <>
                      <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                        Welcome to TherapAI
                      </h3>
                      <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4 max-w-md`}>
                        I'm your AI therapist specialized in helping startup founders navigate the emotional challenges of entrepreneurship.
                        I'm here to listen, support, and provide guidance. What's on your mind today?
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                        API Key Required
                      </h3>
                      <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4 max-w-md`}>
                        To start chatting, you need to add your Google Gemini API key in Settings.
                        Your API keys are stored locally and never sent to our servers.
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          if (onNavigateToSettings) {
                            onNavigateToSettings();
                          } else {
                            setShowUpgradePrompt(true);
                          }
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                      >
                        Configure API Key
                      </motion.button>
                    </>
                  )}
                </div>
              </motion.div>
            )}

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
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    <span className="text-sm">
                      {currentMode === 'voice' ? 'Generating voice response...' : 'Thinking...'}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area - only show in chat mode */}
          {currentMode === 'chat' ? (
            <div className={`border-t p-4 transition-colors duration-300 ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
              }`}>
              <div className="flex items-center space-x-3">
                {/* Voice Recording */}
                <motion.button
                  whileHover={{ scale: canUseVoiceInput() ? 1.1 : 1 }}
                  whileTap={{ scale: canUseVoiceInput() ? 0.9 : 1 }}
                  onClick={toggleRecording}
                  className={`p-3 rounded-full transition-all duration-200 ${isRecording
                    ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse shadow-lg'
                    : canUseVoiceInput()
                      ? isDark
                        ? 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                      : 'bg-gray-300 text-gray-400 cursor-not-allowed'
                    }`}
                  title={
                    isRecording ? 'Stop recording' :
                      canUseVoiceInput() ? 'Start voice recording' :
                        'Speech recognition not supported in your browser'
                  }
                  disabled={!canUseVoiceInput()}
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
                    onClick={() => {
                      if (!hasApiKey('gemini')) {
                        setShowUpgradePrompt(true);
                      }
                    }}
                    placeholder={hasApiKey('gemini') ? "Share what's on your mind..." : "Click to configure API key"}
                    className={`w-full px-4 py-3 pr-12 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${!hasApiKey('gemini') ? 'cursor-pointer' : ''
                      } ${isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    disabled={isGeneratingResponse || !hasApiKey('gemini')}
                  />

                  {/* Send Button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isGeneratingResponse || !hasApiKey('gemini')}
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-all duration-200 ${inputValue.trim() && !isGeneratingResponse && hasApiKey('gemini')
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
          ) : null}
        </>
      )}

      {/* Upgrade Prompt Modal */}
      <UpgradePrompt
        isOpen={showUpgradePrompt}
        onClose={() => {
          setShowUpgradePrompt(false);
          setUpgradePromptFeature(undefined);
        }}
        onGoToSettings={onNavigateToSettings}
        feature={!hasApiKey('gemini') ? undefined : upgradePromptFeature}
      />
    </div>
  );
};

export default ChatInterface;
