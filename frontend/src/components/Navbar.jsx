import React from 'react';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, LogOut, User as UserIcon, Shield } from 'lucide-react';

export const Navbar = ({ currentTab, onNavigate }) => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();

  const navItems = [
    { id: 'home', label: 'Dashboard' },
    { id: 'courses', label: 'Courses' },
    { id: 'coding', label: 'Code Sandbox' },
    { id: 'theory', label: 'MCQs' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#0A0B0E]/90 backdrop-blur-md border-b border-[#1E212A]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          
          {/* Left: Brand Logo */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer select-none group" 
            onClick={() => onNavigate('home')}
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition duration-150">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-white tracking-tight">
              BTech<span className="text-indigo-400">AI</span>
            </span>
          </div>

          {/* Center: Clean Navigation Pills */}
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <div className="flex items-center gap-1">
                {navItems.map((item) => {
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-[#1E212A] text-white border border-[#2E3342] shadow-sm'
                          : 'text-[#8E92A4] hover:text-white hover:bg-[#14161E]'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}

                {isAdmin && (
                  <button
                    onClick={() => onNavigate('admin')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                      currentTab === 'admin'
                        ? 'bg-amber-950/60 text-amber-300 border border-amber-500/40'
                        : 'text-amber-400 hover:text-amber-300 hover:bg-amber-950/30'
                    }`}
                  >
                    <Shield className="w-3 h-3" />
                    <span>Admin</span>
                  </button>
                )}
              </div>
            )}

            {/* Auth / Profile Area */}
            {isAuthenticated ? (
              <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-[#1E212A]">
                <button
                  onClick={() => onNavigate('profile')}
                  className="px-2.5 py-1.5 rounded-lg bg-[#14161E] hover:bg-[#1C1F2A] border border-[#232630] text-xs font-medium text-white transition flex items-center gap-1.5"
                  title="View Profile"
                >
                  <UserIcon className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden sm:inline">{user?.name?.split(' ')[0] || 'Profile'}</span>
                </button>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg bg-[#14161E] hover:bg-rose-950/40 border border-[#232630] hover:border-rose-800/40 text-[#8E92A4] hover:text-rose-300 transition"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('auth')}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#9CA3AF] hover:text-white transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onNavigate('auth')}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white transition"
                >
                  Register
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};
