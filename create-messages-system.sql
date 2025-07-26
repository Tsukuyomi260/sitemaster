-- Table pour les messages des enseignants
CREATE TABLE IF NOT EXISTS teacher_messages (
  id SERIAL PRIMARY KEY,
  teacher_email VARCHAR(255) NOT NULL,
  course_name VARCHAR(500) NOT NULL,
  message_title VARCHAR(255) NOT NULL,
  message_content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Table pour les notifications des étudiants
CREATE TABLE IF NOT EXISTS student_notifications (
  id SERIAL PRIMARY KEY,
  student_email VARCHAR(255) NOT NULL,
  message_id INTEGER REFERENCES teacher_messages(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour suivre les téléchargements de cours par les étudiants
CREATE TABLE IF NOT EXISTS course_downloads (
  id SERIAL PRIMARY KEY,
  student_email VARCHAR(255) NOT NULL,
  course_name VARCHAR(500) NOT NULL,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_email, course_name)
);

-- Index pour améliorer les performances
CREATE INDEX idx_teacher_messages_course ON teacher_messages(course_name);
CREATE INDEX idx_student_notifications_student ON student_notifications(student_email);
CREATE INDEX idx_student_notifications_read ON student_notifications(is_read);
CREATE INDEX idx_course_downloads_student ON course_downloads(student_email);
CREATE INDEX idx_course_downloads_course ON course_downloads(course_name); 