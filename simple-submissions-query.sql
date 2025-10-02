-- Requête simple pour tester les soumissions

-- 1. Voir toutes les soumissions
SELECT 
  'Toutes les soumissions' as info,
  id,
  assignment_id,
  student_id,
  submission_title,
  submitted_at
FROM assignment_submissions
ORDER BY submitted_at DESC;

-- 2. Voir tous les devoirs
SELECT 
  'Tous les devoirs' as info,
  id,
  title,
  course,
  points
FROM assignments
WHERE course LIKE '%S3%'
ORDER BY course;

-- 3. Requête manuelle pour voir les soumissions avec les détails des devoirs
SELECT 
  'Soumissions avec détails des devoirs' as info,
  s.id as submission_id,
  s.student_id,
  s.submission_title,
  s.submitted_at,
  a.id as assignment_id,
  a.title as assignment_title,
  a.course as assignment_course
FROM assignment_submissions s
JOIN assignments a ON s.assignment_id = a.id
WHERE a.course = '01 S3 Collaboration interdisciplinaire dans l''EFTP'
ORDER BY s.submitted_at DESC; 