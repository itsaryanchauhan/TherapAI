import React, { useState } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Message } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface MessageBubbleProps {
  message: Message;
  mode: 'chat' | 'voice';
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, mode }) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const { isDark } = useTheme();

  const playAudio = () => {
    if (message.audio_url) {
      const audio = new Audio(message.audio_url);
      audio.play();
      setIsPlayingAudio(true);
      audio.onended = () => setIsPlayingAudio(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${message.is_user ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
        message.is_user
          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
          : isDark
          ? 'bg-gray-700 text-gray-100'
          : 'bg-gray-100 text-gray-900'
      } shadow-lg`}>
        
        {/* Message Content */}
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>

        {/* Audio Player */}
        {message.audio_url && !message.is_user && mode === 'voice' && (
          <div className="mt-2 flex items-center space-x-2">
            <button
              onClick={playAudio}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              {isPlayingAudio ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>
            {isPlayingAudio && (
              <Volume2 className="w-4 h-4 animate-pulse" />
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MessageBubble;