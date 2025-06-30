import React, { useState, useEffect } from 'react';
import { Key, Save, Eye, EyeOff, Crown, Shield, AlertCircle, CheckCircle, Settings as SettingsIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';

interface ApiKeys {
  elevenlabs: string;
  tavus: string;
  useOwnKeys: boolean;
}

const SettingsPage: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    elevenlabs: '',
    tavus: '',
    useOwnKeys: false
  });
  const [showKeys, setShowKeys] = useState({
    elevenlabs: false,
    tavus: false
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { isDark } = useTheme();
  const { user } = useAuth();
  const { currentPlan, upgradeToPremium } = useSubscription();

  useEffect(() => {
    // Load saved API keys from localStorage
    const savedKeys = localStorage.getItem('user_api_keys');
    if (savedKeys) {
      try {
        const parsed = JSON.parse(savedKeys);
        setApiKeys(parsed);
      } catch (error) {
        console.error('Error loading saved API keys:', error);
      }
    }
  }, []);

  const handleSaveKeys = async () => {
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      // Save to localStorage (in production, you'd save to Supabase)
      localStorage.setItem('user_api_keys', JSON.stringify(apiKeys));
      setSaveStatus('success');
      
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('Error saving API keys:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleKeyVisibility = (keyType: 'elevenlabs' | 'tavus') => {
    setShowKeys(prev => ({
      ...prev,
      [keyType]: !prev[keyType]
    }));
  };

  const handleKeyChange = (keyType: 'elevenlabs' | 'tavus', value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [keyType]: value
    }));
  };

  const handleToggleOwnKeys = (enabled: boolean) => {
    setApiKeys(prev => ({
      ...prev,
      useOwnKeys: enabled
    }));
  };

  return (
    <div className={`h-full overflow-y-auto transition-colors duration-300 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <div className={`border-b p-6 transition-colors duration-300 ${
        isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
      }`}>
        <div className="flex items-center space-x-3">
          <SettingsIcon className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Settings
            </h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage your API keys and subscription preferences
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Subscription Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-xl border transition-colors duration-300 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Subscription Status
            </h2>
            {currentPlan?.id !== 'free' && (
              <Crown className="w-6 h-6 text-yellow-500" />
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {currentPlan?.name} Plan
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {currentPlan?.id === 'free' 
                  ? 'Upgrade to access voice and video features'
                  : 'You have access to premium features'
                }
              </p>
            </div>
            {currentPlan?.id === 'free' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={upgradeToPremium}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                Upgrade
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* API Key Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`p-6 rounded-xl border transition-colors duration-300 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center space-x-3 mb-6">
            <Key className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
            <div>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                API Key Management
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Use your own API keys or rely on our subscription service
              </p>
            </div>
          </div>

          {/* Toggle for using own keys */}
          <div className={`p-4 rounded-lg mb-6 ${
            isDark ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
                <div>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Use Your Own API Keys
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Bypass subscription limits with your own keys
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={apiKeys.useOwnKeys}
                  onChange={(e) => handleToggleOwnKeys(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* API Key Inputs */}
          {apiKeys.useOwnKeys && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              {/* ElevenLabs API Key */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  ElevenLabs API Key
                </label>
                <div className="relative">
                  <input
                    type={showKeys.elevenlabs ? 'text' : 'password'}
                    value={apiKeys.elevenlabs}
                    onChange={(e) => handleKeyChange('elevenlabs', e.target.value)}
                    placeholder="sk-..."
                    className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => toggleKeyVisibility('elevenlabs')}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                      isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {showKeys.elevenlabs ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Required for voice responses. Get your key from{' '}
                  <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    ElevenLabs
                  </a>
                </p>
              </div>

              {/* Tavus API Key */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Tavus API Key
                </label>
                <div className="relative">
                  <input
                    type={showKeys.tavus ? 'text' : 'password'}
                    value={apiKeys.tavus}
                    onChange={(e) => handleKeyChange('tavus', e.target.value)}
                    placeholder="tvs_..."
                    className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => toggleKeyVisibility('tavus')}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                      isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {showKeys.tavus ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Required for video avatar responses. Get your key from{' '}
                  <a href="https://tavus.io" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    Tavus
                  </a>
                </p>
              </div>

              {/* Save Button */}
              <div className="flex items-center space-x-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveKeys}
                  disabled={isSaving}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isSaving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{isSaving ? 'Saving...' : 'Save Keys'}</span>
                </motion.button>

                {/* Save Status */}
                {saveStatus === 'success' && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Saved successfully</span>
                  </div>
                )}
                {saveStatus === 'error' && (
                  <div className="flex items-center space-x-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">Failed to save</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Info Box */}
          <div className={`mt-6 p-4 rounded-lg ${
            isDark ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'
          }`}>
            <div className="flex items-start space-x-3">
              <AlertCircle className={`w-5 h-5 mt-0.5 ${
                isDark ? 'text-blue-400' : 'text-blue-600'
              }`} />
              <div>
                <p className={`text-sm font-medium ${
                  isDark ? 'text-blue-300' : 'text-blue-800'
                }`}>
                  API Key Security
                </p>
                <p className={`text-xs mt-1 ${
                  isDark ? 'text-blue-400' : 'text-blue-700'
                }`}>
                  Your API keys are stored locally in your browser and are never sent to our servers. 
                  They are only used to make direct API calls to the respective services.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Account Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`p-6 rounded-xl border transition-colors duration-300 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Account Information
          </h2>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Email
              </span>
              <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {user?.email || 'Guest User'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Full Name
              </span>
              <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {user?.full_name || 'Not provided'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Member Since
              </span>
              <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {user?.created_at?.toLocaleDateString() || 'Today'}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsPage;