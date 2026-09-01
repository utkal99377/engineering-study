import React from 'react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ currentTab, onNavigate }) => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();

  const navItems = [
    { id: 'home', label: 'Dashboard' },
    { id: 'courses', label: 'Courses' },
    { id: 'coding', label: 'Code Sandbox' },
    { id: 'theory', label: 'MCQs' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#0A0B0E] border-b border-[#1E212A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          {/* Left: Brand Logo */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer select-none" 
            onClick={() => onNavigate('home')}
          >
            <div className="w-6 h-6 rounded bg-[#1A1D26] border border-[#2B303E] flex items-center justify-center text-xs font-bold text-white">
              B
            </div>
            <span className="font-semibold text-sm text-white tracking-tight">BTechAI</span>
          </div>

          {/* Center / Right: Clean Navigation Pills */}
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <div className="hidden md:flex items-center gap-1.5 mr-2">
                {navItems.map((item) => {
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-[#1E212A] text-white border border-[#2E3342]'
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
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      currentTab === 'admin'
                        ? 'bg-[#2A2315] text-amber-300 border border-amber-500/40'
                        : 'text-amber-400 hover:text-amber-300 hover:bg-[#1C1810]'
                    }`}
                  >
                    Admin
                  </button>
                )}
              </div>
            )}

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('profile')}
                  className="px-3 py-1.5 rounded-md bg-[#14161E] border border-[#232630] text-xs text-white hover:bg-[#1C1F2A] transition"
                >
                  {user?.name?.split(' ')[0] || 'Profile'}
                </button>
                <button
                  onClick={logout}
                  className="px-3 py-1.5 rounded-md bg-[#14161E] border border-[#232630] text-xs text-[#8E92A4] hover:text-red-400 hover:bg-[#1C1F2A] transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('auth')}
                  className="px-3 py-1.5 rounded-md text-xs font-medium text-[#9CA3AF] hover:text-white transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onNavigate('auth')}
                  className="px-3.5 py-1.5 rounded-md bg-[#1E212A] border border-[#2E3342] text-xs font-medium text-white hover:bg-[#272B38] transition"
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
