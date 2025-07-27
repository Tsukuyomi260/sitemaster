-- Création de la table assignments (devoirs)
CREATE TABLE IF NOT EXISTS assignments (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  course VARCHAR(500) NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  points INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Création d'index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_assignments_course ON assignments(course);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date);

-- Ajout de commentaires pour documenter la table
COMMENT ON TABLE assignments IS 'Table pour stocker les devoirs assignés aux étudiants';
COMMENT ON COLUMN assignments.title IS 'Titre du devoir';
COMMENT ON COLUMN assignments.course IS 'Nom du cours auquel le devoir est assigné';
COMMENT ON COLUMN assignments.description IS 'Description détaillée du devoir';
COMMENT ON COLUMN assignments.due_date IS 'Date limite de soumission';
COMMENT ON COLUMN assignments.points IS 'Points maximum pour ce devoir';

-- Insérer quelques devoirs d'exemple pour les cours existants
INSERT INTO assignments (title, course, description, due_date, points) VALUES
('Devoir 1 - Collaboration interdisciplinaire', '01 S3 Collaboration interdisciplinaire dans l''EFTP', 'Analyse des pratiques de collaboration dans l''EFTP', '2024-12-31 23:59:00+00', 100),
('Projet de recherche - Méthodologie', '02 S3 Méthodologie de recherche en EFTP', 'Élaboration d''un projet de recherche en EFTP', '2024-12-31 23:59:00+00', 150),
('Évaluation des programmes - Rapport', '03 S3 Évaluation et certification en EFTP', 'Rapport d''évaluation d''un programme EFTP', '2024-12-31 23:59:00+00', 120); 