-- Script pour assigner les cours aux enseignants de manière flexible

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

-- 2. Voir les cours disponibles (semestre 3 pour MRTDDEFTP)
SELECT 
  'Cours disponibles (Semestre 3)' as info,
  id,
  title,
  course,
  points
FROM assignments
WHERE course LIKE '%S3%'
ORDER BY course;

-- 3. Voir les assignations actuelles
SELECT 
  'Assignations actuelles' as info,
  ca.teacher_email,
  ca.course_name,
  ca.is_active,
  COUNT(s.id) as soumissions_count
FROM course_assignments ca
LEFT JOIN assignments a ON ca.course_name = a.course
LEFT JOIN assignment_submissions s ON a.id = s.assignment_id
WHERE ca.is_active = true
GROUP BY ca.teacher_email, ca.course_name, ca.is_active
ORDER BY ca.teacher_email, ca.course_name;

-- 4. Assigner des cours spécifiques à des enseignants spécifiques
-- Remplacez les emails par de vrais emails d'enseignants

-- Exemple 1: Assigner tous les cours du semestre 3 à un enseignant principal
INSERT INTO course_assignments (teacher_email, course_name, is_active) 
SELECT 
  'prof_principal@example.com' as teacher_email,  -- Remplacez par l'email d'un vrai enseignant
  a.course as course_name,
  true as is_active
FROM assignments a
WHERE a.course LIKE '%S3%'
AND a.course NOT IN (
  SELECT DISTINCT course_name 
  FROM course_assignments 
  WHERE is_active = true
)
ON CONFLICT (teacher_email, course_name) DO NOTHING;

-- Exemple 2: Assigner des cours spécifiques à différents enseignants
-- Décommentez et modifiez selon vos besoins

/*
INSERT INTO course_assignments (teacher_email, course_name, is_active) VALUES
-- Enseignant 1
('prof1@example.com', '01 S3 Collaboration interdisciplinaire dans l''EFTP', true),
('prof1@example.com', '02 S3 Projet transverseaux dans l''EFTP', true),
('prof1@example.com', '03 S3 Conception et mise en oeuvre de projet de recherche action', true),

-- Enseignant 2
('prof2@example.com', '04 S3 Amélioration des pratiques pédagogiques dans les etablissements d''EFTP', true),
('prof2@example.com', '05 S3 Appropriation des programmes d''études', true),
('prof2@example.com', '06 S3 Evaluation des programmes d''etude', true),

-- Enseignant 3
('prof3@example.com', '07 - 08 S3 Conception et redaction des curricula dans l''EFTP', true),
('prof3@example.com', '09 S3 Tice et innovation pédagogique en EFTP', true),
('prof3@example.com', '10 S3 Anglais scientifique', true),
('prof3@example.com', '11 S3 Montage d''évènement scientifique et culturels', true)
ON CONFLICT (teacher_email, course_name) DO NOTHING;
*/

-- 5. Vérifier le résultat final
SELECT 
  'Résultat final des assignations' as info,
  ca.teacher_email,
  ca.course_name,
  ca.is_active,
  COUNT(s.id) as soumissions_count
FROM course_assignments ca
LEFT JOIN assignments a ON ca.course_name = a.course
LEFT JOIN assignment_submissions s ON a.id = s.assignment_id
WHERE ca.is_active = true
GROUP BY ca.teacher_email, ca.course_name, ca.is_active
ORDER BY ca.teacher_email, ca.course_name;

-- 6. Statistiques finales
SELECT 
  'Statistiques finales' as info,
  COUNT(DISTINCT ca.teacher_email) as enseignants_avec_cours,
  COUNT(ca.course_name) as total_cours_assignes,
  COUNT(s.id) as total_soumissions
FROM course_assignments ca
LEFT JOIN assignments a ON ca.course_name = a.course
LEFT JOIN assignment_submissions s ON a.id = s.assignment_id
WHERE ca.is_active = true; 