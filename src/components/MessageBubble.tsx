import React, { useState } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Message } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import VideoResponse from './VideoResponse';

interface MessageBubbleProps {
  message: Message;
  mode: 'chat' | 'voice' | 'video';
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
        {/* Video Response */}
        {message.video_url && !message.is_user && mode === 'video' && (
          <div className="mb-3">
            <VideoResponse videoUrl={message.video_url} />
          </div>
        )}
        
        {/* Message Content */}
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>

        {/* Audio Player */}
        {message.audio_url && !message.is_user && (mode === 'voice' || mode === 'video') && (
          <div className="mt-3 flex items-center space-x-2">
            <button
              onClick={playAudio}
              className={`p-2 rounded-full transition-colors duration-200 ${
                isDark ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {isPlayingAudio ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>
            <Volume2 className="w-4 h-4 opacity-60" />
            <span className="text-xs opacity-60">Voice response</span>
          </div>
        )}
        
        {/* Timestamp */}
        <div className={`text-xs mt-2 ${
          message.is_user
            ? 'text-blue-100'
            : isDark
            ? 'text-gray-400'
            : 'text-gray-500'
        }`}>
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;