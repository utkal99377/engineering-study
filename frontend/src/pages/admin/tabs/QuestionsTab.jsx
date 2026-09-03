import React, { useState } from 'react';
import { FileQuestion, Plus, Search, Edit3, Trash2, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

export const QuestionsTab = ({ questions = [], courses = [], onCreateQuestion, onEditQuestion, onDeleteQuestion }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = !searchQuery || 
      q.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (q.explanation && q.explanation.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCourse = courseFilter === 'all' || q.course_id === courseFilter;
    const matchesDiff = difficultyFilter === 'all' || q.difficulty === difficultyFilter;
    return matchesSearch && matchesCourse && matchesDiff;
  });

  return (
    <div className="space-y-6">
      
      {/* Control Bar */}
      <div className="clean-panel bg-[#11141E] border border-[#222634] p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Filters */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-1 max-w-2xl flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search MCQs by question text or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#161924] pl-9 pr-3 py-2 rounded-xl border border-[#262B3D] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="bg-[#161924] px-3 py-2 rounded-xl border border-[#262B3D] text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Courses ({questions.length})</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>

          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="bg-[#161924] px-3 py-2 rounded-xl border border-[#262B3D] text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <button
          onClick={onCreateQuestion}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition self-end sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New MCQ</span>
        </button>
      </div>

      {/* Questions List */}
      {filteredQuestions.length === 0 ? (
        <div className="clean-panel bg-[#11141E] border border-[#222634] rounded-2xl p-12 text-center space-y-3">
          <FileQuestion className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No questions match your filter</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search criteria or add a new question to this course bank.
          </p>
          <button
            onClick={onCreateQuestion}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow inline-flex items-center gap-1.5 mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Question Now</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredQuestions.map((q, idx) => {
            const isExpanded = expandedId === q.id;
            const courseObj = courses.find((c) => c.id === q.course_id);

            return (
              <div
                key={q.id}
                className="clean-card bg-[#11141E] border border-[#222634] rounded-2xl p-4 sm:p-5 hover:border-[#383E54] transition space-y-3"
              >
                {/* Top Row: Question Header & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-[#161924] text-indigo-400 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 text-[10px] font-mono">
                        <span className="text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                          {courseObj?.title || 'General Course'}
                        </span>
                        <span className={`px-2 py-0.5 rounded font-semibold ${
                          q.difficulty === 'Easy' ? 'text-emerald-400 bg-emerald-500/10' :
                          q.difficulty === 'Medium' ? 'text-amber-400 bg-amber-500/10' :
                          'text-rose-400 bg-rose-500/10'
                        }`}>
                          {q.difficulty || 'Easy'}
                        </span>
                        <span className="text-slate-400">{q.marks || 2} Marks</span>
                      </div>

                      <h4 className="text-sm font-bold text-white tracking-tight">
                        {q.text}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : q.id)}
                      className="px-2.5 py-1 rounded-lg bg-[#161924] text-slate-300 hover:text-white text-[11px] font-semibold flex items-center gap-1 transition"
                    >
                      <span>{isExpanded ? 'Hide Options' : 'View Choices'}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    <button
                      onClick={() => onEditQuestion(q)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 border border-[#222634] transition"
                      title="Edit Question"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteQuestion(q.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 border border-[#222634] transition"
                      title="Delete Question"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded Choices & Explanation */}
                {isExpanded && (
                  <div className="pt-3 border-t border-[#1E2230] space-y-2.5 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(q.options || []).map((opt, oIdx) => {
                        const isCorrect = q.correct_answer === opt;
                        return (
                          <div
                            key={oIdx}
                            className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                              isCorrect
                                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200 font-semibold'
                                : 'bg-[#161924] border-[#252A3B] text-slate-300'
                            }`}
                          >
                            <span className="w-5 h-5 rounded font-mono font-bold text-[10px] flex items-center justify-center bg-black/30 shrink-0">
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span className="truncate">{opt}</span>
                            {isCorrect && (
                              <span className="ml-auto text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-1.5 py-0.2 rounded">
                                Correct Answer
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <div className="p-3 rounded-xl bg-[#141724] border border-[#232738] text-[11px] text-slate-300">
                        <span className="text-indigo-400 font-bold block mb-0.5">Concept Explanation:</span>
                        <p>{q.explanation}</p>
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
