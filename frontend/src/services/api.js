const getBaseHost = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }

  const hostname = window.location.hostname;
  const isLocalOrLAN = 
    hostname === 'localhost' || 
    hostname === '127.0.0.1' || 
    hostname === '0.0.0.0' || 
    hostname.startsWith('192.168.') || 
    hostname.startsWith('10.') || 
    hostname.startsWith('172.') || 
    hostname.endsWith('.local');

  if (isLocalOrLAN) {
    return `http://${hostname}:8001`;
  }

  return 'https://btech-learning-backend.onrender.com';
};

const BASE_HOST = getBaseHost();
const API_BASE = `${BASE_HOST}/api/v1`;

// Pre-seeded offline fallback courses matching engineering curriculum
const SEED_COURSES = [
  {
    id: 'course_java',
    title: 'Java',
    slug: 'java',
    short_description: 'Learn Java programming from fundamentals to object-oriented programming.',
    subject_name: 'Languages & OOP',
    category: 'programming',
    progress: 65,
    lessons_count: 24,
    students_count: 245,
    duration_hours: 9,
    duration_text: '8h 30m',
    level: 'Beginner',
    status: 'published'
  },
  {
    id: 'course_cpp',
    title: 'C++',
    slug: 'cpp',
    short_description: 'Build strong programming fundamentals with modern C++.',
    subject_name: 'Systems Programming',
    category: 'programming',
    progress: 35,
    lessons_count: 20,
    students_count: 182,
    duration_hours: 8,
    duration_text: '7h 15m',
    level: 'Intermediate',
    status: 'published'
  },
  {
    id: 'course_python',
    title: 'Python',
    slug: 'python',
    short_description: 'Learn Python programming, problem solving, and practical development.',
    subject_name: 'Computer Science',
    category: 'programming',
    progress: 80,
    lessons_count: 28,
    students_count: 310,
    duration_hours: 10,
    duration_text: '9h 45m',
    level: 'Beginner',
    status: 'published'
  },
  {
    id: 'course_dsa',
    title: 'Data Structures & Algorithms',
    slug: 'dsa',
    short_description: 'Master core data structures and algorithmic problem solving.',
    subject_name: 'Algorithms',
    category: 'cs',
    progress: 20,
    lessons_count: 32,
    students_count: 156,
    duration_hours: 12,
    duration_text: '12h 00m',
    level: 'Intermediate',
    status: 'published'
  },
  {
    id: 'course_web_dev',
    title: 'Web Development',
    slug: 'web-development',
    short_description: 'Learn HTML, CSS, JavaScript, and modern web development.',
    subject_name: 'Web Tech',
    category: 'web',
    progress: 10,
    lessons_count: 26,
    students_count: 215,
    duration_hours: 11,
    duration_text: '10h 30m',
    level: 'Beginner',
    status: 'published'
  },
  {
    id: 'course_sql',
    title: 'SQL & Databases',
    slug: 'sql-databases',
    short_description: 'Master relational databases, SQL queries, indexing, and data modeling.',
    subject_name: 'Databases',
    category: 'database',
    progress: 0,
    lessons_count: 18,
    students_count: 142,
    duration_hours: 6,
    duration_text: '6h 00m',
    level: 'Beginner',
    status: 'published'
  }
];

