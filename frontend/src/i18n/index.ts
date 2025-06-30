import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: 'en',
        debug: import.meta.env.DEV,

        interpolation: {
            escapeValue: false, // React already does escaping
        },

        backend: {
            loadPath: '/locales/{{lng}}/{{ns}}.json',
        },

        detection: {
            order: ['localStorage', 'navigator', 'htmlTag'],
            caches: ['localStorage'],
        },

        resources: {
            en: {
                translation: {
                    app: {
                        name: 'TherapAI',
                        tagline: 'Your AI-powered mental health companion'
                    },
                    nav: {
                        chat: 'Chat',
                        dashboard: 'Dashboard',
                        community: 'Community',
                        settings: 'Settings'
                    },
                    chat: {
                        placeholder: 'Share what\'s on your mind...',
                        send: 'Send',
                        voiceMode: 'Voice Mode',
                        videoMode: 'Video Mode',
                        upgradeForVoice: 'Upgrade to Premium for voice responses',
                        upgradeForVideo: 'Upgrade to Pro for video responses'
                    },
                    subscription: {
                        currentPlan: 'Current Plan',
                        upgrade: 'Upgrade',
                        features: 'Features',
                        monthly: 'Monthly',
                        purchaseSuccess: 'Purchase successful!',
                        purchaseFailed: 'Purchase failed',
                        restorePurchases: 'Restore Purchases'
                    },
                    settings: {
                        profile: 'Profile',
                        preferences: 'Preferences',
                        language: 'Language',
                        theme: 'Theme',
                        apiKeys: 'API Keys',
                        useOwnKeys: 'Use your own API keys',
                        elevenlabsKey: 'ElevenLabs API Key',
                        tavusKey: 'Tavus API Key',
                        save: 'Save'
                    }
                }
            },
            es: {
                translation: {
                    app: {
                        name: 'TherapAI',
                        tagline: 'Tu compañero de salud mental con IA'
                    },
                    nav: {
                        chat: 'Chat',
                        dashboard: 'Panel',
                        community: 'Comunidad',
                        settings: 'Configuración'
                    },
                    chat: {
                        placeholder: 'Comparte lo que tienes en mente...',
                        send: 'Enviar',
                        voiceMode: 'Modo de Voz',
                        videoMode: 'Modo de Video',
                        upgradeForVoice: 'Actualiza a Premium para respuestas de voz',
                        upgradeForVideo: 'Actualiza a Pro para respuestas de video'
                    },
                    subscription: {
                        currentPlan: 'Plan Actual',
                        upgrade: 'Actualizar',
                        features: 'Características',
                        monthly: 'Mensual',
                        purchaseSuccess: '¡Compra exitosa!',
                        purchaseFailed: 'Compra fallida',
                        restorePurchases: 'Restaurar Compras'
                    },
                    settings: {
                        profile: 'Perfil',
                        preferences: 'Preferencias',
                        language: 'Idioma',
                        theme: 'Tema',
                        apiKeys: 'Claves API',
                        useOwnKeys: 'Usar tus propias claves API',
                        elevenlabsKey: 'Clave API de ElevenLabs',
                        tavusKey: 'Clave API de Tavus',
                        save: 'Guardar'
                    }
                }
            },
            fr: {
                translation: {
                    app: {
                        name: 'TherapAI',
                        tagline: 'Votre compagnon de santé mentale IA'
                    },
                    nav: {
                        chat: 'Chat',
                        dashboard: 'Tableau de bord',
                        community: 'Communauté',
                        settings: 'Paramètres'
                    },
                    chat: {
                        placeholder: 'Partagez ce qui vous préoccupe...',
                        send: 'Envoyer',
                        voiceMode: 'Mode Vocal',
                        videoMode: 'Mode Vidéo',
                        upgradeForVoice: 'Passez à Premium pour les réponses vocales',
                        upgradeForVideo: 'Passez à Pro pour les réponses vidéo'
                    },
                    subscription: {
                        currentPlan: 'Plan Actuel',
                        upgrade: 'Mettre à niveau',
                        features: 'Fonctionnalités',
                        monthly: 'Mensuel',
                        purchaseSuccess: 'Achat réussi!',
                        purchaseFailed: 'Échec de l\'achat',
                        restorePurchases: 'Restaurer les Achats'
                    },
                    settings: {
                        profile: 'Profil',
                        preferences: 'Préférences',
                        language: 'Langue',
                        theme: 'Thème',
                        apiKeys: 'Clés API',
                        useOwnKeys: 'Utiliser vos propres clés API',
                        elevenlabsKey: 'Clé API ElevenLabs',
                        tavusKey: 'Clé API Tavus',
                        save: 'Sauvegarder'
                    }
                }
            }
        }
    });

export default i18n;
