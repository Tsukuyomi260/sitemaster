-- Script pour assigner le cours 01 S3 aux deux enseignants spécifiés

-- 1. Vérifier que le cours existe
SELECT 
  'Vérification du cours 01 S3' as info,
  id,
  title,
  course,
  points
FROM assignments
WHERE course = '01 S3 Collaboration interdisciplinaire dans l''EFTP';

-- 2. Assigner le cours aux deux enseignants
INSERT INTO course_assignments (teacher_email, course_name, is_active) VALUES
('icholadaniel13@gmail.com', '01 S3 Collaboration interdisciplinaire dans l''EFTP', true),
('gnonlonfoun@ensetmasters.org', '01 S3 Collaboration interdisciplinaire dans l''EFTP', true)
ON CONFLICT (teacher_email, course_name) DO NOTHING;

-- 3. Vérifier les assignations
SELECT 
  'Assignations du cours 01 S3' as info,
  ca.teacher_email,
  ca.course_name,
  ca.is_active
FROM course_assignments ca
WHERE ca.course_name = '01 S3 Collaboration interdisciplinaire dans l''EFTP'
AND ca.is_active = true
ORDER BY ca.teacher_email;

-- 4. Vérifier les soumissions pour ce cours
SELECT 
  'Soumissions pour le cours 01 S3' as info,
  s.id,
  s.student_id,
  s.submission_title,
  s.submitted_at,
  a.title as assignment_title
FROM assignment_submissions s
LEFT JOIN assignments a ON s.assignment_id = a.id
WHERE a.course = '01 S3 Collaboration interdisciplinaire dans l''EFTP'
ORDER BY s.submitted_at DESC;

-- 5. Statistiques finales
SELECT 
  'Statistiques finales' as info,
  COUNT(DISTINCT ca.teacher_email) as enseignants_assignes,
  COUNT(s.id) as soumissions_count
FROM course_assignments ca
LEFT JOIN assignments a ON ca.course_name = a.course
LEFT JOIN assignment_submissions s ON a.id = s.assignment_id
WHERE ca.course_name = '01 S3 Collaboration interdisciplinaire dans l''EFTP'
AND ca.is_active = true; 