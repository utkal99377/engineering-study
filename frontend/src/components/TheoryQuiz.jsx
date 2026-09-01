import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  Award,
  BookOpen
} from 'lucide-react';
import { api } from '../services/api';

export const TheoryQuiz = ({ questions = [], onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState({}); // { [questionId]: resultObj }

  if (!questions || questions.length === 0) {
    return (
      <div className="p-8 text-center glass-card rounded-2xl">
        <BookOpen className="w-12 h-12 text-slate-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-200">No Theory Questions Available</h3>
        <p className="text-xs text-slate-400 mt-1">Questions will appear here once added by the instructor.</p>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const currentResult = results[currentQ?.id];

  const handleSelectOption = (opt) => {
    if (currentResult) return; // already attempted
    setSelectedOption(opt);
  };

  const handleSubmitAttempt = async () => {
    if (!selectedOption || submitting) return;
    setSubmitting(true);
    try {
      const res = await api.attemptQuestion(currentQ.id, selectedOption);
      setResults(prev => ({
        ...prev,
        [currentQ.id]: res
      }));
    } catch (err) {
      console.error('Failed to submit answer:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption('');
    } else if (onComplete) {
      onComplete(results);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedOption('');
    }
  };

  const totalAttempted = Object.keys(results).length;
  const totalCorrect = Object.values(results).filter(r => r.is_correct).length;

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800 shadow-xl">
      {/* Quiz Header & Progress */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded font-medium ${
            currentQ.difficulty === 'Easy' ? 'bg-emerald-500/20 text-emerald-300' :
            currentQ.difficulty === 'Medium' ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'
          }`}>
            {currentQ.difficulty}
          </span>
          {currentQ.is_important && (
            <span className="text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Exam Essential
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Score: <strong className="text-white">{totalCorrect * 2}</strong> pts</span>
          </div>
        </div>
      </div>

      {/* Question Text */}
      <div className="mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-slate-100 leading-snug">
          {currentQ.text}
        </h3>
      </div>

      {/* Options List */}
      {currentQ.type === 'mcq' && currentQ.options && (
        <div className="space-y-3 mb-6">
          {currentQ.options.map((option, idx) => {
            const optionLetter = String.fromCharCode(65 + idx);
            const isSelected = selectedOption === option;
            const isAnswered = !!currentResult;
            const isCorrectOption = isAnswered && option === currentResult.correct_answer;
            const isUserWrongChoice = isAnswered && isSelected && !currentResult.is_correct;

            let borderClass = 'border-slate-800 hover:border-slate-700 bg-slate-900/60';
            if (isCorrectOption) {
              borderClass = 'border-emerald-500/80 bg-emerald-950/40 text-emerald-200';
            } else if (isUserWrongChoice) {
              borderClass = 'border-rose-500/80 bg-rose-950/40 text-rose-200';
            } else if (isSelected) {
              borderClass = 'border-indigo-500 bg-indigo-950/40 text-indigo-200';
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(option)}
                disabled={isAnswered}
                className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all ${borderClass}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-mono font-bold text-slate-300">
                    {optionLetter}
                  </span>
                  <span className="text-sm font-medium">{option}</span>
                </div>

                {isCorrectOption && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {isUserWrongChoice && <XCircle className="w-5 h-5 text-rose-400" />}
              </button>
            );
          })}
        </div>
      )}

      {/* Explanation Box */}
      {currentResult && (
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 mb-6 transition-all">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-1">
            <HelpCircle className="w-4 h-4" />
            <span>Explanation & Concept:</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {currentResult.explanation || currentQ.explanation || 'No additional explanation provided.'}
          </p>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white disabled:opacity-40 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        {!currentResult ? (
          <button
            onClick={handleSubmitAttempt}
            disabled={!selectedOption || submitting}
            className="px-5 py-2 rounded-lg gradient-brand-btn text-white text-xs font-semibold shadow disabled:opacity-40 transition"
          >
            {submitting ? 'Checking...' : 'Submit Answer'}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center gap-1 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition"
          >
            <span>{currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
