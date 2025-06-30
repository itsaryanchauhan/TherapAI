import React, { createContext, useContext, useState, useEffect } from 'react';
import { SubscriptionPlan } from '../types';
import { useAuth } from './AuthContext';

interface SubscriptionContextType {
  currentPlan: SubscriptionPlan | null;
  plans: SubscriptionPlan[];
  canAccessFeature: (feature: 'voice' | 'video' | 'unlimited_sessions') => boolean;
  upgradeToPremium: () => Promise<void>;
  isLoading: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    features: ['Text chat only', '5 sessions per month', 'Basic therapy log']
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 19.99,
    features: ['Voice responses', 'Unlimited sessions', 'Advanced analytics', 'Priority support'],
    popular: true
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 39.99,
    features: ['Video avatar responses', 'All Premium features', 'Custom therapy plans', '1-on-1 support']
  }
];

interface SubscriptionProviderProps {
  children: React.ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const plan = SUBSCRIPTION_PLANS.find(p => p.id === user.subscription_tier) || SUBSCRIPTION_PLANS[0];
      setCurrentPlan(plan);
    }
    setIsLoading(false);
  }, [user]);

  const canAccessFeature = (feature: 'voice' | 'video' | 'unlimited_sessions'): boolean => {
    if (!currentPlan) return false;

    // Check if user has their own API keys
    const userKeys = getUserApiKeys();
    if (userKeys?.useOwnKeys) {
      switch (feature) {
        case 'voice':
          return !!userKeys.elevenlabs;
        case 'video':
          return !!userKeys.tavus;
        case 'unlimited_sessions':
          return true; // With own keys, unlimited sessions are allowed
        default:
          return false;
      }
    }

    // Check subscription-based access
    switch (feature) {
      case 'voice':
        return currentPlan.id !== 'free';
      case 'video':
        return currentPlan.id === 'pro';
      case 'unlimited_sessions':
        return currentPlan.id !== 'free';
      default:
        return false;
    }
  };

  const getUserApiKeys = () => {
    try {
      const saved = localStorage.getItem('user_api_keys');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.useOwnKeys ? parsed : null;
      }
    } catch (error) {
      console.error('Error loading user API keys:', error);
    }
    return null;
  };

  const upgradeToPremium = async () => {
    // This would integrate with RevenueCat
    try {
      setIsLoading(true);
      // Simulate upgrade process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation, this would update the user's subscription in Supabase
      const premiumPlan = SUBSCRIPTION_PLANS.find(p => p.id === 'premium');
      setCurrentPlan(premiumPlan || null);
    } catch (error) {
      console.error('Upgrade failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SubscriptionContext.Provider value={{
      currentPlan,
      plans: SUBSCRIPTION_PLANS,
      canAccessFeature,
      upgradeToPremium,
      isLoading
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};