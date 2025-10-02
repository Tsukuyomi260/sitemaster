-- Script pour assigner les cours manquants aux enseignants

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

-- 2. Voir les cours non assignés
SELECT 
  'Cours non assignés' as info,
  id,
  title,
  course,
  points
FROM assignments 
WHERE course NOT IN (
  SELECT DISTINCT course_name 
  FROM course_assignments 
  WHERE is_active = true
)
ORDER BY course;

-- 3. Assigner les cours manquants aux enseignants
-- Remplacez 'email_enseignant@example.com' par l'email d'un vrai enseignant

INSERT INTO course_assignments (teacher_email, course_name, is_active) VALUES
-- Assigner "02 S3 Projet transverseaux dans l'EFTP"
('email_enseignant1@example.com', '02 S3 Projet transverseaux dans l''EFTP', true),

-- Assigner "03 S3 Conception et mise en oeuvre de projet de recherche action"  
('email_enseignant2@example.com', '03 S3 Conception et mise en oeuvre de projet de recherche action', true);

-- 4. Vérifier les assignations après insertion
SELECT 
  'Assignations après correction' as info,
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