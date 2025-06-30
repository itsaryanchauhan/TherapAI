// Debug utility to test Gemini API directly
// Use this in browser console to debug API issues

interface TestResult {
    success: boolean;
    message: string;
    details?: any;
}

export const testGeminiApi = async (apiKey: string): Promise<TestResult> => {
    console.log('Testing Gemini API...');

    // Basic API key validation
    if (!apiKey) {
        return {
            success: false,
            message: 'No API key provided'
        };
    }

    if (!apiKey.startsWith('AIza')) {
        return {
            success: false,
            message: 'API key does not start with "AIza" - this might not be a valid Gemini API key'
        };
    }

    if (apiKey.length < 35 || apiKey.length > 45) {
        return {
            success: false,
            message: `API key length (${apiKey.length}) is unusual for Gemini keys (typically 39 characters)`
        };
    }

    console.log('API key format looks valid, testing API call...');

    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

    const requestBody = {
        contents: [
            {
                role: 'user',
                parts: [{ text: 'Hello, can you respond with just "API test successful"?' }]
            }
        ],
        generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 50,
        }
    };

    try {
        console.log('Making API request to:', `${GEMINI_API_URL}?key=${apiKey.substring(0, 10)}...`);

        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        const responseText = await response.text();
        console.log('Raw response:', responseText);

        if (!response.ok) {
            let errorData;
            try {
                errorData = JSON.parse(responseText);
            } catch (e) {
                errorData = { error: { message: responseText } };
            }

            return {
                success: false,
                message: `API call failed with status ${response.status}`,
                details: errorData
            };
        }

        const data = JSON.parse(responseText);

        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const responseContent = data.candidates[0].content.parts[0].text;
            return {
                success: true,
                message: 'API test successful!',
                details: {
                    response: responseContent,
                    fullResponse: data
                }
            };
        } else {
            return {
                success: false,
                message: 'API returned unexpected response format',
                details: data
            };
        }

    } catch (error) {
        console.error('Network or other error:', error);
        return {
            success: false,
            message: 'Network error or request failed',
            details: error
        };
    }
};

// Function to test with stored API key
export const testStoredGeminiApi = async (): Promise<TestResult> => {
    try {
        const stored = localStorage.getItem('therapai_api_keys');
        const keys = stored ? JSON.parse(stored) : {};
        const apiKey = keys.gemini;

        if (!apiKey) {
            return {
                success: false,
                message: 'No Gemini API key found in localStorage'
            };
        }

        console.log('Found stored API key, testing...');
        return await testGeminiApi(apiKey);

    } catch (error) {
        return {
            success: false,
            message: 'Error reading API key from localStorage',
            details: error
        };
    }
};

// Quick test function for browser console
(window as any).testGemini = testStoredGeminiApi;
(window as any).testGeminiWithKey = testGeminiApi;

console.log('Gemini test utilities loaded. Use testGemini() to test with stored key or testGeminiWithKey("your-api-key") to test with a specific key.');
