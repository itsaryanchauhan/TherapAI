// API Key management for localStorage
export interface ApiKeys {
    gemini?: string;
    elevenlabs?: string;
s}

const STORAGE_KEY = 'therapai_api_keys';

export class ApiKeyManager {
    // Get all API keys from localStorage
    static getApiKeys(): ApiKeys {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.error('Error reading API keys from localStorage:', error);
            return {};
        }
    }

    // Get a specific API key
    static getApiKey(service: keyof ApiKeys): string | undefined {
        const keys = this.getApiKeys();
        return keys[service];
    }

    // Set API keys
    static setApiKeys(keys: ApiKeys): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
        } catch (error) {
            console.error('Error saving API keys to localStorage:', error);
        }
    }

    // Set a specific API key
    static setApiKey(service: keyof ApiKeys, key: string): void {
        const keys = this.getApiKeys();
        keys[service] = key;
        this.setApiKeys(keys);
    }

    // Remove a specific API key
    static removeApiKey(service: keyof ApiKeys): void {
        const keys = this.getApiKeys();
        delete keys[service];
        this.setApiKeys(keys);
    }

    // Clear all API keys
    static clearApiKeys(): void {
        localStorage.removeItem(STORAGE_KEY);
    }

    // Check if a service has an API key
    static hasApiKey(service: keyof ApiKeys): boolean {
        const key = this.getApiKey(service);
        return Boolean(key && key.trim().length > 0);
    }

    // Validate API key format (basic validation)
    static validateApiKey(service: keyof ApiKeys, key: string): boolean {
        if (!key || key.trim().length === 0) return false;

        switch (service) {
            case 'gemini':
                // Gemini keys typically start with 'AIza' and are about 39 characters
                return key.startsWith('AIza') && key.length >= 35 && key.length <= 45;

            case 'elevenlabs':
                // ElevenLabs keys are typically 32 characters
                return key.length > 20 && key.length < 100;

            default:
                return key.length > 10;
        }
    }

    // Get missing API keys for features
    static getMissingKeys(requiredServices: (keyof ApiKeys)[]): (keyof ApiKeys)[] {
        return requiredServices.filter(service => !this.hasApiKey(service));
    }
}

// Helper to get HTTP headers with API keys
export const getApiHeaders = (): Record<string, string> => {
    const keys = ApiKeyManager.getApiKeys();
    const headers: Record<string, string> = {};

    if (keys.gemini) {
        headers['x-gemini-api-key'] = keys.gemini;
    }

    if (keys.elevenlabs) {
        headers['x-elevenlabs-api-key'] = keys.elevenlabs;
    }

    return headers;
};

// API service info
export const API_SERVICES = {
    gemini: {
        name: 'Google Gemini',
        description: 'AI Chat and Conversations',
        website: 'https://makersuite.google.com/app/apikey',
        required: true,
        features: ['AI Chat', 'Therapy Sessions']
    },
    elevenlabs: {
        name: 'ElevenLabs',
        description: 'Voice Generation',
        website: 'https://elevenlabs.io',
        required: false,
        features: ['Voice Responses', 'Audio Generation']
    }
} as const;
