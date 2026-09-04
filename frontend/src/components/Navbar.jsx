import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Terminal, 
  ChevronDown, 
  User as UserIcon, 
  LogOut, 
  Shield, 
  BookOpen, 
  BarChart2, 
  LayoutDashboard,
  Check
} from 'lucide-react';

export const Navbar = ({ currentTab, onNavigate }) => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'courses', label: 'My Courses', icon: BookOpen },
    { id: 'progress', label: 'Progress', icon: BarChart2 },
  ];

  const studentName = user?.name || 'Aditya';
  const studentInitials = studentName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <nav className="sticky top-0 z-50 bg-[#050505]/95 backdrop-blur-md border-b border-[#1F1F1F]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          
          {/* Left: Platform Logo / Name */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-6 h-6 rounded bg-[#141414] border border-[#262626] flex items-center justify-center text-white group-hover:border-[#444444] transition-colors">
                <Terminal className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-sm tracking-tight text-white">
                Code<span className="text-[#A0A0A0]">Forge</span>
              </span>
            </button>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'text-white bg-[#141414] border border-[#262626]'
                        : 'text-[#A0A0A0] hover:text-white hover:bg-[#0F0F0F]'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Controls & Student Profile */}
          <div className="flex items-center gap-3">
            
            {/* Admin Switcher Shortcut */}
            <button
              onClick={() => onNavigate(currentTab === 'admin' ? 'home' : 'admin')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-medium transition-colors flex items-center gap-1.5 border ${
                currentTab === 'admin'
                  ? 'bg-white text-black border-white'
                  : 'bg-[#0F0F0F] text-[#A0A0A0] hover:text-white border-[#1F1F1F] hover:border-[#333333]'
              }`}
              title="Toggle Admin View"
            >
              <Shield className="w-3 h-3" />
              <span>{currentTab === 'admin' ? 'Student View' : 'Admin Panel'}</span>
            </button>

            {/* Student Profile with Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 py-1 px-1.5 rounded-md hover:bg-[#0F0F0F] border border-transparent hover:border-[#1F1F1F] transition-colors focus:outline-none"
              >
                <div className="w-7 h-7 rounded-full bg-[#181818] border border-[#2A2A2A] flex items-center justify-center text-xs font-medium text-white">
                  {studentInitials || 'AD'}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-medium text-white leading-tight">
                    {studentName}
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-[#666666] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg shadow-2xl py-1.5 z-50 text-xs animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-3 py-2 border-b border-[#1F1F1F]">
                    <p className="font-medium text-white">{studentName}</p>
                    <p className="text-[11px] text-[#666666] mt-0.5">{user?.email || 'aditya@engineering.edu'}</p>
                    <span className="inline-block mt-1 text-[10px] font-mono text-[#A0A0A0] bg-[#141414] px-1.5 py-0.5 rounded border border-[#262626]">
                      B.Tech CSE · Sem 3
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        onNavigate('home');
                        setDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-[#A0A0A0] hover:text-white hover:bg-[#141414] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        <span>Student Dashboard</span>
                      </div>
                      {currentTab === 'home' && <Check className="w-3 h-3 text-white" />}
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('courses');
                        setDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-[#A0A0A0] hover:text-white hover:bg-[#141414] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>My Courses</span>
                      </div>
                      {currentTab === 'courses' && <Check className="w-3 h-3 text-white" />}
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('progress');
                        setDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-[#A0A0A0] hover:text-white hover:bg-[#141414] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <BarChart2 className="w-3.5 h-3.5" />
                        <span>Your Progress</span>
                      </div>
                      {currentTab === 'progress' && <Check className="w-3 h-3 text-white" />}
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('admin');
                        setDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-[#A0A0A0] hover:text-white hover:bg-[#141414] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5" />
                        <span>Admin Course CMS</span>
                      </div>
                      {currentTab === 'admin' && <Check className="w-3 h-3 text-white" />}
                    </button>
                  </div>

                  <div className="border-t border-[#1F1F1F] pt-1">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="w-full px-3 py-2 text-left text-[#666666] hover:text-white hover:bg-[#141414] flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center gap-1 pb-2 pt-1 border-t border-[#141414]">
          {navLinks.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex-1 py-1.5 text-center text-xs font-medium rounded transition-colors ${
                  isActive
                    ? 'text-white bg-[#141414] border border-[#262626]'
                    : 'text-[#A0A0A0] hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

      </div>
    </nav>
  );
};
