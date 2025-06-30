import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, X, Settings } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: 'voice' | 'video' | 'unlimited_sessions';
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({ isOpen, onClose, feature }) => {
  const { isDark } = useTheme();

  const getFeatureTitle = (feature?: string) => {
    switch (feature) {
      case 'voice':
        return 'Voice Therapy Requires API Key';
      case 'video':
        return 'Video Therapy Requires API Key';
      default:
        return 'API Key Required';
    }
  };

  const getFeatureDescription = (feature?: string) => {
    switch (feature) {
      case 'voice':
        return 'To use voice therapy features, you need to add your ElevenLabs API key in Settings.';
      case 'video':
        return 'To use video therapy features, you need to add your Tavus API key in Settings.';
      default:
        return 'To use this feature, you need to add the required API key in Settings.';
    }
  };

  const getRequiredService = (feature?: string) => {
    switch (feature) {
      case 'voice':
        return 'ElevenLabs';
      case 'video':
        return 'Tavus';
      default:
        return 'the required service';
    }
  };

  const getServiceUrl = (feature?: string) => {
    switch (feature) {
      case 'voice':
        return 'https://elevenlabs.io';
      case 'video':
        return 'https://tavus.io';
      default:
        return '#';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`relative w-full max-w-md rounded-xl p-6 shadow-2xl ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
              }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className={`absolute top-4 right-4 p-2 rounded-lg transition-colors ${isDark
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                }`}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className={`p-3 rounded-full ${isDark ? 'bg-blue-900/30' : 'bg-blue-100'
                  }`}>
                  <Key className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <h2 className="text-2xl font-bold">
                  {getFeatureTitle(feature)}
                </h2>
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {getFeatureDescription(feature)}
              </p>
            </div>

            {/* Instructions */}
            <div className={`p-4 rounded-lg mb-6 ${isDark ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
              <h3 className="font-semibold mb-2">How to get started:</h3>
              <ol className={`text-sm space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <li>1. Get an API key from <a
                  href={getServiceUrl(feature)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`underline ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
                >
                  {getRequiredService(feature)}
                </a></li>
                <li>2. Go to Settings and add your API key</li>
                <li>3. Return here to use the feature</li>
              </ol>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  // You could navigate to settings here if using a router
                  onClose();
                }}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors ${isDark
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
              >
                <Settings className="w-4 h-4" />
                <span>Go to Settings</span>
              </button>
              <button
                onClick={onClose}
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
              >
                Later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UpgradePrompt;
