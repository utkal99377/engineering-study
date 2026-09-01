import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  FileText, 
  Download, 
  ExternalLink, 
  ChevronRight, 
  ShieldCheck, 
  Terminal,
  BookOpen, 
  Lock,
  Check,
  Play,
  RotateCcw,
  HelpCircle
} from 'lucide-react';
import { api } from '../services/api';
import { WatermarkOverlay } from '../components/WatermarkOverlay';
import { NotesViewer } from '../components/NotesViewer';
import { useAuth } from '../context/AuthContext';

export const LecturePlayerPage = ({ lectureId, onNavigate, onOpenSubscribe }) => {
  const { user } = useAuth();
  const [lecture, setLecture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [activeTab, setActiveTab] = useState('notes'); // notes, code, resources
  const [completedSuccess, setCompletedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Embedded Code Runner state
  const [codeLanguage, setCodeLanguage] = useState('python');
  const [codeSnippet, setCodeSnippet] = useState('# Practice code for this lecture\ndef solve():\n    print("Welcome to Engineering Studio")\n\nsolve()\n');
  const [codeOutput, setCodeOutput] = useState('');
  const [runningCode, setRunningCode] = useState(false);

  useEffect(() => {
    if (lectureId) {
      loadLecture();
    }
  }, [lectureId]);

  const loadLecture = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await api.getLecture(lectureId);
      setLecture(data);
      setActiveTab('notes');
    } catch (err) {
      console.error('Failed to load lecture:', err);
      setErrorMsg(err.message || 'Failed to load lecture.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteLecture = async () => {
    if (!lecture || completing) return;
    setCompleting(true);
    try {
      await api.completeLecture(lecture.id);
      setCompletedSuccess(true);
    } catch (err) {
      alert(err.message || 'Failed to mark lecture complete.');
    } finally {
      setCompleting(false);
    }
  };

  const handleRunCode = async () => {
    setRunningCode(true);
    setCodeOutput('Compiling & executing code in isolated sandbox...');
    try {
      const res = await api.executeSandboxCode({
        language: codeLanguage,
        code: codeSnippet,
        stdin: ''
      });
      if (res.error) {
        setCodeOutput(`[Error]\n${res.error}`);
      } else {
        setCodeOutput(res.output || res.stdout || 'Program executed with exit code 0.');
      }
    } catch (err) {
      setCodeOutput(`[Execution Error]: ${err.message || 'Failed to run code.'}`);
    } finally {
      setRunningCode(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-400 font-mono">Loading syllabus notes and interactive studio...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center glass-card rounded-2xl p-6 space-y-4">
        <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <Lock className="w-5 h-5" />
        </div>
        <h2 className="text-lg font-bold text-white">Lecture Access Restricted</h2>
        <p className="text-xs text-slate-300">{errorMsg}</p>
        <div className="pt-2 flex justify-center gap-2">
          <button
            onClick={() => onNavigate('courses')}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-xs font-semibold text-slate-300"
          >
            All Courses
          </button>
          <button
            onClick={onOpenSubscribe}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
          >
            Upgrade Plan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('courses')}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Course Outline</span>
        </button>

        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-[11px] font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Verified Student • {user?.name || user?.email?.split('@')[0]}</span>
        </div>
      </div>

      {/* Main Studio Card */}
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-800 shadow-xl relative">
        
        {/* Dynamic Watermark Security */}
        <WatermarkOverlay watermark={lecture?.watermark} />

        {/* Studio Topbar Tabs */}
        <div className="flex flex-wrap items-center justify-between px-5 py-3 bg-[#090D16] border-b border-slate-800 gap-3">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'notes'
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>Syllabus Notes & Theory</span>
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'code'
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Interactive Code Runner</span>
            </button>

            {lecture?.resources?.length > 0 && (
              <button
                onClick={() => setActiveTab('resources')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeTab === 'resources'
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Download className="w-3.5 h-3.5 text-sky-400" />
                <span>Resources ({lecture.resources.length})</span>
              </button>
            )}
          </div>

          <span className="text-xs font-mono text-slate-400">
            Est. Study Time: {lecture?.duration_min || 15} mins
          </span>
        </div>

        {/* Tab Contents */}
        <div className="p-6">
          
          {/* 1. SYLLABUS NOTES TAB */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-4">
                <h1 className="text-xl sm:text-2xl font-bold text-white">{lecture?.title}</h1>
                <p className="text-xs text-slate-400 mt-1">Core Engineering Syllabus • Theory & Code Explanations</p>
              </div>

              <div className="prose prose-invert max-w-none">
                <NotesViewer markdown={lecture?.notes_markdown} />
              </div>
            </div>
          )}

          {/* 2. INTERACTIVE CODE RUNNER TAB */}
          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Live Code Sandbox</h3>
                  <p className="text-[11px] text-slate-400">Write, test, and execute algorithms directly in the browser.</p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={codeLanguage}
                    onChange={(e) => setCodeLanguage(e.target.value)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="python">Python 3</option>
                    <option value="javascript">JavaScript (Node.js)</option>
                    <option value="c">C (GCC)</option>
                    <option value="cpp">C++ (G++)</option>
                  </select>

                  <button
                    onClick={handleRunCode}
                    disabled={runningCode}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{runningCode ? 'Running...' : 'Run Code'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Editor textarea */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Source Code</span>
                  <textarea
                    value={codeSnippet}
                    onChange={(e) => setCodeSnippet(e.target.value)}
                    rows={12}
                    className="w-full p-3.5 rounded-xl bg-[#090D16] border border-slate-800 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500/50 resize-y"
                    placeholder="Type your code here..."
                  />
                </div>

                {/* Console Output */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Console Output</span>
                  <div className="w-full h-full min-h-[220px] p-3.5 rounded-xl bg-[#090D16] border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap overflow-auto">
                    {codeOutput || 'Click "Run Code" above to execute program.'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. ATTACHED RESOURCES TAB */}
          {activeTab === 'resources' && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white">Attached Study Materials & Lab Sheets</h4>
              {lecture?.resources?.length > 0 ? (
                lecture.resources.map((res) => (
                  <div key={res.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-indigo-400" />
                      <div>
                        <h5 className="text-xs font-semibold text-white">{res.title}</h5>
                        <span className="text-[10px] text-slate-500 uppercase font-mono">{res.type}</span>
                      </div>
                    </div>

                    <a
                      href={res.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5"
                    >
                      <span>Open Material</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">No additional external files attached for this lecture.</p>
              )}
            </div>
          )}

        </div>

        {/* Completion Footer */}
        <div className="p-5 bg-[#090D16] border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white">{lecture?.title}</h3>
            <p className="text-xs text-slate-400">Complete this lecture to unlock the next prerequisite in the syllabus.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCompleteLecture}
              disabled={completing || completedSuccess}
              className={`px-5 py-2.5 rounded-lg text-xs font-semibold shadow-sm flex items-center gap-2 transition ${
                completedSuccess
                  ? 'bg-emerald-600 text-white cursor-default'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{completedSuccess ? 'Lecture Completed!' : (completing ? 'Updating...' : 'Mark as Completed')}</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
