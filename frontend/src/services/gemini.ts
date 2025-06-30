import { ApiKeyManager } from './apiKeys';

export interface ChatRequest {
    message: string;
    conversationHistory?: Array<{
        role: 'user' | 'assistant';
        content: string;
    }>;
}

export interface ChatResponse {
    success: boolean;
    message?: string;
    response?: string;
    error?: string;
}

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export const generateAIResponse = async (request: ChatRequest): Promise<ChatResponse> => {
    try {
        const apiKey = ApiKeyManager.getApiKey('gemini');
        console.log('API Key found:', !!apiKey);
        console.log('API Key length:', apiKey?.length || 0);
        console.log('API Key starts with AIza:', apiKey?.startsWith('AIza') || false);

        if (!apiKey) {
            console.error('No Gemini API key found');
            return {
                success: false,
                error: 'Gemini API key not found. Please add your API key in Settings.'
            };
        }

        console.log('Attempting to call Gemini API...');

        // Format conversation history for Gemini
        const contents = [];

        // Add system prompt for therapy context
        contents.push({
            role: 'user',
            parts: [{
                text: "You are TherapAI, a warm and empathetic AI therapist who specializes in helping startup founders and entrepreneurs. Have natural, flowing conversations - avoid using markdown formatting, bullet points, numbered lists, or overly structured responses. Talk like a real person would, with warmth and understanding. Keep your responses conversational and concise, focusing on being genuinely supportive. You understand the unique pressures of building a business and can relate to the emotional rollercoaster of entrepreneurship."
            }]
        });

        contents.push({
            role: 'model',
            parts: [{
                text: "I'm here for you. Building a startup is incredibly challenging emotionally, and I understand the unique pressures you're facing. Let's talk about whatever's on your mind - I'm here to listen and support you through this journey."
            }]
        });

        // Add conversation history
        if (request.conversationHistory && request.conversationHistory.length > 0) {
            for (const msg of request.conversationHistory) {
                contents.push({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.content }]
                });
            }
        }

        // Add current message
        contents.push({
            role: 'user',
            parts: [{ text: request.message }]
        });

        const requestBody = {
            contents: contents,
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            }
        };

        console.log('Request body:', JSON.stringify(requestBody, null, 2));

        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini API Error Response Text:', errorText);

            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch (e) {
                errorData = { error: { message: errorText } };
            }

            console.error('Gemini API Error:', errorData);

            if (response.status === 400) {
                return {
                    success: false,
                    error: `API Error 400: ${errorData.error?.message || 'Invalid request. Check your API key format.'}`
                };
            } else if (response.status === 403) {
                return {
                    success: false,
                    error: `API Error 403: ${errorData.error?.message || 'Access denied. Check API key permissions and billing.'}`
                };
            } else if (response.status === 429) {
                return {
                    success: false,
                    error: 'API Error 429: Rate limit exceeded. Please try again later.'
                };
            } else if (response.status >= 500) {
                return {
                    success: false,
                    error: `API Error ${response.status}: Server error. Please try again later.`
                };
            }

            return {
                success: false,
                error: errorData.error?.message || `API Error: ${response.status}`
            };
        }

        const data = await response.json();
        console.log('Gemini API response:', data);

        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const responseText = data.candidates[0].content.parts[0].text;
            console.log('Generated response:', responseText);
            return {
                success: true,
                response: responseText
            };
        } else {
            console.error('No valid response from Gemini API:', data);
            return {
                success: false,
                error: 'No response generated from AI'
            };
        }
    } catch (error) {
        console.error('Error generating AI response:', error);
        
        // Handle specific network errors common in Netlify deployments
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            return {
                success: false,
                error: 'Network error: Unable to reach Gemini API. This might be due to network restrictions or CORS issues.'
            };
        }
        
        if (error instanceof Error && error.name === 'AbortError') {
            return {
                success: false,
                error: 'Request timeout: The API call took too long to complete.'
            };
        }
        
        return {
            success: false,
            error: error instanceof Error ? `Network error: ${error.message}` : 'Unknown network error occurred'
        };
    }
};
