import React, { useState } from 'react';
import { 
  Play, 
  Send, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Terminal, 
  RotateCcw, 
  Cpu, 
  FileCode2,
  ChevronRight,
  EyeOff,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';

const LANGUAGE_STARTERS = {
  python: 'def solve():\n    # Read input and solve\n    import sys\n    lines = sys.stdin.read().splitlines()\n    if lines:\n        print(lines[0])\n    else:\n        print("Hello, Engineer!")\n\nsolve()\n',
  c: '#include <stdio.h>\n\nint main() {\n    printf("Hello from C!\\n");\n    return 0;\n}\n',
  cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello from C++!" << endl;\n    return 0;\n}\n',
  java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java!");\n    }\n}\n',
  javascript: 'function solve() {\n    console.log("Hello from JavaScript (Node.js)!");\n}\nsolve();\n',
  typescript: 'const message: string = "Hello from TypeScript!";\nconsole.log(message);\n',
  go: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello from Go!")\n}\n',
  rust: 'fn main() {\n    println!("Hello from Rust!");\n}\n',
  csharp: 'using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello from C#!");\n    }\n}\n',
  php: '<?php\necho "Hello from PHP!\\n";\n?>\n',
  ruby: 'puts "Hello from Ruby!"\n',
  kotlin: 'fun main() {\n    println("Hello from Kotlin!")\n}\n',
  swift: 'import Foundation\nprint("Hello from Swift!")\n',
  sql: 'CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT, branch TEXT);\nINSERT INTO students VALUES (1, "Engineer", "CSE");\nSELECT * FROM students;\n',
  bash: '#!/bin/bash\necho "Hello from Bash!"\n'
};

export const CodeEditor = ({ problem, initialLanguage = 'python', onSubmissionSuccess }) => {
  const [language, setLanguage] = useState(initialLanguage);
  const [code, setCode] = useState(problem?.starter_code?.[initialLanguage] || LANGUAGE_STARTERS[initialLanguage] || LANGUAGE_STARTERS.python);
  const [customInput, setCustomInput] = useState('');
  const [activeTab, setActiveTab] = useState('testcases'); // testcases, custom_input, result
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [runResult, setRunResult] = useState(null);

  // Sync starter code when language changes
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    if (problem?.starter_code?.[newLang]) {
      setCode(problem.starter_code[newLang]);
    } else if (LANGUAGE_STARTERS[newLang]) {
      setCode(LANGUAGE_STARTERS[newLang]);
    }
  };

  const handleResetCode = () => {
    if (problem?.starter_code?.[language]) {
      setCode(problem.starter_code[language]);
    } else if (LANGUAGE_STARTERS[language]) {
      setCode(LANGUAGE_STARTERS[language]);
    }
  };

  const handleRunCode = async (useCustom = false) => {
    setRunning(true);
    setActiveTab('result');
    try {
      if (problem) {
        const res = await api.runCodePreview({
          problem_id: problem.id,
          language,
          code,
          custom_input: useCustom ? customInput : null,
          is_submission: false,
        });
        setRunResult(res);
      } else {
        const res = await api.executeSandboxCode({
          language,
          code,
          stdin: customInput
        });
        setRunResult({
          status: res.success ? 'Executed' : (res.compilation_error ? 'Compilation Error' : 'Runtime Error'),
          error: res.error,
          passed_count: res.success ? 1 : 0,
          total_count: 1,
          runtime_ms: res.runtime_ms,
          output: res.output,
          test_case_results: []
        });
      }
    } catch (err) {
      setRunResult({
        status: 'Execution Failed',
        error: err.message,
        passed_count: 0,
        total_count: 0,
        runtime_ms: 0,
        test_case_results: [],
      });
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!problem) return;
    setSubmitting(true);
    setActiveTab('result');
    try {
      const res = await api.submitSolution({
        problem_id: problem.id,
        language,
        code,
        is_submission: true,
      });
      setRunResult(res);
      if (onSubmissionSuccess) onSubmissionSuccess(res);
    } catch (err) {
      setRunResult({
        status: 'Submission Failed',
        error: err.message,
        passed_count: 0,
        total_count: 0,
        runtime_ms: 0,
        test_case_results: [],
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#090D16] rounded-xl border border-slate-800 overflow-hidden shadow-xl">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-[#0F172A] border-b border-slate-800 gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <FileCode2 className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-slate-200">Language:</span>
          </div>

          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-3 py-1 font-mono focus:outline-none focus:border-indigo-500"
          >
            <option value="python">Python 3 (3.10+)</option>
            <option value="c">C (GCC 10.2)</option>
            <option value="cpp">C++ (G++ 10.2)</option>
            <option value="java">Java (OpenJDK 17)</option>
            <option value="javascript">JavaScript (Node.js)</option>
            <option value="typescript">TypeScript</option>
            <option value="go">Go (Golang)</option>
            <option value="rust">Rust</option>
            <option value="csharp">C# (.NET)</option>
            <option value="php">PHP</option>
            <option value="ruby">Ruby</option>
            <option value="kotlin">Kotlin</option>
            <option value="swift">Swift</option>
            <option value="sql">SQL (SQLite)</option>
            <option value="bash">Bash / Shell</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetCode}
            title="Reset code to initial template"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => handleRunCode(activeTab === 'custom_input')}
            disabled={running || submitting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold shadow-sm transition"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400 fill-current" />
            <span>{running ? 'Compiling...' : 'Run Code'}</span>
          </button>

          {problem && (
            <button
              onClick={handleSubmit}
              disabled={running || submitting}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Evaluating...' : 'Submit Solution'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Code Textarea / Editor */}
      <div className="flex-1 min-h-[300px] p-3 font-mono text-xs text-slate-200 bg-[#090D16]">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck="false"
          rows={16}
          className="w-full h-full p-3 bg-transparent text-slate-200 font-mono text-xs border-0 focus:outline-none resize-none leading-relaxed selection:bg-indigo-600/40"
          placeholder="Write your algorithm here..."
        />
      </div>

      {/* Bottom Console Tabs & Output Drawer */}
      <div className="border-t border-slate-800 bg-[#0F172A]">
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            {problem && (
              <button
                onClick={() => setActiveTab('testcases')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'testcases'
                    ? 'bg-slate-800 text-indigo-400 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sample Test Cases
              </button>
            )}

            <button
              onClick={() => setActiveTab('custom_input')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                activeTab === 'custom_input'
                  ? 'bg-slate-800 text-indigo-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Custom Stdin
            </button>

            <button
              onClick={() => setActiveTab('result')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                activeTab === 'result'
                  ? 'bg-slate-800 text-indigo-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Execution Console {runResult && `(${runResult.status})`}
            </button>
          </div>
        </div>

        {/* Tab Body */}
        <div className="p-4 max-h-56 overflow-y-auto font-mono text-xs">
          {activeTab === 'custom_input' && (
            <div className="space-y-2">
              <span className="text-[11px] text-slate-400">Standard Input (stdin):</span>
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                rows={3}
                placeholder="Enter input values here..."
                className="w-full bg-[#090D16] p-2.5 rounded-lg border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {activeTab === 'testcases' && problem && (
            <div className="space-y-3">
              {problem.sample_test_cases?.map((tc, idx) => (
                <div key={tc.id || idx} className="p-2.5 rounded-lg bg-[#090D16] border border-slate-800 space-y-1">
                  <span className="text-[10px] text-indigo-400 font-bold uppercase">Sample Case #{idx + 1}</span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500">Input:</span>
                      <pre className="text-slate-300 mt-0.5 whitespace-pre-wrap">{tc.input_data || '(empty)'}</pre>
                    </div>
                    <div>
                      <span className="text-slate-500">Expected Output:</span>
                      <pre className="text-emerald-400 mt-0.5 whitespace-pre-wrap">{tc.expected_output}</pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'result' && (
            <div className="space-y-3">
              {!runResult ? (
                <div className="text-slate-500 text-center py-4">
                  Click "Run Code" to compile and view execution output here.
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Verdict Status Banner */}
                  <div className={`p-3 rounded-lg flex items-center justify-between border ${
                    runResult.status === 'Accepted' || runResult.status === 'Executed'
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                  }`}>
                    <div className="flex items-center gap-2 font-bold text-sm">
                      {runResult.status === 'Accepted' || runResult.status === 'Executed' ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400" />
                      )}
                      <span>{runResult.status}</span>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                      {runResult.passed_count !== undefined && problem && (
                        <span>Passed: {runResult.passed_count}/{runResult.total_count}</span>
                      )}
                      <span>Runtime: {runResult.runtime_ms} ms</span>
                    </div>
                  </div>

                  {/* Output or Error */}
                  {runResult.error && (
                    <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-800/40 text-rose-300 whitespace-pre-wrap font-mono">
                      {runResult.error}
                    </div>
                  )}

                  {runResult.output && (
                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-400">Standard Output:</span>
                      <pre className="p-3 rounded-lg bg-[#090D16] border border-slate-800 text-slate-200 whitespace-pre-wrap font-mono">
                        {runResult.output}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
