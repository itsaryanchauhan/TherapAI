import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Key, Video, Mic, CheckCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ApiSetupGuideProps {
  isOpen: boolean;
  onClose: () => void;
  apiProvider: 'elevenlabs' | 'tavus' | 'gemini' | null;
}

const ApiSetupGuide: React.FC<ApiSetupGuideProps> = ({ isOpen, onClose, apiProvider }) => {
  const { isDark } = useTheme();
  const [activeStep, setActiveStep] = useState(1);

  const getProviderInfo = () => {
    switch (apiProvider) {
      case 'elevenlabs':
        return {
          name: 'ElevenLabs',
          icon: Mic,
          color: 'text-purple-500',
          bgColor: 'bg-purple-100',
          darkBgColor: 'bg-purple-900/20',
          description: 'AI Voice Generation & Speech Recognition',
          website: 'https://elevenlabs.io',
          pricing: 'Free tier: 10,000 characters/month',
          features: ['Natural voice synthesis', 'Voice cloning', 'Speech-to-text transcription', 'Multiple languages'],
          useCases: ['Voice responses in TherapAI', 'Audio transcription', 'Voice conversations'],
          steps: [
            {
              title: 'Create ElevenLabs Account',
              content: 'Visit elevenlabs.io and sign up for a free account. You can use Google/GitHub signin for quick registration.',
              action: 'Sign up at ElevenLabs'
            },
            {
              title: 'Navigate to API Settings',
              content: 'Once logged in, click on your profile picture in the top-right corner and select "Profile". Then click on the "API Keys" tab.',
              action: 'Go to Profile → API Keys'
            },
            {
              title: 'Generate API Key',
              content: 'Click "Create API Key" button. Give it a descriptive name like "TherapAI Integration" and copy the generated key immediately.',
              action: 'Create & Copy API Key'
            },
            {
              title: 'Add Key to TherapAI',
              content: 'Paste the API key in TherapAI Settings under "ElevenLabs API Key". Your key is stored locally and never shared.',
              action: 'Save in TherapAI Settings'
            }
          ]
        };
      case 'tavus':
        return {
          name: 'Tavus',
          icon: Video,
          color: 'text-blue-500',
          bgColor: 'bg-blue-100',
          darkBgColor: 'bg-blue-900/20',
          description: 'AI Video Generation Platform',
          website: 'https://www.tavus.io',
          pricing: 'Contact for pricing - Professional tool',
          features: ['AI avatar videos', 'Personalized video content', 'API integration', 'Custom avatars'],
          useCases: ['Video responses in TherapAI', 'AI avatar conversations', 'Personalized therapy videos'],
          steps: [
            {
              title: 'Contact Tavus Sales',
              content: 'Tavus is an enterprise platform. Visit tavus.io and contact their sales team to discuss your use case and get access.',
              action: 'Contact Sales Team'
            },
            {
              title: 'Complete Onboarding',
              content: 'Work with Tavus team to set up your account, create avatars, and configure your use case for therapy applications.',
              action: 'Complete Setup Process'
            },
            {
              title: 'Get API Credentials',
              content: 'Once approved, you\'ll receive API credentials including your API key and any required configuration details.',
              action: 'Receive API Key'
            },
            {
              title: 'Configure TherapAI',
              content: 'Add your Tavus API key to TherapAI settings to enable video response features.',
              action: 'Save in TherapAI Settings'
            }
          ]
        };
      case 'gemini':
        return {
          name: 'Google Gemini',
          icon: Key,
          color: 'text-green-500',
          bgColor: 'bg-green-100',
          darkBgColor: 'bg-green-900/20',
          description: 'Google\'s Advanced AI Language Model',
          website: 'https://makersuite.google.com',
          pricing: 'Free tier available with generous limits',
          features: ['Advanced reasoning', 'Long context understanding', 'Multimodal capabilities', 'Fast responses'],
          useCases: ['Main AI conversation engine', 'Therapy responses', 'Emotional intelligence'],
          steps: [
            {
              title: 'Go to Google AI Studio',
              content: 'Visit makersuite.google.com (Google AI Studio) and sign in with your Google account.',
              action: 'Visit Google AI Studio'
            },
            {
              title: 'Get API Key',
              content: 'Click "Get API Key" button in the top navigation. Then click "Create API key in new project" or select existing project.',
              action: 'Generate API Key'
            },
            {
              title: 'Copy Your Key',
              content: 'Copy the generated API key immediately. Keep it secure as it won\'t be shown again.',
              action: 'Copy & Secure Key'
            },
            {
              title: 'Add to TherapAI',
              content: 'Paste the API key in TherapAI Settings under "Google Gemini API Key" to enable AI conversations.',
              action: 'Save in Settings'
            }
          ]
        };
      default:
        return null;
    }
  };

  const providerInfo = getProviderInfo();

  if (!isOpen || !providerInfo) return null;

  const Icon = providerInfo.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-lg ${isDark ? providerInfo.darkBgColor : providerInfo.bgColor}`}>
                  <Icon className={`w-6 h-6 ${providerInfo.color}`} />
                </div>
                <div>
                  <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {providerInfo.name} Setup Guide
                  </h2>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {providerInfo.description}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Overview */}
              <div className="lg:col-span-1">
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Overview
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                        PRICING
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {providerInfo.pricing}
                      </p>
                    </div>

                    <div>
                      <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                        KEY FEATURES
                      </p>
                      <ul className="space-y-1">
                        {providerInfo.features.map((feature, index) => (
                          <li key={index} className={`text-sm flex items-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                        USE IN THERAPAI
                      </p>
                      <ul className="space-y-1">
                        {providerInfo.useCases.map((useCase, index) => (
                          <li key={index} className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            • {useCase}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <motion.a
                      href={providerInfo.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center justify-center space-x-2 w-full p-3 rounded-lg transition-colors ${
                        isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
                      } text-white`}
                    >
                      <span>Visit {providerInfo.name}</span>
                      <ExternalLink className="w-4 h-4" />
                    </motion.a>
                  </div>
                </div>
              </div>

              {/* Right Column - Step by Step */}
              <div className="lg:col-span-2">
                <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Step-by-Step Setup
                </h3>

                <div className="space-y-4">
                  {providerInfo.steps.map((step, index) => (
                    <motion.div
                      key={index}
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        activeStep === index + 1
                          ? isDark
                            ? 'border-blue-500 bg-blue-900/20'
                            : 'border-blue-500 bg-blue-50'
                          : isDark
                          ? 'border-gray-600 bg-gray-700 hover:border-gray-500'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}
                      onClick={() => setActiveStep(index + 1)}
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                            activeStep === index + 1
                              ? 'bg-blue-500 text-white'
                              : isDark
                              ? 'bg-gray-600 text-gray-300'
                              : 'bg-gray-300 text-gray-700'
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {step.title}
                          </h4>
                          <p className={`text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {step.content}
                          </p>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              activeStep === index + 1
                                ? 'bg-blue-500 text-white'
                                : isDark
                                ? 'bg-gray-600 text-gray-300'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {step.action}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* API Key Security Note */}
                <div className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-yellow-900/20 border border-yellow-800' : 'bg-yellow-50 border border-yellow-200'}`}>
                  <div className="flex items-start space-x-2">
                    <Key className={`w-5 h-5 mt-0.5 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                    <div>
                      <h4 className={`font-medium ${isDark ? 'text-yellow-400' : 'text-yellow-800'}`}>
                        API Key Security
                      </h4>
                      <p className={`text-sm mt-1 ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                        Your API keys are stored locally in your browser and never sent to our servers. 
                        Keep them secure and don't share them with others. You can regenerate them anytime in your provider's dashboard.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={`p-6 border-t ${isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center justify-between">
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Need help? Check the provider's documentation or contact support.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Got it!
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ApiSetupGuide;
