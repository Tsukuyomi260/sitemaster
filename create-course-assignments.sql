-- Créer la table des attributions de cours aux enseignants
CREATE TABLE IF NOT EXISTS course_assignments (
  id SERIAL PRIMARY KEY,
  teacher_email VARCHAR(255) NOT NULL,
  course_name VARCHAR(500) NOT NULL,
  course_file VARCHAR(500),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(teacher_email, course_name)
);

-- Insérer les attributions pour les deux enseignants
INSERT INTO course_assignments (teacher_email, course_name, course_file) VALUES
('gnonlonfoun@ensetmasters.org', '01 S3 Collaboration interdisciplinaire dans l''EFTP', '/cours/semestre3/01 S3 Collaboration interdisciplinaire dans l''EFTP.pdf'),
('icholadaniel13@gmail.com', '01 S3 Collaboration interdisciplinaire dans l''EFTP', '/cours/semestre3/01 S3 Collaboration interdisciplinaire dans l''EFTP.pdf');

-- Créer un index pour améliorer les performances
CREATE INDEX idx_course_assignments_teacher ON course_assignments(teacher_email);
CREATE INDEX idx_course_assignments_course ON course_assignments(course_name); 