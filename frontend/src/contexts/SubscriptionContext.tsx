import React, { createContext, useContext, useState, useEffect } from 'react';
import Purchases from '@revenuecat/purchases-js';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface Subscription {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  popular?: boolean;
}

interface SubscriptionContextType {
  currentPlan: Subscription | null;
  plans: Subscription[];
  customerInfo: any;
  offerings: any;
  canAccessFeature: (feature: 'voice' | 'video' | 'unlimited_sessions') => boolean;
  purchasePackage: (packageId: string) => Promise<void>;
  restorePurchases: () => Promise<void>;
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

const SUBSCRIPTION_PLANS: Subscription[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'USD',
    interval: 'month',
    features: [
      'Text chat only',
      '5 sessions per month',
      'Basic therapy log',
      'Community access'
    ]
  },
  {
    id: 'premium_monthly',
    name: 'Premium',
    price: 19.99,
    currency: 'USD',
    interval: 'month',
    features: [
      'Voice responses with ElevenLabs',
      'Unlimited sessions',
      'Advanced analytics',
      'Priority support',
      'Export session data',
      'Multiple languages'
    ],
    popular: true
  },
  {
    id: 'pro_monthly',
    name: 'Pro',
    price: 39.99,
    currency: 'USD',
    interval: 'month',
    features: [
      'Video avatar responses with Tavus',
      'All Premium features',
      'Custom therapy plans',
      '1-on-1 support',
      'API access',
      'White-label options'
    ]
  }
];

interface SubscriptionProviderProps {
  children: React.ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const [currentPlan, setCurrentPlan] = useState<Subscription | null>(null);
  const [customerInfo, setCustomerInfo] = useState<any>(null);
  const [offerings, setOfferings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const initializeRevenueCat = async () => {
      if (!user) return;

      try {
        // Initialize RevenueCat
        await Purchases.configure({
          apiKey: import.meta.env.VITE_REVENUECAT_PUBLIC_KEY,
          appUserID: user.id
        });

        // Get customer info
        const info = await Purchases.getCustomerInfo();
        setCustomerInfo(info);

        // Get offerings
        const offerings = await Purchases.getOfferings();
        setOfferings(offerings);

        // Determine current plan
        const activeEntitlements = info.entitlements.active;
        let planId = 'free';

        if (activeEntitlements.pro) {
          planId = 'pro_monthly';
        } else if (activeEntitlements.premium) {
          planId = 'premium_monthly';
        }

        const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId) || SUBSCRIPTION_PLANS[0];
        setCurrentPlan(plan);

      } catch (error) {
        console.error('RevenueCat initialization error:', error);
        // Fallback to free plan
        setCurrentPlan(SUBSCRIPTION_PLANS[0]);
      } finally {
        setIsLoading(false);
      }
    };

    initializeRevenueCat();
  }, [user]);

  const canAccessFeature = (feature: 'voice' | 'video' | 'unlimited_sessions'): boolean => {
    if (!customerInfo) return false;

    // Check if user has their own API keys
    const userKeys = getUserApiKeys();
    if (userKeys?.useOwnKeys) {
      switch (feature) {
        case 'voice':
          return !!userKeys.elevenlabs;
        case 'video':
          return !!userKeys.tavus;
        case 'unlimited_sessions':
          return true;
        default:
          return false;
      }
    }

    // Check RevenueCat entitlements
    const activeEntitlements = customerInfo.entitlements.active;

    switch (feature) {
      case 'voice':
        return !!(activeEntitlements.premium || activeEntitlements.pro);
      case 'video':
        return !!activeEntitlements.pro;
      case 'unlimited_sessions':
        return !!(activeEntitlements.premium || activeEntitlements.pro);
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

  const purchasePackage = async (packageId: string) => {
    try {
      setIsLoading(true);

      if (!offerings?.current?.availablePackages) {
        throw new Error('No packages available');
      }

      const packageToPurchase = offerings.current.availablePackages.find(
        (pkg: any) => pkg.identifier === packageId
      );

      if (!packageToPurchase) {
        throw new Error('Package not found');
      }

      const { customerInfo: updatedCustomerInfo } = await Purchases.purchasePackage(packageToPurchase);
      setCustomerInfo(updatedCustomerInfo);

      // Update current plan based on new entitlements
      const activeEntitlements = updatedCustomerInfo.entitlements.active;
      let planId = 'free';

      if (activeEntitlements.pro) {
        planId = 'pro_monthly';
      } else if (activeEntitlements.premium) {
        planId = 'premium_monthly';
      }

      const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId) || SUBSCRIPTION_PLANS[0];
      setCurrentPlan(plan);

      toast.success(`Successfully upgraded to ${plan.name}!`);
    } catch (error: any) {
      console.error('Purchase error:', error);

      if (error.userCancelled) {
        toast.error('Purchase cancelled');
      } else {
        toast.error('Purchase failed: ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const restorePurchases = async () => {
    try {
      setIsLoading(true);
      const { customerInfo: restoredInfo } = await Purchases.restorePurchases();
      setCustomerInfo(restoredInfo);

      const activeEntitlements = restoredInfo.entitlements.active;
      if (Object.keys(activeEntitlements).length > 0) {
        toast.success('Purchases restored successfully!');
      } else {
        toast.info('No purchases to restore');
      }
    } catch (error) {
      console.error('Restore error:', error);
      toast.error('Failed to restore purchases');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SubscriptionContext.Provider value={{
      currentPlan,
      plans: SUBSCRIPTION_PLANS,
      customerInfo,
      offerings,
      canAccessFeature,
      purchasePackage,
      restorePurchases,
      isLoading
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};