import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Chrome, Eye, EyeOff, Zap, UserCheck, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const LoginPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { signIn, signUp, signInWithGoogle, continueAsGuest, isLoading, error, clearError } = useAuth();
  const { isDark } = useTheme();

  // Clear error when switching between sign in/up
  useEffect(() => {
    clearError();
    setShowSuccess(false);
  }, [isSignUp, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    clearError();
    setShowSuccess(false);
    
    try {
      if (isSignUp) {
        await signUp(email, password, fullName);
        setShowSuccess(true);
        // Clear form
        setEmail('');
        setPassword('');
        setFullName('');
      } else {
        await signIn(email, password);
      }
    } catch (error) {
      console.error('Authentication error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    clearError();
    setShowSuccess(false);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google sign-in error:', error);
    }
  };

  const handleGuestContinue = () => {
    clearError();
    setShowSuccess(false);
    continueAsGuest();
  };

  const isFormLoading = isLoading || isSubmitting;

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 transition-colors duration-300 ${
      isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`max-w-md w-full space-y-8 p-8 rounded-2xl shadow-2xl transition-colors duration-300 ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white/80 backdrop-blur-sm border border-gray-100'
        }`}
      >
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex items-center justify-center mb-6"
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              isDark ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gradient-to-r from-blue-500 to-purple-500'
            } shadow-lg`}>
              <User className="w-8 h-8 text-white" />
            </div>
          </motion.div>
          <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {isSignUp ? 'Join Startup Therapist' : 'Welcome Back'}
          </h2>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {isSignUp 
              ? 'Start your therapeutic journey today' 
              : 'Continue your path to mental wellness'
            }
          </p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg border text-sm ${
              isDark 
                ? 'bg-green-900/20 border-green-800 text-green-400' 
                : 'bg-green-50 border-green-200 text-green-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Account created successfully! Please check your email to verify your account.</span>
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg border text-sm ${
              isDark 
                ? 'bg-red-900/20 border-red-800 text-red-400' 
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <div>
                <p className="font-medium">Authentication Error</p>
                <p className="mt-1">{error}</p>
                {(error.includes('connection') || error.includes('fetch') || error.includes('network') || error.includes('Supabase')) && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs opacity-90">Troubleshooting steps:</p>
                    <ul className="text-xs opacity-80 space-y-1 ml-4">
                      <li>• Check your internet connection</li>
                      <li>• Verify Supabase configuration in .env file</li>
                      <li>• Try refreshing the page</li>
                      <li>• Or continue as guest to explore the app</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {isSignUp && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative">
                <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  required={isSignUp}
                  disabled={isFormLoading}
                />
              </div>
            </motion.div>
          )}

          <div className="relative">
            <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              required
              disabled={isFormLoading}
            />
          </div>

          <div className="relative">
            <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full pl-10 pr-12 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              required
              disabled={isFormLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-600'
              }`}
              disabled={isFormLoading}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <motion.button
            type="submit"
            disabled={isFormLoading}
            className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all duration-200 ${
              isFormLoading
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
            }`}
            whileTap={{ scale: 0.98 }}
          >
            {isFormLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full"
                />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <UserCheck className="w-5 h-5" />
                <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
              </>
            )}
          </motion.button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className={`absolute inset-0 flex items-center ${
            isDark ? 'border-gray-600' : 'border-gray-300'
          }`}>
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className={`px-2 ${
              isDark ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'
            }`}>Or continue with</span>
          </div>
        </div>

        {/* Google Sign In */}
        <motion.button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isFormLoading}
          className={`w-full py-3 px-4 rounded-lg border flex items-center justify-center space-x-2 transition-all duration-200 ${
            isDark 
              ? 'border-gray-600 bg-gray-700 text-white hover:bg-gray-600' 
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          } ${isFormLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}`}
          whileTap={{ scale: 0.98 }}
        >
          <Chrome className="w-5 h-5" />
          <span>Continue with Google</span>
        </motion.button>

        {/* Guest Access */}
        <motion.button
          type="button"
          onClick={handleGuestContinue}
          disabled={isFormLoading}
          className={`w-full py-3 px-4 rounded-lg border-2 border-dashed flex items-center justify-center space-x-2 transition-all duration-200 ${
            isDark 
              ? 'border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300' 
              : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-700'
          } ${isFormLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          whileTap={{ scale: 0.98 }}
        >
          <Zap className="w-5 h-5" />
          <span>Continue as Guest</span>
        </motion.button>

        {/* Toggle Form */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            disabled={isFormLoading}
            className={`text-sm underline transition-colors ${
              isDark 
                ? 'text-blue-400 hover:text-blue-300' 
                : 'text-blue-600 hover:text-blue-500'
            } ${isFormLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSignUp 
              ? 'Already have an account? Sign in' 
              : "Don't have an account? Sign up"
            }
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
