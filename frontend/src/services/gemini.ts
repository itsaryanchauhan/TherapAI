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

        if (!apiKey) {
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
                text: "You are TherapAI, an empathetic AI therapist specifically designed to help startup founders and entrepreneurs deal with the emotional challenges of building a business. You should be supportive, understanding, and provide practical advice while maintaining appropriate therapeutic boundaries. Keep responses conversational, insightful, and focused on the mental health aspects of entrepreneurship. Always be compassionate and non-judgmental."
            }]
        });

        contents.push({
            role: 'model',
            parts: [{
                text: "I understand. I'm here to support you through the emotional challenges of entrepreneurship. I'll listen with empathy and provide thoughtful guidance tailored to the unique pressures founders face."
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

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Gemini API Error:', errorData);

            if (response.status === 400) {
                return {
                    success: false,
                    error: 'Invalid API key or request. Please check your Gemini API key in Settings.'
                };
            } else if (response.status === 403) {
                return {
                    success: false,
                    error: 'API key access denied. Please ensure your Gemini API key has the correct permissions.'
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
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
};
