CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS announcements_created_at_idx
  ON announcements (created_at DESC);

CREATE TABLE IF NOT EXISTS community_posts (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  author_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS community_posts_created_at_idx
  ON community_posts (created_at DESC);

CREATE TABLE IF NOT EXISTS skills (
  id TEXT PRIMARY KEY,
  cat TEXT NOT NULL,
  tag TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  provider TEXT NOT NULL,
  video_id TEXT NOT NULL,
  steps TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS skills_created_at_idx
  ON skills (created_at ASC);

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  options TEXT[] NOT NULL,
  answer INTEGER NOT NULL,
  explanation TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS quiz_questions_created_at_idx
  ON quiz_questions (created_at ASC);

CREATE TABLE IF NOT EXISTS quiz_submissions (
  id TEXT PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  correct_count INTEGER NOT NULL,
  total_count INTEGER NOT NULL,
  score INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS quiz_submissions_created_at_idx
  ON quiz_submissions (created_at DESC);

CREATE TABLE IF NOT EXISTS quiz_answers (
  id TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  question_text TEXT NOT NULL,
  selected_index INTEGER,
  is_correct BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS quiz_answers_question_id_idx
  ON quiz_answers (question_id);

CREATE INDEX IF NOT EXISTS quiz_answers_submission_id_idx
  ON quiz_answers (submission_id);

CREATE TABLE IF NOT EXISTS visit_cases (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  patient_info TEXT NOT NULL,
  assessment TEXT NOT NULL,
  omaha_diagnosis TEXT NOT NULL,
  interventions TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS visit_cases_created_at_idx
  ON visit_cases (created_at ASC);

CREATE TABLE IF NOT EXISTS ai_tutor_logs (
  id TEXT PRIMARY KEY,
  message TEXT NOT NULL,
  answer TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS ai_tutor_logs_created_at_idx
  ON ai_tutor_logs (created_at DESC);

CREATE TABLE IF NOT EXISTS professor_questions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  student_id TEXT NOT NULL,
  question TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS professor_questions_created_at_idx
  ON professor_questions (created_at DESC);

CREATE TABLE IF NOT EXISTS page_views (
  id TEXT PRIMARY KEY,
  path TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS page_views_created_at_idx
  ON page_views (created_at DESC);
