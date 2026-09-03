import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Plus, 
  ArrowLeft, 
  Video, 
  Lock, 
  Edit3, 
  Trash2, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  BookOpen,
  ListOrdered
} from 'lucide-react';
import { api } from '../../../services/api';

export const CurriculumStudio = ({ 
  course, 
  onBack, 
  onOpenAddLecture, 
  onOpenEditLecture, 
  onDeleteLecture,
  onEditModule,
  onDeleteModule,
  onNotify
}) => {
  const [curriculumData, setCurriculumData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newModuleDesc, setNewModuleDesc] = useState('');
  const [showAddModuleForm, setShowAddModuleForm] = useState(false);
  const [addingModule, setAddingModule] = useState(false);

  useEffect(() => {
    loadCurriculum();
  }, [course?.id]);

  const loadCurriculum = async () => {
    if (!course?.id) return;
    setLoading(true);
    try {
      const data = await api.getAdminCourseCurriculum(course.id);
      setCurriculumData(data);
    } catch (err) {
      console.error('Failed to load curriculum:', err);
      onNotify(`Error loading curriculum: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateModule = async (e) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;
    setAddingModule(true);
    try {
      const order_no = (curriculumData?.modules?.length || 0) + 1;
      await api.createModule({
        course_id: course.id,
        title: newModuleTitle.trim(),
        description: newModuleDesc.trim(),
        order_no,
      });
      onNotify('✅ Module created successfully!');
      setNewModuleTitle('');
      setNewModuleDesc('');
      setShowAddModuleForm(false);
      loadCurriculum();
    } catch (err) {
      alert(err.message);
    } finally {
      setAddingModule(false);
    }
  };

  const allLecturesInCourse = (curriculumData?.modules || []).flatMap(m => m.lectures || []);

  return (
    <div className="space-y-6">
      
      {/* Course Header Banner */}
      <div className="clean-panel bg-[#11141E] border border-[#222634] p-5 sm:p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-[#161924] hover:bg-[#1E2230] text-slate-300 hover:text-white border border-[#252A3B] transition"
            title="Back to Courses Catalog"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <img
            src={course.thumbnail || 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&auto=format&fit=crop&q=80'}
            alt={course.title}
            className="w-14 h-14 rounded-xl object-cover bg-slate-800 border border-[#252A3B] shrink-0"
          />

          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-mono">
              <span className="text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded font-medium">
                {course.subject_name || 'Engineering'}
              </span>
              <span className={`px-2 py-0.5 rounded font-semibold uppercase ${
                course.access_type === 'free' ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'
              }`}>
                {course.access_type}
              </span>
              <span className="text-slate-400">{course.level}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate">
              {course.title}
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              {curriculumData?.modules?.length || 0} Modules • {allLecturesInCourse.length} Lectures Total
            </p>
          </div>
        </div>

        {/* Quick Add Module Trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModuleForm(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Module</span>
          </button>
        </div>
      </div>

      {/* Module Add Inline Form (if toggled) */}
      {showAddModuleForm && (
        <form 
          onSubmit={handleCreateModule} 
          className="clean-panel bg-[#141724] border border-indigo-500/30 p-5 rounded-2xl space-y-3 animate-fadeIn"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Create New Module in "{course.title}"</span>
            </h4>
            <button
              type="button"
              onClick={() => setShowAddModuleForm(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-300 block mb-1">Module Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Module 1: Process Scheduling & Threads"
                value={newModuleTitle}
                onChange={(e) => setNewModuleTitle(e.target.value)}
                className="w-full bg-[#0E1017] border border-[#2B3042] rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-slate-300 block mb-1">Module Description (Optional)</label>
              <input
                type="text"
                placeholder="Key concepts covered in this module..."
                value={newModuleDesc}
                onChange={(e) => setNewModuleDesc(e.target.value)}
                className="w-full bg-[#0E1017] border border-[#2B3042] rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={addingModule}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow flex items-center gap-1.5 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{addingModule ? 'Creating...' : 'Save & Add Module'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Curriculum Hierarchy Modules & Lectures */}
      {loading ? (
        <div className="clean-panel bg-[#11141E] border border-[#222634] rounded-2xl p-12 text-center space-y-3">
          <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-400 font-mono">Loading course curriculum tree...</p>
        </div>
      ) : curriculumData?.modules?.length === 0 ? (
        <div className="clean-panel bg-[#11141E] border border-[#222634] rounded-2xl p-12 text-center space-y-3">
          <Layers className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No modules added yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Get started by adding your first curriculum module (e.g. "Module 1: Foundations & Architecture").
          </p>
          <button
            onClick={() => setShowAddModuleForm(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow inline-flex items-center gap-1.5 mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Module</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {curriculumData.modules.map((mod, mIdx) => (
            <div 
              key={mod.id} 
              className="clean-card bg-[#11141E] border border-[#222634] rounded-2xl p-5 space-y-4"
            >
              {/* Module Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E2230] pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-mono text-xs font-bold shrink-0">
                    M{mIdx + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{mod.title}</h4>
                    {mod.description && (
                      <p className="text-xs text-slate-400 mt-0.5">{mod.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => onOpenAddLecture(mod.id, mod.title, allLecturesInCourse)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Lecture</span>
                  </button>

                  <button
                    onClick={() => onEditModule(mod)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 border border-[#222634] transition"
                    title="Edit Module"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDeleteModule(mod.id, mod.title)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 border border-[#222634] transition"
                    title="Delete Module"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Module Lectures Timeline */}
              <div className="space-y-2">
                {(!mod.lectures || mod.lectures.length === 0) ? (
                  <p className="text-xs text-slate-500 italic py-2">
                    No lectures in this module. Click "+ Add Lecture" above to create lesson notes and video streams.
                  </p>
                ) : (
                  mod.lectures.map((lec, lIdx) => {
                    const prerequisite = allLecturesInCourse.find((l) => l.id === lec.prerequisite_id);

                    return (
                      <div
                        key={lec.id}
                        className="p-3 rounded-xl bg-[#161924] border border-[#252A3B] hover:border-[#383E54] flex items-center justify-between text-xs transition"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-6 h-6 rounded-md bg-[#202534] text-indigo-400 font-mono text-[11px] font-semibold flex items-center justify-center shrink-0">
                            {mIdx + 1}.{lIdx + 1}
                          </span>

                          <div className="min-w-0 space-y-0.5">
                            <span className="font-semibold text-slate-200 block truncate">{lec.title}</span>
                            <div className="flex items-center gap-2.5 text-[10px] text-slate-400 font-mono">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-500" />
                                {lec.duration_min || 20} min
                              </span>

                              {lec.video_url && (
                                <span className="text-emerald-400 flex items-center gap-1">
                                  <Video className="w-3 h-3" />
                                  Video Stream
                                </span>
                              )}

                              {prerequisite ? (
                                <span className="text-amber-400 flex items-center gap-1" title={`Prerequisite: ${prerequisite.title}`}>
                                  <Lock className="w-3 h-3" />
                                  Unlocks after: {prerequisite.title}
                                </span>
                              ) : (
                                <span className="text-slate-500">Unlocked</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => onOpenEditLecture(lec, mod.title, allLecturesInCourse)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 transition"
                            title="Edit Lecture"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onDeleteLecture(lec.id, lec.title)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                            title="Delete Lecture"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
