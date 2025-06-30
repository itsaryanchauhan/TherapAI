import React, { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

interface VideoResponseProps {
  videoUrl: string;
}

const VideoResponse: React.FC<VideoResponseProps> = ({ videoUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { isDark } = useTheme();

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      {/* Loading Placeholder */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-8 w-8 border-b-2 border-white"
          />
        </div>
      )}

      {/* Video Element (placeholder for demo) */}
      <div 
        className="w-full h-full bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center cursor-pointer relative"
        onClick={handlePlayPause}
        onLoad={() => setIsLoading(false)}
      >
        {/* Simulated Avatar */}
        <motion.div
          animate={isPlaying ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
        >
          <div className="w-24 h-24 bg-white/30 rounded-full flex items-center justify-center">
            <div className="w-16 h-16 bg-white/40 rounded-full"></div>
          </div>
        </motion.div>
        
        {/* Play/Pause Overlay */}
        {!isPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-black/30"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-16 h-16 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors duration-200"
            >
              <Play className="w-8 h-8 text-gray-800 ml-1" />
            </motion.div>
          </motion.div>
        )}

        {/* Speaking Animation */}
        {isPlaying && (
          <div className="absolute bottom-4 left-4 flex space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1 bg-white rounded-full"
                animate={{
                  height: [4, 12, 4],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.1
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Video Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePlayPause}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors duration-200"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-white" />
              ) : (
                <Play className="w-4 h-4 text-white ml-0.5" />
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleMuteToggle}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors duration-200"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-white" />
              ) : (
                <Volume2 className="w-4 h-4 text-white" />
              )}
            </motion.button>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors duration-200"
          >
            <Maximize className="w-4 h-4 text-white" />
          </motion.button>
        </div>
      </div>

      {/* Demo Label */}
      <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 rounded text-xs text-white">
        AI Therapist
      </div>
    </div>
  );
};

export default VideoResponse;