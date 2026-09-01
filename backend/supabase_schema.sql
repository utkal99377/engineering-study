-- =====================================================================================
-- B.Tech Learning, Assessment & Programming Practice Platform - Supabase Postgres Schema
-- =====================================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    email VARCHAR(128) UNIQUE NOT NULL,
    hashed_password VARCHAR(256) NOT NULL,
    role VARCHAR(32) DEFAULT 'student' NOT NULL,
    college_branch VARCHAR(128) DEFAULT 'B.Tech Computer Science & Engineering',
    semester VARCHAR(32) DEFAULT '3rd Semester',
    avatar VARCHAR(512) DEFAULT 'https://api.dicebear.com/7.x/bottts/svg?seed=engineer',
    status VARCHAR(32) DEFAULT 'active',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ix_users_email ON users(email);

-- 2. Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    slug VARCHAR(128) UNIQUE NOT NULL,
    icon VARCHAR(64) DEFAULT 'code',
    description TEXT,
    order_no INTEGER DEFAULT 1,
    status VARCHAR(32) DEFAULT 'active',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ix_subjects_slug ON subjects(slug);

-- 3. Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(64) PRIMARY KEY,
    subject_id VARCHAR(64) NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    title VARCHAR(256) NOT NULL,
    slug VARCHAR(256) UNIQUE NOT NULL,
    short_description VARCHAR(512),
    description TEXT,
    thumbnail VARCHAR(512) DEFAULT 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&auto=format&fit=crop&q=80',
    access_type VARCHAR(32) DEFAULT 'free',
    level VARCHAR(32) DEFAULT 'Beginner',
    duration_hours INTEGER DEFAULT 10,
    tags JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(32) DEFAULT 'published',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ix_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS ix_courses_subject_id ON courses(subject_id);

