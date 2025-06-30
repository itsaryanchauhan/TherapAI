import React, { createContext, useContext, useState } from 'react';
import { ApiKeyManager, ApiKeys, API_SERVICES } from '../services/apiKeys';
import toast from 'react-hot-toast';

interface SettingsContextType {
    apiKeys: ApiKeys;
    setApiKey: (service: keyof ApiKeys, key: string) => void;
    removeApiKey: (service: keyof ApiKeys) => void;
    hasApiKey: (service: keyof ApiKeys) => boolean;
    validateApiKey: (service: keyof ApiKeys, key: string) => boolean;
    getMissingKeys: (requiredServices: (keyof ApiKeys)[]) => (keyof ApiKeys)[];
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

interface SettingsProviderProps {
    children: React.ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
    const [apiKeys, setApiKeysState] = useState<ApiKeys>(() => ApiKeyManager.getApiKeys());

    const setApiKey = (service: keyof ApiKeys, key: string) => {
        if (!ApiKeyManager.validateApiKey(service, key)) {
            toast.error(`Invalid ${API_SERVICES[service].name} API key format`);
            return;
        }

        ApiKeyManager.setApiKey(service, key);
        setApiKeysState(ApiKeyManager.getApiKeys());
        toast.success(`${API_SERVICES[service].name} API key saved`);
    };

    const removeApiKey = (service: keyof ApiKeys) => {
        ApiKeyManager.removeApiKey(service);
        setApiKeysState(ApiKeyManager.getApiKeys());
        toast.success(`${API_SERVICES[service].name} API key removed`);
    };

    const hasApiKey = (service: keyof ApiKeys) => {
        return ApiKeyManager.hasApiKey(service);
    };

    const validateApiKey = (service: keyof ApiKeys, key: string) => {
        return ApiKeyManager.validateApiKey(service, key);
    };

    const getMissingKeys = (requiredServices: (keyof ApiKeys)[]) => {
        return ApiKeyManager.getMissingKeys(requiredServices);
    };

    const value: SettingsContextType = {
        apiKeys,
        setApiKey,
        removeApiKey,
        hasApiKey,
        validateApiKey,
        getMissingKeys
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};

// Legacy exports for compatibility with existing code
export { SettingsProvider as SubscriptionProvider, useSettings as useSubscription };
