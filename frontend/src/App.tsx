import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { BrowserRouter as Router } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import LoginPage from './components/LoginPage';
import ChatInterface from './components/ChatInterface';
import Dashboard from './components/Dashboard';
import CommunityPage from './components/CommunityPage';
import SettingsPage from './components/SettingsPage';
import Sidebar from './components/Sidebar';
import { useTheme } from './contexts/ThemeContext';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<'chat' | 'dashboard' | 'community' | 'settings'>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user, isLoading, error } = useAuth();
  const { isDark } = useTheme();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Show loading screen
  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
        <motion.div className="text-center max-w-md mx-auto p-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"
          />
          <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Loading your therapeutic space...
          </p>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            If this takes too long, please check your internet connection or try refreshing the page.
          </p>
        </motion.div>
      </div>
    );
  }

  // Show error screen with option to continue as guest
  if (error && !user) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
        <div className="text-center max-w-md mx-auto p-6">
          <div className={`p-4 rounded-lg mb-4 ${isDark ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'
            }`}>
            <p className={`text-sm ${isDark ? 'text-red-400' : 'text-red-700'}`}>
              Connection issue: {error}
            </p>
          </div>
          <LoginPage />
        </div>
      </div>
    );
  }

  // Show login page if no user
  if (!user) {
    return <LoginPage />;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'community':
        return <CommunityPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <ChatInterface onNavigateToSettings={() => setCurrentView('settings')} />;
    }
  };

  return (
    <div className={`h-screen flex transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
      {/* Mobile Menu Button */}
      {isMobile && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`fixed top-4 left-4 z-50 p-3 rounded-xl transition-all duration-200 ${isDark ? 'bg-gray-800 text-white shadow-lg' : 'bg-white text-gray-900 shadow-lg'
            }`}
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </motion.button>
      )}

      {/* Sidebar */}
      <AnimatePresence>
        <div className={`${isMobile
          ? `fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`
          : ''
          }`}>
          <Sidebar
            currentView={currentView}
            onViewChange={(view) => {
              setCurrentView(view);
              if (isMobile) setIsSidebarOpen(false);
            }}
            isCollapsed={false}
            onToggleCollapse={() => { }}
          />
        </div>
      </AnimatePresence>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${isMobile ? '' : 'ml-0'}`}>
        <motion.div
          key={currentView}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          {renderCurrentView()}
        </motion.div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <SettingsProvider>
            <AppContent />
          </SettingsProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;