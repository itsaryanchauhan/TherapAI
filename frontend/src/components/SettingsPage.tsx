import React, { useState } from 'react';
import { Key, Save, Eye, EyeOff, AlertCircle, CheckCircle, Settings as SettingsIcon, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { API_SERVICES } from '../services/apiKeys';

const SettingsPage: React.FC = () => {
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [tempKeys, setTempKeys] = useState<Record<string, string>>({});
  const [savedKeys, setSavedKeys] = useState<Record<string, boolean>>({});

  const { isDark } = useTheme();
  const { user } = useAuth();
  const { apiKeys, setApiKey, removeApiKey, hasApiKey } = useSettings();

  const handleSaveKey = (service: keyof typeof apiKeys) => {
    const key = tempKeys[service];
    if (key && key.trim()) {
      setApiKey(service, key.trim());
      // Clear the temp key after successful save
      setTempKeys(prev => ({ ...prev, [service]: '' }));
      // Show saved indicator
      setSavedKeys(prev => ({ ...prev, [service]: true }));
      // Remove saved indicator after 3 seconds
      setTimeout(() => {
        setSavedKeys(prev => ({ ...prev, [service]: false }));
      }, 3000);
    }
  };

  const handleRemoveKey = (service: keyof typeof apiKeys) => {
    removeApiKey(service);
  };

  const handleKeyChange = (service: string, value: string) => {
    setTempKeys({ ...tempKeys, [service]: value });
  };

  const toggleShowKey = (service: string) => {
    setShowKeys({ ...showKeys, [service]: !showKeys[service] });
  };

  const getDisplayKey = (service: keyof typeof apiKeys) => {
    const key = apiKeys[service];
    if (!key) return '';
    if (showKeys[service]) return key;
    return key.slice(0, 8) + '••••••••' + key.slice(-4);
  };

  return (
    <div className={`h-full flex flex-col ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <SettingsIcon className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Settings
              </h1>
            </div>
            <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Manage your API keys and preferences
            </p>
          </div>

          {/* User Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-lg border mb-8 ${isDark
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
              }`}
          >
            <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Account Information
            </h2>
            <div className="space-y-2">
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <span className="font-medium">Name:</span> {user?.full_name || 'Not set'}
              </p>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <span className="font-medium">Email:</span> {user?.email}
              </p>
            </div>
          </motion.div>

          {/* API Keys Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`p-6 rounded-lg border ${isDark
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
              }`}
          >
            <div className="flex items-center space-x-3 mb-6">
              <Key className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                API Keys
              </h2>
            </div>

            <div className={`p-4 rounded-lg mb-6 ${isDark ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'
              }`}>
              <div className="flex items-start space-x-3">
                <AlertCircle className={`w-5 h-5 mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                <div className="text-sm">
                  <p className={`font-medium mb-2 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                    About API Keys
                  </p>
                  <p className={`${isDark ? 'text-blue-200' : 'text-blue-600'}`}>
                    Your API keys are stored locally in your browser and are used to access external services.
                    They are never sent to our servers. You'll need to obtain these keys from the respective service providers.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {Object.entries(API_SERVICES).map(([serviceKey, service]) => {
                const typedServiceKey = serviceKey as keyof typeof apiKeys;
                const hasKey = hasApiKey(typedServiceKey);

                return (
                  <div key={serviceKey} className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {service.name}
                        </h3>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {service.description}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {hasKey ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-yellow-500" />
                        )}
                        <span className={`text-sm ${hasKey
                          ? 'text-green-500'
                          : isDark ? 'text-yellow-400' : 'text-yellow-600'
                          }`}>
                          {hasKey ? 'Configured' : 'Required'}
                        </span>
                      </div>
                    </div>

                    {hasKey ? (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <input
                            type={showKeys[serviceKey] ? 'text' : 'password'}
                            value={getDisplayKey(typedServiceKey)}
                            readOnly
                            className={`flex-1 px-3 py-2 rounded border text-sm ${isDark
                              ? 'bg-gray-600 border-gray-500 text-gray-300'
                              : 'bg-gray-100 border-gray-300 text-gray-700'
                              }`}
                          />
                          <button
                            onClick={() => toggleShowKey(serviceKey)}
                            className={`p-2 rounded border ${isDark
                              ? 'bg-gray-600 border-gray-500 text-gray-300 hover:bg-gray-500'
                              : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                              }`}
                          >
                            {showKeys[serviceKey] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleRemoveKey(typedServiceKey)}
                            className="p-2 rounded border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {/* Update section */}
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                          <p className={`text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Update API key:
                          </p>
                          <div className="flex items-center space-x-2">
                            <input
                              type="password"
                              placeholder="Enter new API key to update"
                              value={tempKeys[serviceKey] || ''}
                              onChange={(e) => handleKeyChange(serviceKey, e.target.value)}
                              className={`flex-1 px-3 py-2 rounded border ${isDark
                                ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                }`}
                            />
                            <button
                              onClick={() => handleSaveKey(typedServiceKey)}
                              disabled={!tempKeys[serviceKey]?.trim()}
                              className={`px-4 py-2 rounded flex items-center space-x-2 transition-colors ${tempKeys[serviceKey]?.trim()
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : isDark
                                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                              <Save className="w-4 h-4" />
                              <span>Update</span>
                            </button>
                          </div>
                          {savedKeys[serviceKey] && (
                            <div className={`text-xs flex items-center space-x-2 mt-2 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                              <CheckCircle className="w-4 h-4" />
                              <span>API key updated successfully!</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <input
                            type="password"
                            placeholder={`Enter your ${service.name} API key`}
                            value={tempKeys[serviceKey] || ''}
                            onChange={(e) => handleKeyChange(serviceKey, e.target.value)}
                            className={`flex-1 px-3 py-2 rounded border ${isDark
                              ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                              }`}
                          />
                          <button
                            onClick={() => handleSaveKey(typedServiceKey)}
                            disabled={!tempKeys[serviceKey]?.trim()}
                            className={`px-4 py-2 rounded flex items-center space-x-2 transition-colors ${tempKeys[serviceKey]?.trim()
                              ? 'bg-blue-600 hover:bg-blue-700 text-white'
                              : isDark
                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              }`}
                          >
                            <Save className="w-4 h-4" />
                            <span>Save</span>
                          </button>
                        </div>
                        {savedKeys[serviceKey] && (
                          <div className={`text-xs flex items-center space-x-2 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                            <CheckCircle className="w-4 h-4" />
                            <span>API key saved successfully!</span>
                          </div>
                        )}
                        <div className="text-xs space-y-1">
                          <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Get your API key from:
                            <a
                              href={service.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`ml-1 underline ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
                            >
                              {service.website}
                            </a>
                          </p>
                          <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Features: {service.features.join(', ')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
