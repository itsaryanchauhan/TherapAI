import { getApiHeaders } from './apiKeys';

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

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const generateAIResponse = async (request: ChatRequest): Promise<ChatResponse> => {
    try {
        const headers = getApiHeaders();

        const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            body: JSON.stringify(request)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to generate AI response');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error generating AI response:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
};
