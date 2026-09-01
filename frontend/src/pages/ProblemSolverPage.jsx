import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  Terminal, 
  Clock, 
  Cpu, 
  CheckCircle2, 
  History, 
  FileText, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { CodeEditor } from '../components/CodeEditor';

export const ProblemSolverPage = ({ problemId, onNavigate }) => {
  const [problem, setProblem] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [leftTab, setLeftTab] = useState('statement'); // statement, submissions
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (problemId) {
      loadProblemAndHistory();
    }
  }, [problemId]);

  const loadProblemAndHistory = async () => {
    setLoading(true);
    try {
      const [probData, subData] = await Promise.all([
        api.getProblemDetail(problemId),
        api.getMySubmissions().catch(() => []),
      ]);
      setProblem(probData);
      setSubmissions(subData.filter(s => s.problem_id === problemId));
    } catch (err) {
      console.error('Failed to load problem details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmissionGraded = (res) => {
    // Refresh history
    api.getMySubmissions().then(subs => {
      setSubmissions(subs.filter(s => s.problem_id === problemId));
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-slate-400 font-mono">Initializing isolated sandbox workspace...</p>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center glass-card rounded-2xl">
        <h3 className="text-lg font-bold text-white">Problem Not Found</h3>
        <button
          onClick={() => onNavigate('coding')}
          className="mt-4 px-4 py-2 rounded-lg bg-slate-800 text-xs font-semibold text-indigo-300"
        >
          Back to Problems Arena
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4 h-[calc(100vh-5rem)] flex flex-col">
      
      {/* Top Header Bar */}
      <div className="flex items-center justify-between shrink-0">
        <button
          onClick={() => onNavigate('coding')}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Problem Bank</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className={`px-2.5 py-0.5 rounded font-semibold ${
            problem.difficulty === 'Easy' ? 'bg-emerald-500/20 text-emerald-300' :
            problem.difficulty === 'Medium' ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'
          }`}>
            {problem.difficulty}
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
            Limit: {problem.time_limit_sec}s / {problem.memory_limit_mb}MB
          </span>
        </div>
      </div>

      {/* Split Screen Container */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
        
        {/* Left Pane: Problem Description & Submissions */}
        <div className="lg:col-span-5 glass-panel rounded-xl border border-slate-800 flex flex-col overflow-hidden">
          
          {/* Pane Header Tabs */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#141A29] border-b border-slate-800 shrink-0">
            <button
              onClick={() => setLeftTab('statement')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                leftTab === 'statement'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Problem Statement</span>
            </button>

            <button
              onClick={() => setLeftTab('submissions')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                leftTab === 'submissions'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>My Submissions ({submissions.length})</span>
            </button>
          </div>

          {/* Statement Content */}
          <div className="flex-1 p-5 overflow-y-auto space-y-5 text-xs text-slate-200">
            {leftTab === 'statement' ? (
              <>
                <div>
                  <h1 className="text-lg font-bold text-white tracking-tight">{problem.title}</h1>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {problem.tags?.map((t, i) => (
                      <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-indigo-300">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 leading-relaxed">
                  <p className="whitespace-pre-line text-slate-300">{problem.statement}</p>
                </div>

                {problem.input_format && (
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <h4 className="text-[11px] font-bold uppercase text-slate-400 font-mono">Input Format:</h4>
                    <p className="text-slate-300 font-mono text-[11px] whitespace-pre-wrap">{problem.input_format}</p>
                  </div>
                )}

                {problem.output_format && (
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <h4 className="text-[11px] font-bold uppercase text-slate-400 font-mono">Output Format:</h4>
                    <p className="text-slate-300 font-mono text-[11px] whitespace-pre-wrap">{problem.output_format}</p>
                  </div>
                )}

                {problem.constraints && (
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <h4 className="text-[11px] font-bold uppercase text-slate-400 font-mono">Constraints:</h4>
                    <pre className="text-slate-300 font-mono text-[11px] whitespace-pre-wrap">{problem.constraints}</pre>
                  </div>
                )}

                {/* Sample Cases */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Examples & Samples:</h4>
                  {problem.sample_test_cases?.map((tc, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <span className="text-[10px] font-mono text-indigo-400 font-semibold">Example #{idx + 1}</span>
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 block font-mono">Input:</span>
                        <pre className="p-2 rounded bg-black/40 font-mono text-slate-200 overflow-x-auto">{tc.input_data}</pre>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 block font-mono">Output:</span>
                        <pre className="p-2 rounded bg-black/40 font-mono text-emerald-400 overflow-x-auto">{tc.expected_output}</pre>
                      </div>
                      {tc.explanation && (
                        <p className="text-[11px] text-slate-400 italic mt-1"><strong>Explanation:</strong> {tc.explanation}</p>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-3">
                {submissions.length === 0 ? (
                  <div className="py-12 text-center text-slate-500">
                    <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p>No submissions recorded for this problem yet.</p>
                  </div>
                ) : (
                  submissions.map((sub) => (
                    <div key={sub.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className={`font-bold font-mono text-xs ${
                          sub.status === 'Accepted' ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {sub.status}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(sub.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span>Lang: {sub.language}</span>
                        <span>Passed: {sub.passed_test_cases}/{sub.total_test_cases}</span>
                        <span>{sub.runtime_ms} ms</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Multi-language Code Editor & Execution Sandbox */}
        <div className="lg:col-span-7 h-full flex flex-col min-h-0">
          <CodeEditor
            problem={problem}
            initialLanguage="python"
            onSubmissionSuccess={handleSubmissionGraded}
          />
        </div>

      </div>

    </div>
  );
};
