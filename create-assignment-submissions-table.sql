-- Création de la table assignment_submissions
CREATE TABLE IF NOT EXISTS assignment_submissions (
  id SERIAL PRIMARY KEY,
  assignment_id INTEGER NOT NULL,
  student_id TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  submission_title TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  comments TEXT,
  status TEXT DEFAULT 'submitted',
  grade DECIMAL(5,2),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Création d'un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student_id ON assignment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment_id ON assignment_submissions(assignment_id);

-- Ajout de commentaires pour documenter la table
COMMENT ON TABLE assignment_submissions IS 'Table pour stocker les soumissions de devoirs des etudiants';
COMMENT ON COLUMN assignment_submissions.assignment_id IS 'ID du devoir assigne';
COMMENT ON COLUMN assignment_submissions.student_id IS 'ID de l etudiant qui a soumis';
COMMENT ON COLUMN assignment_submissions.file_url IS 'URL du fichier dans Supabase Storage';
COMMENT ON COLUMN assignment_submissions.file_name IS 'Nom original du fichier';
COMMENT ON COLUMN assignment_submissions.submission_title IS 'Titre du devoir saisi par l etudiant';
COMMENT ON COLUMN assignment_submissions.submitted_at IS 'Date et heure de soumission';
COMMENT ON COLUMN assignment_submissions.comments IS 'Commentaires optionnels de l etudiant';
COMMENT ON COLUMN assignment_submissions.status IS 'Statut: submitted, graded, etc.';
COMMENT ON COLUMN assignment_submissions.grade IS 'Note attribuee par l enseignant';
COMMENT ON COLUMN assignment_submissions.feedback IS 'Feedback de l enseignant'; 