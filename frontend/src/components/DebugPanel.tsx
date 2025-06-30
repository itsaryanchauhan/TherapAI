import React, { useState } from 'react';
import { ApiKeyManager } from '../services/apiKeys';
import { generateAIResponse } from '../services/gemini';

const DebugPanel: React.FC = () => {
    const [debugInfo, setDebugInfo] = useState<string>('');
    const [isVisible, setIsVisible] = useState(false);

    const runDebugTests = async () => {
        let info = '=== TherapAI Debug Information ===\n\n';
        
        // Test 1: Check localStorage
        try {
            const stored = localStorage.getItem('therapai_api_keys');
            info += `1. localStorage Access: ✅ Working\n`;
            info += `   Stored data: ${stored ? 'Found' : 'Empty'}\n`;
            
            if (stored) {
                const keys = JSON.parse(stored);
                info += `   Gemini key exists: ${!!keys.gemini}\n`;
                info += `   Gemini key length: ${keys.gemini?.length || 0}\n`;
                info += `   Key format: ${keys.gemini?.startsWith('AIza') ? '✅ Valid' : '❌ Invalid'}\n`;
            }
        } catch (error) {
            info += `1. localStorage Access: ❌ Failed - ${error}\n`;
        }
        
        info += '\n';
        
        // Test 2: API Key Manager
        try {
            const hasKey = ApiKeyManager.hasApiKey('gemini');
            const apiKey = ApiKeyManager.getApiKey('gemini');
            info += `2. API Key Manager: ✅ Working\n`;
            info += `   hasApiKey result: ${hasKey}\n`;
            info += `   getApiKey result: ${apiKey ? 'Found' : 'Not found'}\n`;
        } catch (error) {
            info += `2. API Key Manager: ❌ Failed - ${error}\n`;
        }
        
        info += '\n';
        
        // Test 3: Network connectivity
        try {
            await fetch('https://www.google.com', { mode: 'no-cors' });
            info += `3. Network Connectivity: ✅ Working\n`;
        } catch (error) {
            info += `3. Network Connectivity: ❌ Failed - ${error}\n`;
        }
        
        info += '\n';
        
        // Test 4: Gemini API test call
        if (ApiKeyManager.hasApiKey('gemini')) {
            try {
                info += `4. Testing Gemini API...\n`;
                const result = await generateAIResponse({
                    message: 'Hello, please respond with just "Test successful"'
                });
                
                if (result.success) {
                    info += `   Gemini API: ✅ Working\n`;
                    info += `   Response: ${result.response}\n`;
                } else {
                    info += `   Gemini API: ❌ Failed\n`;
                    info += `   Error: ${result.error}\n`;
                }
            } catch (error) {
                info += `   Gemini API: ❌ Exception - ${error}\n`;
            }
        } else {
            info += `4. Gemini API: ⏭️ Skipped (No API key)\n`;
        }
        
        info += '\n';
        
        // Test 5: Environment information
        info += `5. Environment Info:\n`;
        info += `   User Agent: ${navigator.userAgent}\n`;
        info += `   Location: ${window.location.href}\n`;
        info += `   Protocol: ${window.location.protocol}\n`;
        info += `   Local Storage Available: ${typeof(Storage) !== "undefined"}\n`;
        
        setDebugInfo(info);
    };

    if (!isVisible) {
        return (
            <div className="fixed bottom-4 right-4 z-50">
                <button
                    onClick={() => setIsVisible(true)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium transition-colors animate-pulse"
                >
                    🔧 Debug Chat Issues
                </button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Debug Information</h3>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>
                
                <div className="mb-4">
                    <button
                        onClick={runDebugTests}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Run Debug Tests
                    </button>
                </div>
                
                <div className="overflow-auto max-h-64">
                    <pre className="text-xs whitespace-pre-wrap font-mono bg-gray-100 dark:bg-gray-700 p-3 rounded">
                        {debugInfo || 'Click "Run Debug Tests" to see diagnostic information'}
                    </pre>
                </div>
                
                {debugInfo && (
                    <div className="mt-4">
                        <button
                            onClick={() => {
                                navigator.clipboard?.writeText(debugInfo);
                                alert('Debug info copied to clipboard!');
                            }}
                            className="bg-green-500 text-white px-3 py-1 rounded text-xs"
                        >
                            Copy to Clipboard
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DebugPanel;
