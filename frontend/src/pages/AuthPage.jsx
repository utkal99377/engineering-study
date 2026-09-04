import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Terminal, ArrowRight, UserCheck, Shield, Key } from 'lucide-react';

export const AuthPage = ({ onNavigate }) => {
  const { login, adminLogin, register } = useAuth();
  const [authMode, setAuthMode] = useState('login'); // 'login', 'register', 'admin'
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminPasscode, setAdminPasscode] = useState('');

  // Status
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Quick Demo Logins
  const handleDemoStudentLogin = async () => {
    setError(null);
    setSubmitting(true);
    try {
      // Login or initialize demo student Aditya
      try {
        await login('aditya@engineering.edu', 'aditya123');
      } catch (e) {
        await register({
          name: 'Aditya',
          email: 'aditya@engineering.edu',
          password: 'aditya123',
          college_branch: 'B.Tech CSE',
          semester: '3rd Semester'
        }).catch(() => null);
      }
      onNavigate('home');
    } catch (err) {
      onNavigate('home');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoAdminLogin = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await adminLogin('admin@engineering.edu', 'admin123', 'admin_master_2026').catch(() => null);
      onNavigate('admin');
    } catch (err) {
      onNavigate('admin');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (authMode === 'login') {
        await login(email, password);
        onNavigate('home');
      } else if (authMode === 'admin') {
        await adminLogin(email, password, adminPasscode);
        onNavigate('admin');
      } else {
        await register({
          name: name || email.split('@')[0],
          email,
          password,
          college_branch: 'B.Tech CSE',
          semester: '3rd Semester',
        });
        onNavigate('home');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4">
      
      {/* Centered Minimalist Auth Card */}
      <div className="w-full max-w-sm bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-6 sm:p-8 space-y-6 shadow-2xl">
        
        {/* Brand & Title */}
        <div className="space-y-2 text-center">
          <div className="w-8 h-8 rounded bg-[#141414] border border-[#262626] flex items-center justify-center text-white mx-auto">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">
              {authMode === 'admin' ? 'Administrator Login' : authMode === 'register' ? 'Create Account' : 'Sign In'}
            </h1>
            <p className="text-xs text-[#666666] mt-0.5">
              CodeForge Engineering Learning Platform
            </p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-[#050505] border border-[#1F1F1F] rounded-md text-xs">
          <button
            type="button"
            onClick={() => { setAuthMode('login'); setError(null); }}
            className={`py-1 rounded font-medium transition-colors ${
              authMode === 'login'
                ? 'bg-[#141414] text-white border border-[#262626]'
                : 'text-[#666666] hover:text-[#A0A0A0]'
            }`}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('admin'); setError(null); }}
            className={`py-1 rounded font-medium transition-colors ${
              authMode === 'admin'
                ? 'bg-[#141414] text-white border border-[#262626]'
                : 'text-[#666666] hover:text-[#A0A0A0]'
            }`}
          >
            Admin
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-[#141414] border border-[#333333] rounded text-xs text-[#E5E5E5]">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {authMode === 'register' && (
            <div className="space-y-1">
              <label className="text-[#A0A0A0] font-medium block">Full Name</label>
              <input
                type="text"
                required
                placeholder="Aditya Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mono-input w-full p-2.5 bg-[#0F0F0F] border-[#1F1F1F] rounded-md focus:border-[#444444]"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[#A0A0A0] font-medium block">Email Address</label>
            <input
              type="email"
              required
              placeholder={authMode === 'admin' ? 'admin@engineering.edu' : 'aditya@engineering.edu'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mono-input w-full p-2.5 bg-[#0F0F0F] border-[#1F1F1F] rounded-md focus:border-[#444444]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[#A0A0A0] font-medium block">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mono-input w-full p-2.5 bg-[#0F0F0F] border-[#1F1F1F] rounded-md focus:border-[#444444]"
            />
          </div>

          {authMode === 'admin' && (
            <div className="space-y-1">
              <label className="text-[#A0A0A0] font-medium block">Admin Security Passcode</label>
              <input
                type="password"
                required
                placeholder="admin_master_2026"
                value={adminPasscode}
                onChange={(e) => setAdminPasscode(e.target.value)}
                className="mono-input w-full p-2.5 bg-[#0F0F0F] border-[#1F1F1F] rounded-md font-mono focus:border-[#444444]"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mono-btn-primary w-full py-2.5 mt-2 text-xs font-semibold"
          >
            <span>{submitting ? 'Authenticating...' : authMode === 'admin' ? 'Access Admin Panel' : 'Continue to Dashboard'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* 1-Click Quick Demo Access */}
        <div className="pt-4 border-t border-[#181818] space-y-2">
          <p className="text-[11px] font-mono text-center text-[#666666]">
            Instant Demo Access
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDemoStudentLogin}
              className="mono-btn-secondary text-[11px] py-1.5 px-2 text-center justify-center"
            >
              <UserCheck className="w-3 h-3 text-[#A0A0A0]" />
              <span>Student (Aditya)</span>
            </button>
            <button
              type="button"
              onClick={handleDemoAdminLogin}
              className="mono-btn-secondary text-[11px] py-1.5 px-2 text-center justify-center"
            >
              <Shield className="w-3 h-3 text-[#A0A0A0]" />
              <span>Admin Demo</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
