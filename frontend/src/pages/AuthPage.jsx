import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const AuthPage = ({ onNavigate }) => {
  const { login, adminLogin, register } = useAuth();
  const [authMode, setAuthMode] = useState('register'); // 'register', 'login', 'admin'
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [collegeBranch, setCollegeBranch] = useState('B.Tech CSE');
  const [semester, setSemester] = useState('3rd Semester');
  
  // OTP Verification
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);

  // Admin Master Passcode
  const [adminPasscode, setAdminPasscode] = useState('');

  // Status
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Send OTP
  const handleSendOtp = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid student email address first.');
      return;
    }
    setError(null);
    setOtpLoading(true);
    try {
      await api.sendOtp(email, 'registration');
      setOtpSent(true);
      setSuccessMsg(`Verification 6-digit OTP code sent to ${email}.`);
      setOtpCountdown(60);
      const timer = setInterval(() => {
        setOtpCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length < 6) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }
    setError(null);
    setOtpLoading(true);
    try {
      await api.verifyOtp(email, otpCode, 'registration');
      setOtpVerified(true);
      setSuccessMsg('Email verified successfully.');
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP code.');
    } finally {
      setOtpLoading(false);
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
        if (!adminPasscode) {
          throw new Error('Admin Master Security Passcode is required.');
        }
        await adminLogin(email, password, adminPasscode);
        onNavigate('admin');
      } else {
        if (confirmPassword && password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        await register({
          name: name || email.split('@')[0],
          email,
          password,
          otp: otpCode || undefined,
          college_branch: collegeBranch,
          semester,
        });
        onNavigate('home');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center p-4">
      
      {/* Centered Minimalist Card */}
      <div className="w-full max-w-md bg-[#121318] border border-[#232630] rounded-2xl p-8 space-y-6 shadow-xl">
        
        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white tracking-tight">
            {authMode === 'register' ? 'Create Account' : authMode === 'admin' ? 'Administrator Login' : 'Sign In'}
          </h2>
          <p className="text-xs text-[#8E92A4]">
            {authMode === 'register' 
              ? 'Register for curriculum access, logs and code sandbox' 
              : authMode === 'admin' 
                ? 'Master security passcode required for admin privileges'
                : 'Enter your credentials to access your student dashboard'}
          </p>
        </div>

        {/* Error / Success Alerts */}
        {error && (
          <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-lg text-xs text-red-300">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg text-xs text-emerald-300">
            {successMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {authMode === 'register' && (
            <div>
              <label className="block text-xs text-[#9CA3AF] mb-1 font-medium">Username / Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Choose username"
                required
                className="w-full px-3 py-2 bg-[#0E1015] border border-[#232630] rounded-lg text-xs text-white placeholder-[#4B5162] focus:border-[#4F46E5] focus:outline-none transition"
              />
            </div>
          )}

          <div>
            <label className="block text-xs text-[#9CA3AF] mb-1 font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
              className="w-full px-3 py-2 bg-[#0E1015] border border-[#232630] rounded-lg text-xs text-white placeholder-[#4B5162] focus:border-[#4F46E5] focus:outline-none transition"
            />
          </div>

          {/* OTP Verification on Register */}
          {authMode === 'register' && (
            <div>
              <label className="block text-xs text-[#9CA3AF] mb-1 font-medium">Email Verification OTP</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="6-digit code"
                  maxLength={6}
                  className="flex-1 px-3 py-2 bg-[#0E1015] border border-[#232630] rounded-lg text-xs text-white placeholder-[#4B5162] focus:border-[#4F46E5] focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={otpLoading || otpCountdown > 0}
                  className="px-3.5 py-2 bg-[#1E212A] hover:bg-[#272B38] border border-[#2E3342] rounded-lg text-xs font-medium text-white transition disabled:opacity-50"
                >
                  {otpCountdown > 0 ? `${otpCountdown}s` : otpSent ? 'Resend' : 'Send OTP'}
                </button>
              </div>
              {otpSent && !otpVerified && otpCode.length === 6 && (
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  className="mt-1.5 text-xs text-emerald-400 hover:underline"
                >
                  Verify Code Now
                </button>
              )}
            </div>
          )}

          {authMode === 'register' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-[#9CA3AF] mb-1 font-medium">Branch</label>
                <select
                  value={collegeBranch}
                  onChange={(e) => setCollegeBranch(e.target.value)}
                  className="w-full px-2.5 py-2 bg-[#0E1015] border border-[#232630] rounded-lg text-xs text-white focus:border-[#4F46E5] focus:outline-none transition"
                >
                  <option value="B.Tech CSE">B.Tech CSE</option>
                  <option value="B.Tech IT">B.Tech IT</option>
                  <option value="B.Tech AI/ML">B.Tech AI/ML</option>
                  <option value="B.Tech ECE">B.Tech ECE</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#9CA3AF] mb-1 font-medium">Semester</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-2.5 py-2 bg-[#0E1015] border border-[#232630] rounded-lg text-xs text-white focus:border-[#4F46E5] focus:outline-none transition"
                >
                  <option value="1st Semester">1st Semester</option>
                  <option value="2nd Semester">2nd Semester</option>
                  <option value="3rd Semester">3rd Semester</option>
                  <option value="4th Semester">4th Semester</option>
                  <option value="5th Semester">5th Semester</option>
                  <option value="6th Semester">6th Semester</option>
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs text-[#9CA3AF] mb-1 font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              className="w-full px-3 py-2 bg-[#0E1015] border border-[#232630] rounded-lg text-xs text-white placeholder-[#4B5162] focus:border-[#4F46E5] focus:outline-none transition"
            />
          </div>

          {authMode === 'register' && (
            <div>
              <label className="block text-xs text-[#9CA3AF] mb-1 font-medium">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
                className="w-full px-3 py-2 bg-[#0E1015] border border-[#232630] rounded-lg text-xs text-white placeholder-[#4B5162] focus:border-[#4F46E5] focus:outline-none transition"
              />
            </div>
          )}

          {authMode === 'admin' && (
            <div>
              <label className="block text-xs text-[#9CA3AF] mb-1 font-medium">Admin Master Passcode</label>
              <input
                type="password"
                value={adminPasscode}
                onChange={(e) => setAdminPasscode(e.target.value)}
                placeholder="Master Admin Key"
                required
                className="w-full px-3 py-2 bg-[#0E1015] border border-[#232630] rounded-lg text-xs text-white placeholder-[#4B5162] focus:border-amber-500 focus:outline-none transition"
              />
            </div>
          )}

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 mt-2 bg-[#20232D] hover:bg-[#2B2F3D] border border-[#2E3342] text-xs font-semibold text-white rounded-lg transition duration-150 disabled:opacity-50"
          >
            {submitting ? 'Please wait...' : authMode === 'register' ? 'Register' : authMode === 'admin' ? 'Enter Admin CMS' : 'Sign In'}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="pt-2 text-center text-xs text-[#8E92A4] space-y-2">
          {authMode === 'register' ? (
            <p>
              Already registered?{' '}
              <button
                onClick={() => { setAuthMode('login'); setError(null); setSuccessMsg(null); }}
                className="text-white hover:underline font-medium"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Need an account?{' '}
              <button
                onClick={() => { setAuthMode('register'); setError(null); setSuccessMsg(null); }}
                className="text-white hover:underline font-medium"
              >
                Register
              </button>
            </p>
          )}

          <div>
            <button
              onClick={() => {
                setAuthMode(authMode === 'admin' ? 'login' : 'admin');
                setError(null);
                setSuccessMsg(null);
              }}
              className="text-[11px] text-[#6B7280] hover:text-[#9CA3AF]"
            >
              {authMode === 'admin' ? '← Back to Student Login' : 'Administrator Portal'}
            </button>
          </div>
        </div>

      </div>

      {/* Minimal Bottom Footer matching the screenshot */}
      <div className="mt-8 text-center text-[11px] text-[#525769]">
        B.Tech Learning Platform • Computer Science Engineering • 8 Semesters Curriculum
      </div>

    </div>
  );
};
