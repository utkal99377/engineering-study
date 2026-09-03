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

class ApiService {
  constructor() {
    this.token = localStorage.getItem('btech_token') || null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('btech_token', token);
    } else {
      localStorage.removeItem('btech_token');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || 30000);

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
        // Fallback for non-JSON error responses
        data = { message: `Server returned status ${response.status}` };
      }

      if (!response.ok) {
        throw new Error(data.detail || data.message || `API request failed with status ${response.status}`);
      }
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError' || error.message?.includes('abort')) {
        throw new Error(`Connection timed out to ${BASE_HOST}. Please ensure backend is running.`);
      }
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error(`Unable to connect to backend server at ${BASE_HOST}. Please ensure the backend server is running on port 8001.`);
      }
      console.error(`API Error on ${endpoint}:`, error);
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
    return this.request('/admin/subjects', { method: 'POST', body: JSON.stringify(data) });
  }

  updateSubject(id, data) {
    return this.request(`/admin/subjects/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  deleteSubject(id) {
    return this.request(`/admin/subjects/${id}`, { method: 'DELETE' });
  }

  createCourse(data) {
    return this.request('/admin/courses', { method: 'POST', body: JSON.stringify(data) });
  }

  getAdminCourseCurriculum(courseId) {
    return this.request(`/admin/courses/${courseId}/curriculum`);
  }

  deleteCourse(id) {
    return this.request(`/admin/courses/${id}`, { method: 'DELETE' });
  }

  createModule(data) {
    return this.request('/admin/modules', { method: 'POST', body: JSON.stringify(data) });
  }

  updateModule(id, data) {
    return this.request(`/admin/modules/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  deleteModule(id) {
    return this.request(`/admin/modules/${id}`, { method: 'DELETE' });
  }

  createLecture(data) {
    return this.request('/admin/lectures', { method: 'POST', body: JSON.stringify(data) });
  }

  deleteLecture(id) {
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
    return this.request(`/admin/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  updateLecture(id, data) {
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

