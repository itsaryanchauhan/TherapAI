import React from 'react';
import { MessageSquare, BarChart3, Users, Settings, LogOut, Sun, Moon, User, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';

interface SidebarProps {
  currentView: 'chat' | 'dashboard' | 'community' | 'settings';
  onViewChange: (view: 'chat' | 'dashboard' | 'community' | 'settings') => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  isCollapsed
}) => {
  const { isDark, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();

  const menuItems = [
    { id: 'chat', icon: MessageSquare, label: 'Therapy Chat' },
    { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
    { id: 'community', icon: Users, label: 'Community' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className={`h-full flex flex-col transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'
      } ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center space-x-3"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gradient-to-r from-blue-500 to-purple-500'
              }`}>
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'
                }`}>
                {user?.full_name || user?.email || 'User'}
              </p>
              <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                TherapAI User
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onViewChange(item.id as any)}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 ${isActive
                  ? isDark
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : isDark
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        {/* Theme Toggle */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={toggleTheme}
          className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 ${isDark
              ? 'text-gray-300 hover:bg-gray-700'
              : 'text-gray-700 hover:bg-gray-100'
            }`}
          title={isCollapsed ? (isDark ? 'Light Mode' : 'Dark Mode') : undefined}
        >
          {isDark ? (
            <Sun className="w-5 h-5 flex-shrink-0" />
          ) : (
            <Moon className="w-5 h-5 flex-shrink-0" />
          )}
          {!isCollapsed && (
            <span className="text-sm font-medium">
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </span>
          )}
        </motion.button>

        {/* Logout */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={signOut}
          className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 ${isDark
              ? 'text-gray-300 hover:bg-gray-700'
              : 'text-gray-700 hover:bg-gray-100'
            }`}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && (
            <span className="text-sm font-medium">Logout</span>
          )}
        </motion.button>

        {/* Built with Bolt Badge */}
        {!isCollapsed && (
          <div className="pt-2">
            <a
              href="https://bolt.new"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-xl text-xs transition-colors duration-200 ${isDark
                  ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
            >
              <Zap className="w-3 h-3 text-yellow-500" />
              <span>Built with Bolt</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;