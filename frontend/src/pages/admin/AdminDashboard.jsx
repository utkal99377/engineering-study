import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { AdminSidebar } from './components/AdminSidebar';
import { AdminHeader } from './components/AdminHeader';
import { OverviewTab } from './tabs/OverviewTab';
import { CoursesTab } from './tabs/CoursesTab';
import { CurriculumStudio } from './tabs/CurriculumStudio';
import { SubjectsTab } from './tabs/SubjectsTab';
import { QuestionsTab } from './tabs/QuestionsTab';
import { ProblemsTab } from './tabs/ProblemsTab';
import { PlansTab } from './tabs/PlansTab';
import { UsersTab } from './tabs/UsersTab';
import { SettingsTab } from './tabs/SettingsTab';
import { DatabaseTab } from './tabs/DatabaseTab';

// Modals
import { CourseModal } from './modals/CourseModal';
import { LectureModal } from './modals/LectureModal';
import { SubjectModal } from './modals/SubjectModal';
import { QuestionModal } from './modals/QuestionModal';
import { ProblemModal } from './modals/ProblemModal';
import { PlanModal } from './modals/PlanModal';
import { CouponModal } from './modals/CouponModal';

import { CheckCircle2, AlertCircle } from 'lucide-react';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview'); // overview, courses, subjects, questions, problems, plans, users, settings, database, curriculum-studio
  const [activeCourseForCurriculum, setActiveCourseForCurriculum] = useState(null);

  // Platform Data
  const [stats, setStats] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [problems, setProblems] = useState([]);
  const [plans, setPlans] = useState([]);
  const [users, setUsers] = useState([]);
  const [datasetStatus, setDatasetStatus] = useState(null);
  const [adminSettings, setAdminSettings] = useState(null);

  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState(null);
  const [syncingSupa, setSyncingSupa] = useState(false);

  // Modal States
  const [courseModal, setCourseModal] = useState({ isOpen: false, data: null });
  const [lectureModal, setLectureModal] = useState({ isOpen: false, data: null, moduleName: '', availableLectures: [] });
  const [subjectModal, setSubjectModal] = useState({ isOpen: false, data: null });
  const [questionModal, setQuestionModal] = useState({ isOpen: false, data: null });
  const [problemModal, setProblemModal] = useState({ isOpen: false, data: null });
  const [planModal, setPlanModal] = useState({ isOpen: false, data: null });
  const [couponModal, setCouponModal] = useState({ isOpen: false });

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [st, subjs, crs, qs, probs, pls, us, dStatus, dynSettings] = await Promise.all([
        api.getAdminStats().catch(() => null),
        api.getSubjects().catch(() => []),
        api.getCourses().catch(() => []),
        api.getQuestions().catch(() => []),
        api.getProblems().catch(() => []),
        api.getPlans().catch(() => []),
        api.getAdminUsers().catch(() => []),
        api.getDatasetStatus().catch(() => null),
        api.getAdminSettings().catch(() => null),
      ]);
      setStats(st);
      setSubjects(subjs);
      setCourses(crs);
      setQuestions(qs);
      setProblems(probs);
      setPlans(pls);
      setUsers(us);
      setDatasetStatus(dStatus);
      if (dynSettings) {
        setAdminSettings(dynSettings);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(null), 4500);
  };

  // --- Handlers: Courses ---
  const handleSaveCourse = async (courseData) => {
    if (courseData.id) {
      await api.updateCourse(courseData.id, courseData);
      showNotification('✅ Course updated successfully!');
    } else {
      await api.createCourse(courseData);
      showNotification('✅ Course created and published live!');
    }
    loadAllAdminData();
  };

  const handleDeleteCourse = async (id, title) => {
    if (!confirm(`Are you sure you want to delete course "${title}"? All associated modules and lectures will be deleted.`)) return;
    try {
      await api.deleteCourse(id);
      showNotification('Course deleted.');
      if (activeCourseForCurriculum?.id === id) {
        setActiveTab('courses');
        setActiveCourseForCurriculum(null);
      }
      loadAllAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleOpenCurriculum = (course) => {
    setActiveCourseForCurriculum(course);
    setActiveTab('curriculum-studio');
  };

  // --- Handlers: Lectures & Modules ---
  const handleSaveLecture = async (lectureData) => {
    if (lectureData.id) {
      await api.updateLecture(lectureData.id, lectureData);
      showNotification('✅ Lecture and sequential rules updated!');
    } else {
      await api.createLecture(lectureData);
      showNotification('✅ Lecture added to module!');
    }
    loadAllAdminData();
  };

  const handleDeleteLecture = async (id, title) => {
    if (!confirm(`Delete lecture "${title}"?`)) return;
    try {
      await api.deleteLecture(id);
      showNotification('Lecture deleted.');
      loadAllAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditModule = async (mod) => {
    const newTitle = prompt('Enter new module title:', mod.title);
    if (!newTitle || newTitle.trim() === '' || newTitle === mod.title) return;
    try {
      await api.updateModule(mod.id, { ...mod, title: newTitle.trim() });
      showNotification('✅ Module title updated.');
      loadAllAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteModule = async (id, title) => {
    if (!confirm(`Delete module "${title}" and all its lectures?`)) return;
    try {
      await api.deleteModule(id);
      showNotification('Module deleted.');
      loadAllAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  // --- Handlers: Subjects ---
  const handleSaveSubject = async (subData) => {
    if (subData.id) {
      await api.updateSubject(subData.id, subData);
      showNotification('✅ Discipline updated.');
    } else {
      await api.createSubject(subData);
      showNotification('✅ New Discipline added.');
    }
    loadAllAdminData();
  };

  const handleDeleteSubject = async (id, name) => {
    if (!confirm(`Delete subject "${name}"?`)) return;
    try {
      await api.deleteSubject(id);
      showNotification('Subject deleted.');
      loadAllAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  // --- Handlers: Questions (MCQs) ---
  const handleSaveQuestion = async (qData) => {
    if (qData.id) {
      await api.updateQuestion(qData.id, qData);
      showNotification('✅ MCQ updated.');
    } else {
      await api.createQuestion(qData);
      showNotification('✅ Question added to bank.');
    }
    loadAllAdminData();
  };

  const handleDeleteQuestion = async (id) => {
    if (!confirm('Delete this question?')) return;
    try {
      await api.deleteQuestion(id);
      showNotification('Question removed.');
      loadAllAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  // --- Handlers: Problems ---
  const handleSaveProblem = async (pData) => {
    if (pData.id) {
      await api.updateProblem(pData.id, pData);
      showNotification('✅ Coding problem updated.');
    } else {
      await api.createProblem(pData);
      showNotification('✅ Coding challenge published!');
    }
    loadAllAdminData();
  };

  const handleDeleteProblem = async (id) => {
    if (!confirm('Delete this coding problem?')) return;
    try {
      await api.deleteProblem(id);
      showNotification('Problem deleted.');
      loadAllAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  // --- Handlers: Plans & Coupons ---
  const handleSavePlan = async (planData) => {
    if (planData.id) {
      await api.updatePlan(planData.id, planData);
      showNotification('✅ Subscription plan updated.');
    } else {
      await api.createPlan(planData);
      showNotification('✅ Subscription plan created.');
    }
    loadAllAdminData();
  };

  const handleDeletePlan = async (id) => {
    if (!confirm('Delete this subscription plan?')) return;
    try {
      await api.deletePlan(id);
      showNotification('Plan deleted.');
      loadAllAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveCoupon = async (couponData) => {
    await api.createCoupon(couponData);
    showNotification('✅ Coupon code activated!');
    loadAllAdminData();
  };

  // --- Handlers: Users & Roles ---
  const handleRoleChange = async (userId, role) => {
    try {
      await api.updateUserRole(userId, role);
      showNotification('✅ User role updated!');
      loadAllAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  // --- Handlers: Settings & Sync ---
  const handleSaveSettings = async (newSettings) => {
    try {
      await api.saveAdminSettings(newSettings);
      setAdminSettings(newSettings);
      showNotification('✅ Platform settings saved! Changes are live across the application.');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSyncToSupabase = async () => {
    setSyncingSupa(true);
    try {
      const res = await api.syncToSupabase();
      if (res.success) {
        showNotification(`⚡ Supabase PostgreSQL Live: ${res.message}`);
      } else {
        showNotification(res.message || 'Supabase connection verified.');
      }
      loadAllAdminData();
    } catch (err) {
      showNotification(`Supabase Status: ${err.message}`);
    } finally {
      setSyncingSupa(false);
    }
  };

  const handleImportDatasets = async () => {
    try {
      const res = await api.importDatasetsFromDisk();
      showNotification(`✅ Dataset sync complete: ${JSON.stringify(res.stats || res.imported_stats || 'Success')}`);
      loadAllAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Quick Action Hub from Header
  const handleQuickAction = (type) => {
    if (type === 'course') setCourseModal({ isOpen: true, data: null });
    if (type === 'subject') setSubjectModal({ isOpen: true, data: null });
    if (type === 'question') setQuestionModal({ isOpen: true, data: null });
    if (type === 'problem') setProblemModal({ isOpen: true, data: null });
  };

  // Compute Breadcrumb trail & Titles
  const getHeaderDetails = () => {
    switch (activeTab) {
      case 'overview':
        return {
          title: 'Platform Overview & Performance',
          subtitle: 'Key engagement statistics, revenue metrics, and real-time student sandbox activity.',
          breadcrumbs: ['Overview'],
        };
      case 'courses':
        return {
          title: 'B.Tech Course Studio & Catalog',
          subtitle: 'Create and organize engineering tracks, access tiers, and curriculum blueprints.',
          breadcrumbs: ['Academic Studio', 'Courses'],
        };
      case 'curriculum-studio':
        return {
          title: activeCourseForCurriculum?.title || 'Curriculum Studio',
          subtitle: 'Interactive module sequence, video streams, notes, and sequential lecture rules.',
          breadcrumbs: ['Courses', activeCourseForCurriculum?.title || 'Curriculum', 'Curriculum Studio'],
        };
      case 'subjects':
        return {
          title: 'Engineering Disciplines & Subjects',
          subtitle: 'Manage B.Tech academic branches (CSE, IT, AI/ML, Core Systems).',
          breadcrumbs: ['Academic Studio', 'Disciplines'],
        };
      case 'questions':
        return {
          title: 'Theory & MCQ Question Bank',
          subtitle: 'Curate conceptual questions, answer choices, and automated explanations.',
          breadcrumbs: ['Academic Studio', 'MCQ Bank'],
        };
      case 'problems':
        return {
          title: 'Coding Sandbox Problems Arena',
          subtitle: 'Publish multi-language algorithmic problems, runtime limits, and test benchmarks.',
          breadcrumbs: ['Academic Studio', 'Coding Arena'],
        };
      case 'plans':
        return {
          title: 'Pro Subscription Plans & Coupons',
          subtitle: 'Configure student pricing tiers and active checkout discount codes.',
          breadcrumbs: ['Monetization', 'Plans & Coupons'],
        };
      case 'users':
        return {
          title: 'Student Directory & Permissions',
          subtitle: 'Manage student enrollments, college branches, and administrator roles.',
          breadcrumbs: ['Management', 'Students & Roles'],
        };
      case 'settings':
        return {
          title: 'Live Dynamic App Configuration',
          subtitle: 'Update announcements, hero headlines, and feature flags live across all apps.',
          breadcrumbs: ['Management', 'Live CMS Config'],
        };
      case 'database':
        return {
          title: 'Database Engine & Cloud Sync',
          subtitle: 'Monitor Supabase PostgreSQL cluster status and reload curriculum datasets.',
          breadcrumbs: ['Management', 'Database & Sync'],
        };
      default:
        return {
          title: 'Administrator Console',
          subtitle: 'Data-driven B.Tech learning platform control center.',
          breadcrumbs: ['Admin'],
        };
    }
  };

  const headerDetails = getHeaderDetails();

  if (loading && !stats && courses.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-400 font-mono">Loading Administrator Console...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Dynamic Header */}
      <AdminHeader
        title={headerDetails.title}
        subtitle={headerDetails.subtitle}
        breadcrumbs={headerDetails.breadcrumbs}
        onQuickAction={handleQuickAction}
        onSyncSupabase={handleSyncToSupabase}
        syncingSupa={syncingSupa}
      />

      {/* Action Notification Alert */}
      {actionMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-semibold flex items-center gap-2.5 animate-fadeIn shadow-lg">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Main Two-Column Layout: Sidebar + Active Tab Content */}
      <div className="flex flex-col lg:flex-row items-start gap-6">
        
        {/* Left Sidebar */}
        <AdminSidebar
          activeTab={activeTab === 'curriculum-studio' ? 'courses' : activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            if (tab !== 'curriculum-studio') {
              setActiveCourseForCurriculum(null);
            }
          }}
          counts={{
            courses: courses.length,
            subjects: subjects.length,
            questions: questions.length,
            problems: problems.length,
            plans: plans.length,
            users: users.length,
          }}
        />

        {/* Right Tab Canvas */}
        <div className="flex-1 w-full min-w-0">
          
          {activeTab === 'overview' && (
            <OverviewTab
              stats={stats}
              courses={courses}
              questions={questions}
              problems={problems}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'courses' && (
            <CoursesTab
              courses={courses}
              subjects={subjects}
              onCreateCourse={() => setCourseModal({ isOpen: true, data: null })}
              onEditCourse={(c) => setCourseModal({ isOpen: true, data: c })}
              onDeleteCourse={handleDeleteCourse}
              onOpenCurriculum={handleOpenCurriculum}
              onManageSubjects={() => setActiveTab('subjects')}
            />
          )}

          {activeTab === 'curriculum-studio' && activeCourseForCurriculum && (
            <CurriculumStudio
              course={activeCourseForCurriculum}
              onBack={() => {
                setActiveTab('courses');
                setActiveCourseForCurriculum(null);
              }}
              onOpenAddLecture={(moduleId, modTitle, availableLecs) => {
                setLectureModal({
                  isOpen: true,
                  data: { module_id: moduleId },
                  moduleName: modTitle,
                  availableLectures: availableLecs,
                });
              }}
              onOpenEditLecture={(lec, modTitle, availableLecs) => {
                setLectureModal({
                  isOpen: true,
                  data: lec,
                  moduleName: modTitle,
                  availableLectures: availableLecs,
                });
              }}
              onDeleteLecture={handleDeleteLecture}
              onEditModule={handleEditModule}
              onDeleteModule={handleDeleteModule}
              onNotify={showNotification}
            />
          )}

          {activeTab === 'subjects' && (
            <SubjectsTab
              subjects={subjects}
              onCreateSubject={() => setSubjectModal({ isOpen: true, data: null })}
              onEditSubject={(s) => setSubjectModal({ isOpen: true, data: s })}
              onDeleteSubject={handleDeleteSubject}
            />
          )}

          {activeTab === 'questions' && (
            <QuestionsTab
              questions={questions}
              courses={courses}
              onCreateQuestion={() => setQuestionModal({ isOpen: true, data: null })}
              onEditQuestion={(q) => setQuestionModal({ isOpen: true, data: q })}
              onDeleteQuestion={handleDeleteQuestion}
            />
          )}

          {activeTab === 'problems' && (
            <ProblemsTab
              problems={problems}
              courses={courses}
              onCreateProblem={() => setProblemModal({ isOpen: true, data: null })}
              onEditProblem={(p) => setProblemModal({ isOpen: true, data: p })}
              onDeleteProblem={handleDeleteProblem}
            />
          )}

          {activeTab === 'plans' && (
            <PlansTab
              plans={plans}
              onCreatePlan={() => setPlanModal({ isOpen: true, data: null })}
              onEditPlan={(p) => setPlanModal({ isOpen: true, data: p })}
              onDeletePlan={handleDeletePlan}
              onCreateCoupon={() => setCouponModal({ isOpen: true })}
            />
          )}

          {activeTab === 'users' && (
            <UsersTab
              users={users}
              onRoleChange={handleRoleChange}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              settings={adminSettings}
              onSaveSettings={handleSaveSettings}
            />
          )}

          {activeTab === 'database' && (
            <DatabaseTab
              datasetStatus={datasetStatus}
              onImportDatasets={handleImportDatasets}
              onSyncSupabase={handleSyncToSupabase}
              syncingSupa={syncingSupa}
            />
          )}

        </div>

      </div>

      {/* ================= MODAL DIALOGS ================= */}
      <CourseModal
        isOpen={courseModal.isOpen}
        onClose={() => setCourseModal({ isOpen: false, data: null })}
        onSave={handleSaveCourse}
        initialData={courseModal.data}
        subjects={subjects}
      />

      <LectureModal
        isOpen={lectureModal.isOpen}
        onClose={() => setLectureModal({ isOpen: false, data: null, moduleName: '', availableLectures: [] })}
        onSave={handleSaveLecture}
        initialData={lectureModal.data}
        availableLectures={lectureModal.availableLectures}
        moduleName={lectureModal.moduleName}
      />

      <SubjectModal
        isOpen={subjectModal.isOpen}
        onClose={() => setSubjectModal({ isOpen: false, data: null })}
        onSave={handleSaveSubject}
        initialData={subjectModal.data}
      />

      <QuestionModal
        isOpen={questionModal.isOpen}
        onClose={() => setQuestionModal({ isOpen: false, data: null })}
        onSave={handleSaveQuestion}
        initialData={questionModal.data}
        courses={courses}
      />

      <ProblemModal
        isOpen={problemModal.isOpen}
        onClose={() => setProblemModal({ isOpen: false, data: null })}
        onSave={handleSaveProblem}
        initialData={problemModal.data}
        courses={courses}
      />

      <PlanModal
        isOpen={planModal.isOpen}
        onClose={() => setPlanModal({ isOpen: false, data: null })}
        onSave={handleSavePlan}
        initialData={planModal.data}
      />

      <CouponModal
        isOpen={couponModal.isOpen}
        onClose={() => setCouponModal({ isOpen: false })}
        onSave={handleSaveCoupon}
      />

    </div>
  );
};
