import React from 'react';
import { X, Crown, Check, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useSubscription } from '../contexts/SubscriptionContext';

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({ isOpen, onClose }) => {
  const { isDark } = useTheme();
  const { plans, upgradeToPremium, isLoading } = useSubscription();

  const handleUpgrade = async () => {
    try {
      await upgradeToPremium();
      onClose();
    } catch (error) {
      console.error('Upgrade failed:', error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`relative w-full max-w-md p-6 rounded-2xl shadow-2xl ${
              isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className={`absolute top-4 right-4 p-2 rounded-full transition-colors duration-200 ${
                isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Crown className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Unlock Premium Features
              </h2>
              <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Get access to voice and video therapy sessions
              </p>
            </div>

            {/* Premium Plan */}
            <div className={`p-6 rounded-xl border-2 border-blue-500 mb-6 ${
              isDark ? 'bg-gray-700' : 'bg-blue-50'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Premium Plan
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Everything you need for comprehensive therapy
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    $19.99
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    /month
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  'Voice responses with ElevenLabs',
                  'Unlimited therapy sessions',
                  'Advanced progress analytics',
                  'Priority customer support',
                  'Export session transcripts'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pro Plan Teaser */}
            <div className={`p-4 rounded-xl border mb-6 ${
              isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Pro Plan - $39.99/month
                  </h4>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Includes video avatar responses + all Premium features
                  </p>
                </div>
                <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded">
                  Coming Soon
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUpgrade}
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Crown className="w-5 h-5" />
                    <span>Upgrade to Premium</span>
                  </>
                )}
              </motion.button>

              <button
                onClick={onClose}
                className={`w-full py-3 px-4 rounded-xl font-medium transition-colors duration-200 ${
                  isDark 
                    ? 'text-gray-400 hover:bg-gray-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Maybe Later
              </button>
            </div>

            {/* Footer */}
            <div className="text-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <a
                href="https://bolt.new"
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center text-xs ${
                  isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                } transition-colors duration-200`}
              >
                <Zap className="w-3 h-3 mr-1 text-yellow-500" />
                Built with Bolt
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UpgradePrompt;