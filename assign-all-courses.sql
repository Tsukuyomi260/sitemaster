-- Script pour assigner tous les cours aux enseignants

-- 1. Voir les enseignants disponibles
SELECT 
  'Enseignants disponibles' as info,
  email,
  role,
  created_at
FROM auth.users 
WHERE role = 'teacher' 
AND email_confirmed_at IS NOT NULL
ORDER BY created_at;

-- 2. Assigner tous les cours à un enseignant (remplacez l'email)
-- Exemple avec un enseignant fictif - remplacez par un vrai email
INSERT INTO course_assignments (teacher_email, course_name, is_active) VALUES
-- Semestre 1
('prof@example.com', '01 S1 PSYCHOPEDAGOGIE DE L''ENFANT ET DE L''ADOLESCENT', true),
('prof@example.com', '02 S1 PSYCHOLOGIE DE L''APPRENTISSAGE', true),
('prof@example.com', '03 S1 Administration des etablissements eftp et gpec en eftp', true),
('prof@example.com', '04 S1 Etude des Textes Fondamentaux de l''EFTP', true),
('prof@example.com', '05 S1 GEOGRAPHIE DE L''EFTP', true),
('prof@example.com', '06 S1 Analyse, Conception et Réalisation de Manuels Pédagogiques pour l''EFTP', true),
('prof@example.com', '07 S1 Théorie didactique', true),
('prof@example.com', '08 S1 Fondements de la Didactique des Disciplines de l''EFTP', true),
('prof@example.com', '09 S1 Anglais Technique', true),
('prof@example.com', '10 S1 Communication scientifique en anglais', true),
('prof@example.com', '11 S1 Projet apprenant', true),

-- Semestre 2
('prof@example.com', '01 S2 Délinquance Juvénile', true),
('prof@example.com', '02 S2 Epistomologie et science de l''education et de la formation', true),
('prof@example.com', '03 S2 Gestion de classes en situation formelle dans l''EFTP', true),
('prof@example.com', '04 S2 Gestion de classes de contexte de formation professionnelle', true),
('prof@example.com', '05 S2 Didactique de la matière en EFTP', true),
('prof@example.com', '06 S2 Docimologie', true),
('prof@example.com', '07 - 08 S2 Pedagogie et Andragogie', true),
('prof@example.com', '09 S2 Sociologie de l''Education et Réalité de l''EFTP', true),
('prof@example.com', '10 S2 Education des apprenants à besoin spécifiques', true),
('prof@example.com', '11 S2 Ethique et déontologie de la profession enseignante', true),
('prof@example.com', '12 S2 Enseignement et formation en entreprise', true),

-- Semestre 3
('prof@example.com', '01 S3 Collaboration interdisciplinaire dans l''EFTP', true),
('prof@example.com', '02 S3 Projet transverseaux dans l''EFTP', true),
('prof@example.com', '03 S3 Conception et mise en oeuvre de projet de recherche action', true),
('prof@example.com', '04 S3 Amélioration des pratiques pédagogiques dans les etablissements d''EFTP', true),
('prof@example.com', '05 S3 Appropriation des programmes d''études', true),
('prof@example.com', '06 S3 Evaluation des programmes d''etude', true),
('prof@example.com', '07 - 08 S3 Conception et redaction des curricula dans l''EFTP', true),
('prof@example.com', '09 S3 Tice et innovation pédagogique en EFTP', true),
('prof@example.com', '10 S3 Anglais scientifique', true),
('prof@example.com', '11 S3 Montage d''évènement scientifique et culturels', true);

-- 3. Vérifier le résultat
SELECT 
  'Résultat final' as info,
  COUNT(*) as total_cours_assignes
FROM course_assignments
WHERE is_active = true;

SELECT 
  'Détail des assignations' as info,
  teacher_email,
  course_name,
  is_active
FROM course_assignments
WHERE is_active = true
ORDER BY course_name; 