class ApiService {
  constructor() {
    this.token = localStorage.getItem('btech_token') || null;
    this.cache = new Map();
    // Seed initial cache for instantaneous 0ms page rendering
    this.cache.set('/courses', { data: SEED_COURSES, timestamp: Date.now() });
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('btech_token', token);
    } else {
      localStorage.removeItem('btech_token');
    }
  }

  clearCache() {
    this.cache.clear();
  }

  async request(endpoint, options = {}) {
    const isGet = !options.method || options.method === 'GET';
    const cacheKey = endpoint;
    const now = Date.now();
    const cacheEntry = this.cache.get(cacheKey);

    // Fast-path: Return cached data immediately if fresh (< 30s)
    if (isGet && cacheEntry && (now - cacheEntry.timestamp < 30000)) {
      // Revalidate in background without blocking
      this.fetchAndCache(endpoint, options, cacheKey).catch(() => {});
      return cacheEntry.data;
    }

    return this.fetchAndCache(endpoint, options, cacheKey);
  }

  async fetchAndCache(endpoint, options, cacheKey) {
    const isGet = !options.method || options.method === 'GET';
    const url = `${API_BASE}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const controller = new AbortController();
    // Fast failover timeout (2000ms max) to prevent blocking page transitions
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || 2000);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers,
      });
      clearTimeout(timeoutId);

      if (response.status === 401) {
        if (!endpoint.startsWith('/auth/login')) {
          this.setToken(null);
        }
      }

      let data = {};
      try {
        data = await response.json();
      } catch (e) {
        data = { message: `Server returned status ${response.status}` };
      }

      if (!response.ok) {
        throw new Error(data.detail || data.message || `API request failed with status ${response.status}`);
      }

      // Cache successful GET responses
      if (isGet) {
        this.cache.set(cacheKey, { data, timestamp: Date.now() });
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      // If network fails or times out, check if we have fallback cached data
      if (isGet) {
        if (cacheKey.startsWith('/courses')) {
          return SEED_COURSES;
        }
        const cached = this.cache.get(cacheKey);
        if (cached) return cached.data;
      }

      console.warn(`[CodeForge] API fetch fallback for ${endpoint}:`, error.message);
      if (isGet && cacheKey.startsWith('/courses')) {
        return SEED_COURSES;
      }
      throw error;
    }
  }

  // Auth & OTP Verification
  sendOtp(email, purpose = 'registration') {
    return this.request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email, purpose }),
    });
  }

  verifyOtp(email, otp_code, purpose = 'registration') {
    return this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp_code, purpose }),
    });
  }

  login(email, password, admin_passcode = null) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, admin_passcode }),
    });
  }

  adminLogin(email, password, admin_passcode) {
    return this.request('/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify({ email, password, admin_passcode }),
    });
  }

  register(payload) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  getMe() {
    return this.request('/auth/me');
  }

  updateProfile(payload) {
    return this.request('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  // Subjects & Courses
  getSubjects() {
    return this.request('/subjects');
  }

  getCourses(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/courses${qs ? `?${qs}` : ''}`);
  }

  getCourseDetail(idOrSlug) {
    return this.request(`/courses/${idOrSlug}`);
  }

  getMyCourses() {
    return this.request('/progress/my-courses');
  }

  // Lectures & Sequential Unlock
  getLecture(lectureId) {
    return this.request(`/lectures/${lectureId}`);
  }

  completeLecture(lectureId) {
    return this.request(`/lectures/${lectureId}/complete`, {
      method: 'POST',
    });
  }

  // Theory Questions & Assessments
  getQuestions(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/questions${qs ? `?${qs}` : ''}`);
  }

  attemptQuestion(questionId, submittedAnswer) {
    return this.request(`/questions/${questionId}/attempt`, {
      method: 'POST',
      body: JSON.stringify({ submitted_answer: submittedAnswer }),
    });
  }

  getPracticeStats() {
    return this.request('/questions/stats/summary');
  }

  // Coding Problems & Execution Sandbox
  getProblems(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/problems${qs ? `?${qs}` : ''}`);
  }

  getProblemDetail(idOrSlug) {
    return this.request(`/problems/${idOrSlug}`);
  }

  runCodePreview(payload) {
    return this.request('/code/run', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  executeSandboxCode(payload) {
    return this.request('/code/sandbox-execute', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  submitSolution(payload) {
    return this.request('/submissions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  getMySubmissions() {
    return this.request('/submissions/my');
  }

  // Subscription & Billing
  getPlans() {
    return this.request('/subscription/plans');
  }

  validateCoupon(code, planId) {
    return this.request('/subscription/validate-coupon', {
      method: 'POST',
      body: JSON.stringify({ code, plan_id: planId }),
    });
  }

  checkout(planId, couponCode = null) {
    return this.request('/subscription/checkout', {
      method: 'POST',
      body: JSON.stringify({ plan_id: planId, coupon_code: couponCode }),
    });
  }

  getMyEntitlement() {
    return this.request('/subscription/me');
  }

  getPaymentHistory() {
    return this.request('/subscription/history');
  }

  // Admin CMS
  getAdminStats() {
    return this.request('/admin/dashboard/stats');
  }

  createSubject(data) {
    this.clearCache();
    return this.request('/admin/subjects', { method: 'POST', body: JSON.stringify(data) });
  }

  updateSubject(id, data) {
    this.clearCache();
    return this.request(`/admin/subjects/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  deleteSubject(id) {
    this.clearCache();
    return this.request(`/admin/subjects/${id}`, { method: 'DELETE' });
  }

  createCourse(data) {
    this.clearCache();
    return this.request('/admin/courses', { method: 'POST', body: JSON.stringify(data) });
  }

  getAdminCourseCurriculum(courseId) {
    return this.request(`/admin/courses/${courseId}/curriculum`);
  }

  deleteCourse(id) {
    this.clearCache();
    return this.request(`/admin/courses/${id}`, { method: 'DELETE' });
  }

  createModule(data) {
    this.clearCache();
    return this.request('/admin/modules', { method: 'POST', body: JSON.stringify(data) });
  }

  updateModule(id, data) {
    this.clearCache();
    return this.request(`/admin/modules/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  deleteModule(id) {
    this.clearCache();
    return this.request(`/admin/modules/${id}`, { method: 'DELETE' });
  }

  createLecture(data) {
    this.clearCache();
    return this.request('/admin/lectures', { method: 'POST', body: JSON.stringify(data) });
  }

  deleteLecture(id) {
    this.clearCache();
    return this.request(`/admin/lectures/${id}`, { method: 'DELETE' });
  }

  createQuestion(data) {
    return this.request('/admin/questions', { method: 'POST', body: JSON.stringify(data) });
  }

  deleteQuestion(id) {
    return this.request(`/admin/questions/${id}`, { method: 'DELETE' });
  }

  createProblem(data) {
    return this.request('/admin/problems', { method: 'POST', body: JSON.stringify(data) });
  }

  deleteProblem(id) {
    return this.request(`/admin/problems/${id}`, { method: 'DELETE' });
  }

  updateProblem(id, data) {
    return this.request(`/admin/problems/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  updateQuestion(id, data) {
    return this.request(`/admin/questions/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  updateCourse(id, data) {
    this.clearCache();
    return this.request(`/admin/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  updateLecture(id, data) {
    this.clearCache();
    return this.request(`/admin/lectures/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  createPlan(data) {
    return this.request('/admin/plans', { method: 'POST', body: JSON.stringify(data) });
  }

  updatePlan(id, data) {
    return this.request(`/admin/plans/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  deletePlan(id) {
    return this.request(`/admin/plans/${id}`, { method: 'DELETE' });
  }

  createCoupon(data) {
    return this.request('/admin/coupons', { method: 'POST', body: JSON.stringify(data) });
  }

  getAdminUsers() {
    return this.request('/admin/users');
  }

  updateUserRole(userId, role) {
    return this.request(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  getDatasetStatus() {
    return this.request('/admin/datasets/status');
  }

  importDatasetsFromDisk() {
    return this.request('/admin/datasets/import-from-disk', { method: 'POST' });
  }

  syncToSupabase() {
    return this.request('/admin/datasets/sync-to-supabase', { method: 'POST' });
  }

  // Dynamic Settings
  getPublicSettings() {
    return this.request('/settings/public');
  }

  getAdminSettings() {
    return this.request('/admin/settings');
  }

  saveAdminSettings(settings) {
    return this.request('/admin/settings', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  }
}

export const api = new ApiService();
