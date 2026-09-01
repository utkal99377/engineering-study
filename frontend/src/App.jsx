import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { SubscriptionModal } from './components/SubscriptionModal';
import { HomePage } from './pages/HomePage';
import { CourseCatalogPage } from './pages/CourseCatalogPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { LecturePlayerPage } from './pages/LecturePlayerPage';
import { TheoryPracticePage } from './pages/TheoryPracticePage';
import { CodingArenaPage } from './pages/CodingArenaPage';
import { ProblemSolverPage } from './pages/ProblemSolverPage';
import { SubscriptionPage } from './pages/SubscriptionPage';
import { ProfilePage } from './pages/ProfilePage';
import { AuthPage } from './pages/AuthPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { Sparkles, Megaphone, X, ArrowRight, RefreshCw, AlertTriangle } from 'lucide-react';

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
        <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full glass-panel p-8 rounded-2xl border border-rose-800 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/80 border border-rose-700/60 flex items-center justify-center mx-auto text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Something went wrong</h2>
            <p className="text-xs text-slate-400 font-mono bg-slate-900/90 p-3 rounded-lg border border-slate-800 break-words text-left">
              {this.state.error?.message || 'Unknown render error'}
            </p>
            <button
              onClick={() => {
                localStorage.removeItem('btech_token');
                window.location.reload();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reset & Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function MainApp() {
  const { user, loading, isAdmin } = useAuth();
  const [currentTab, setCurrentTab] = useState(() => {
    // Default to 'auth' (Login Page) if no active session, so opening the app displays the login page
    const token = localStorage.getItem('btech_token');
    return token ? 'home' : 'auth';
  });
  const [tabParams, setTabParams] = useState(null);
  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false);
  const [subscribeDefaultPlan, setSubscribeDefaultPlan] = useState(null);
  const [publicSettings, setPublicSettings] = useState(null);
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);
  const [isWindowBlurred, setIsWindowBlurred] = useState(false);

  // Anti-Screenshot, Anti-Screen Recording & Content Protection Shield
  useEffect(() => {
    const handleContextMenu = (e) => {
      // Prevent right-click save and inspect
      if (currentTab !== 'admin') {
        e.preventDefault();
      }
    };

    const handleKeyDown = (e) => {
      // Prevent Ctrl+S (save), Ctrl+P (print), Ctrl+U (view source)
      if ((e.ctrlKey || e.metaKey) && ['s', 'p', 'u'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
      if (e.key === 'PrintScreen') {
        // Clear clipboard & momentarily shield content
        try { navigator.clipboard.writeText(''); } catch (_) {}
        setIsWindowBlurred(true);
        setTimeout(() => setIsWindowBlurred(false), 2000);
      }
    };

    const handleBlur = () => {
      // When screen capture / snipping tool opens, shield content
      if (currentTab === 'lecture' || currentTab === 'course-detail') {
        setIsWindowBlurred(true);
      }
    };
    const handleFocus = () => setIsWindowBlurred(false);

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [currentTab]);

  useEffect(() => {
    loadSettings();
  }, [currentTab]);

  const loadSettings = async () => {
    try {
      const data = await api.getPublicSettings();
      setPublicSettings(data);
    } catch (e) {
      console.warn('Could not load public settings:', e);
    }
  };

  const handleNavigate = (tab, params = null) => {
    setCurrentTab(tab);
    setTabParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSubscribe = (planId = null) => {
    setSubscribeDefaultPlan(planId);
    setSubscribeModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-400 font-mono">Starting B.Tech Learning Platform v2.0...</p>
        </div>
      </div>
    );
  }

  // Enforce Authentication: No Guest Browsing
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans">
        <AuthPage onNavigate={handleNavigate} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans">
      {/* Live Admin Dynamic Announcement Banner */}
      {publicSettings?.announcement_active && !announcementDismissed && (
        <div className={`py-2 px-4 text-xs font-medium text-center flex items-center justify-center gap-3 transition relative ${
          publicSettings?.announcement_type === 'promo'
            ? 'bg-gradient-to-r from-amber-600/90 via-orange-600/90 to-amber-700/90 text-amber-100'
            : publicSettings?.announcement_type === 'warning'
            ? 'bg-rose-900/90 text-rose-100 border-b border-rose-800'
            : 'bg-gradient-to-r from-indigo-900/90 via-blue-900/90 to-indigo-950 text-indigo-200 border-b border-indigo-800/60'
        }`}>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <Megaphone className="w-3.5 h-3.5 shrink-0 text-amber-300 animate-pulse" />
            <span>{publicSettings.announcement_text}</span>
          </div>
          <button 
            onClick={() => setAnnouncementDismissed(true)} 
            className="text-slate-300 hover:text-white p-0.5 ml-2 rounded transition"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Navbar Header */}
      <Navbar
        currentTab={currentTab}
        onNavigate={handleNavigate}
        onOpenSubscribe={() => handleOpenSubscribe()}
      />

      {/* Main Page Area with Dynamic Anti-Piracy Shield */}
      <main className={`flex-1 protected-content screen-recording-shield ${isWindowBlurred ? 'window-blurred' : ''}`}>
        {currentTab === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onOpenSubscribe={handleOpenSubscribe}
            dynamicSettings={publicSettings}
          />
        )}

        {currentTab === 'courses' && (
          <CourseCatalogPage
            onNavigate={handleNavigate}
            initialSubjectId={tabParams?.subject_id}
          />
        )}

        {currentTab === 'course-detail' && (
          <CourseDetailPage
            courseId={tabParams}
            onNavigate={handleNavigate}
            onOpenSubscribe={handleOpenSubscribe}
          />
        )}

        {currentTab === 'lecture-player' && (
          <LecturePlayerPage
            lectureId={tabParams}
            onNavigate={handleNavigate}
            onOpenSubscribe={handleOpenSubscribe}
          />
        )}

        {currentTab === 'theory' && (
          <TheoryPracticePage
            initialCourseId={tabParams?.course_id}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'coding' && (
          <CodingArenaPage onNavigate={handleNavigate} />
        )}

        {currentTab === 'problem-solver' && (
          <ProblemSolverPage
            problemId={tabParams}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'subscriptions' && (
          <SubscriptionPage onOpenSubscribe={handleOpenSubscribe} />
        )}

        {currentTab === 'profile' && (
          <ProfilePage
            onNavigate={handleNavigate}
            onOpenSubscribe={handleOpenSubscribe}
          />
        )}

        {currentTab === 'auth' && (
          <AuthPage onNavigate={handleNavigate} />
        )}

        {currentTab === 'admin' && (
          <AdminDashboard />
        )}
      </main>

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={subscribeModalOpen}
        onClose={() => setSubscribeModalOpen(false)}
        defaultPlanId={subscribeDefaultPlan}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 px-4 text-center text-xs text-slate-500 bg-[#080B13] mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-slate-300">B.Tech Learning Platform</span> &copy; 2026. Data-driven Engineering Education.
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="cursor-pointer hover:text-white" onClick={() => handleNavigate('courses')}>Courses</span>
            <span className="cursor-pointer hover:text-white" onClick={() => handleNavigate('coding')}>Code Sandbox</span>
            <span className="cursor-pointer hover:text-white" onClick={() => handleNavigate('theory')}>MCQ Practice</span>
            <span className="cursor-pointer hover:text-white" onClick={() => handleOpenSubscribe()}>Pro Plans</span>
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