-- 4. Modules Table
CREATE TABLE IF NOT EXISTS modules (
    id VARCHAR(64) PRIMARY KEY,
    course_id VARCHAR(64) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(256) NOT NULL,
    description TEXT,
    order_no INTEGER DEFAULT 1,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ix_modules_course_id ON modules(course_id);

-- 5. Lectures Table
CREATE TABLE IF NOT EXISTS lectures (
    id VARCHAR(64) PRIMARY KEY,
    module_id VARCHAR(64) NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    title VARCHAR(256) NOT NULL,
    order_no INTEGER DEFAULT 1,
    prerequisite_id VARCHAR(64),
    duration_min INTEGER DEFAULT 20,
    video_url VARCHAR(512),
    notes_markdown TEXT,
    status VARCHAR(32) DEFAULT 'active',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ix_lectures_module_id ON lectures(module_id);

-- 6. Resources Table
CREATE TABLE IF NOT EXISTS resources (
    id VARCHAR(64) PRIMARY KEY,
    lecture_id VARCHAR(64) NOT NULL REFERENCES lectures(id) ON DELETE CASCADE,
    title VARCHAR(256) NOT NULL,
    type VARCHAR(32) DEFAULT 'notes',
    url VARCHAR(512) NOT NULL,
    access_level VARCHAR(32) DEFAULT 'free',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ix_resources_lecture_id ON resources(lecture_id);

-- 7. Lecture Progress Table
CREATE TABLE IF NOT EXISTS lecture_progress (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lecture_id VARCHAR(64) NOT NULL REFERENCES lectures(id) ON DELETE CASCADE,
    status VARCHAR(32) DEFAULT 'in_progress',
    completed_at TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_lecture_progress UNIQUE (user_id, lecture_id)
);
CREATE INDEX IF NOT EXISTS ix_lecture_progress_user_id ON lecture_progress(user_id);
CREATE INDEX IF NOT EXISTS ix_lecture_progress_lecture_id ON lecture_progress(lecture_id);

-- 8. Course Progress Table
CREATE TABLE IF NOT EXISTS course_progress (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id VARCHAR(64) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    completed_lectures_count INTEGER DEFAULT 0,
    total_lectures_count INTEGER DEFAULT 0,
    percentage INTEGER DEFAULT 0,
    is_completed VARCHAR(16) DEFAULT 'false',
    last_accessed_lecture_id VARCHAR(64),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_course_progress UNIQUE (user_id, course_id)
);
CREATE INDEX IF NOT EXISTS ix_course_progress_user_id ON course_progress(user_id);
CREATE INDEX IF NOT EXISTS ix_course_progress_course_id ON course_progress(course_id);

-- 9. Theory Questions Table
CREATE TABLE IF NOT EXISTS theory_questions (
    id VARCHAR(64) PRIMARY KEY,
    course_id VARCHAR(64) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    module_id VARCHAR(64),
    type VARCHAR(32) DEFAULT 'mcq',
    title VARCHAR(256) NOT NULL,
    text TEXT NOT NULL,
    options JSONB DEFAULT '[]'::jsonb,
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    marks INTEGER DEFAULT 2,
    difficulty VARCHAR(32) DEFAULT 'Easy',
    is_important BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ix_theory_questions_course_id ON theory_questions(course_id);

-- 10. Question Attempts Table
CREATE TABLE IF NOT EXISTS question_attempts (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id VARCHAR(64) NOT NULL REFERENCES theory_questions(id) ON DELETE CASCADE,
    submitted_answer TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    score_obtained INTEGER DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ix_question_attempts_user_id ON question_attempts(user_id);
CREATE INDEX IF NOT EXISTS ix_question_attempts_question_id ON question_attempts(question_id);

-- 11. Coding Problems Table
CREATE TABLE IF NOT EXISTS coding_problems (
    id VARCHAR(64) PRIMARY KEY,
    course_id VARCHAR(64) REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(256) NOT NULL,
    slug VARCHAR(256) UNIQUE NOT NULL,
    difficulty VARCHAR(32) DEFAULT 'Easy',
    tags JSONB DEFAULT '[]'::jsonb,
    statement TEXT NOT NULL,
    input_format TEXT,
    output_format TEXT,
    constraints TEXT,
    time_limit_sec REAL DEFAULT 2.0,
    memory_limit_mb INTEGER DEFAULT 128,
    starter_code JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(32) DEFAULT 'published',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ix_coding_problems_slug ON coding_problems(slug);
CREATE INDEX IF NOT EXISTS ix_coding_problems_course_id ON coding_problems(course_id);

-- 12. Test Cases Table
CREATE TABLE IF NOT EXISTS test_cases (
    id VARCHAR(64) PRIMARY KEY,
    problem_id VARCHAR(64) NOT NULL REFERENCES coding_problems(id) ON DELETE CASCADE,
    input_data TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    is_hidden BOOLEAN DEFAULT FALSE,
    explanation TEXT,
    order_no INTEGER DEFAULT 1
);
CREATE INDEX IF NOT EXISTS ix_test_cases_problem_id ON test_cases(problem_id);

-- 13. Submissions Table
CREATE TABLE IF NOT EXISTS submissions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    problem_id VARCHAR(64) NOT NULL REFERENCES coding_problems(id) ON DELETE CASCADE,
    language VARCHAR(32) NOT NULL,
    code TEXT NOT NULL,
    status VARCHAR(64) DEFAULT 'Pending',
    passed_test_cases INTEGER DEFAULT 0,
    total_test_cases INTEGER DEFAULT 0,
    runtime_ms REAL DEFAULT 0.0,
    error_message TEXT,
    score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ix_submissions_user_id ON submissions(user_id);
CREATE INDEX IF NOT EXISTS ix_submissions_problem_id ON submissions(problem_id);

-- 14. Subscription Plans Table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    slug VARCHAR(128) UNIQUE NOT NULL,
    price REAL DEFAULT 0.0,
    currency VARCHAR(16) DEFAULT 'INR',
    duration_days INTEGER DEFAULT 30,
    description TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    is_popular BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ix_subscription_plans_slug ON subscription_plans(slug);

-- 15. Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id VARCHAR(64) NOT NULL REFERENCES subscription_plans(id),
    status VARCHAR(32) DEFAULT 'active',
    start_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    provider VARCHAR(64) DEFAULT 'simulated_gateway',
    provider_ref VARCHAR(128),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ix_subscriptions_user_id ON subscriptions(user_id);

-- 16. Payment Records Table
CREATE TABLE IF NOT EXISTS payment_records (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id VARCHAR(64) NOT NULL REFERENCES subscription_plans(id),
    amount REAL NOT NULL,
    currency VARCHAR(16) DEFAULT 'INR',
    status VARCHAR(32) DEFAULT 'success',
    provider VARCHAR(64) DEFAULT 'Razorpay/Stripe',
    reference VARCHAR(128) UNIQUE NOT NULL,
    coupon_used VARCHAR(64),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ix_payment_records_user_id ON payment_records(user_id);

-- 17. Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(64) UNIQUE NOT NULL,
    discount_type VARCHAR(32) DEFAULT 'percentage',
    value REAL NOT NULL,
    max_discount REAL DEFAULT 1000.0,
    usage_limit INTEGER DEFAULT 100,
    used_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    description VARCHAR(256),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ix_coupons_code ON coupons(code);

-- 18. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    admin_id VARCHAR(64) NOT NULL,
    action VARCHAR(128) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64),
    details TEXT,
    timestamp TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 19. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(256) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(32) DEFAULT 'info',
    target_rule VARCHAR(64) DEFAULT 'all',
    is_active BOOLEAN DEFAULT TRUE,
    published_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 20. System Settings Table
CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(64) PRIMARY KEY,
    value TEXT NOT NULL,
    category VARCHAR(32) DEFAULT 'general',
    description VARCHAR(255),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ix_system_settings_key ON system_settings(key);
