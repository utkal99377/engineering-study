import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { MyCoursesPage } from './pages/MyCoursesPage';
import { ProgressPage } from './pages/ProgressPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AuthPage } from './pages/AuthPage';
import { Terminal, RefreshCw, AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full mono-card p-8 rounded-lg border border-[#333333] text-center space-y-4 shadow-2xl">
            <div className="w-10 h-10 rounded bg-[#141414] border border-[#262626] flex items-center justify-center mx-auto text-white">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h2 className="text-base font-semibold text-white">Something went wrong</h2>
            <p className="text-xs text-[#A0A0A0] font-mono bg-[#0A0A0A] p-3 rounded border border-[#1F1F1F] break-words text-left">
              {this.state.error?.message || 'Unknown render error'}
            </p>
            <button
              onClick={() => {
                localStorage.removeItem('btech_token');
                window.location.reload();
              }}
              className="mono-btn-primary w-full py-2 text-xs font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Reset & Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function MainApp() {
  const { user, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState('home');
  const [tabParams, setTabParams] = useState(null);

  const handleNavigate = (tab, params = null) => {
    setCurrentTab(tab);
    setTabParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-[#666666] font-mono">Loading CodeForge platform...</p>
        </div>
      </div>
    );
  }

  // If not logged in and on auth tab, show AuthPage
  if (!user && currentTab === 'auth') {
    return <AuthPage onNavigate={handleNavigate} />;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#FFFFFF] flex flex-col font-sans selection:bg-[#262626] selection:text-white">
      
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onNavigate={handleNavigate}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {currentTab === 'home' && (
          <HomePage onNavigate={handleNavigate} />
        )}

        {currentTab === 'courses' && (
          <MyCoursesPage onNavigate={handleNavigate} />
        )}

        {currentTab === 'progress' && (
          <ProgressPage onNavigate={handleNavigate} />
        )}

        {currentTab === 'course-detail' && (
          <CourseDetailPage
            courseId={tabParams}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'admin' && (
          <AdminDashboard />
        )}

        {currentTab === 'auth' && (
          <AuthPage onNavigate={handleNavigate} />
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-[#141414] py-6 px-4 text-xs text-[#666666] bg-[#050505]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">CodeForge</span>
            <span>· Engineering Learning Platform</span>
          </div>
          <div className="flex items-center gap-4 text-[#666666]">
            <button onClick={() => handleNavigate('home')} className="hover:text-white transition-colors">
              Dashboard
            </button>
            <button onClick={() => handleNavigate('courses')} className="hover:text-white transition-colors">
              My Courses
            </button>
            <button onClick={() => handleNavigate('progress')} className="hover:text-white transition-colors">
              Progress
            </button>
            <button onClick={() => handleNavigate('admin')} className="hover:text-white transition-colors">
              Admin
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ErrorBoundary>
  );
}
