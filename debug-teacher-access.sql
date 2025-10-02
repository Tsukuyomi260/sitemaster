-- Diagnostic complet pour les enseignants qui ne voient pas les soumissions

-- 1. Vérifier les enseignants connectés
SELECT 
  'Enseignants dans la base' as info,
  email,
  role,
  email_confirmed_at
FROM auth.users 
WHERE role = 'teacher' 
ORDER BY email;

-- 2. Vérifier les assignations de cours
SELECT 
  'Assignations de cours' as info,
  ca.teacher_email,
  ca.course_name,
  ca.is_active
FROM course_assignments ca
WHERE ca.is_active = true
ORDER BY ca.teacher_email, ca.course_name;

-- 3. Vérifier les devoirs existants
SELECT 
  'Devoirs existants' as info,
  id,
  title,
  course,
  is_active
FROM assignments
WHERE course LIKE '%S3%'
ORDER BY course;

-- 4. Vérifier les soumissions existantes
SELECT 
  'Soumissions existantes' as info,
  s.id,
  s.student_id,
  s.submission_title,
  s.submitted_at,
  a.title as assignment_title,
  a.course as assignment_course
FROM assignment_submissions s
LEFT JOIN assignments a ON s.assignment_id = a.id
ORDER BY s.submitted_at DESC;

-- 5. Croiser les données : soumissions vs cours assignés
SELECT 
  'Soumissions par enseignant' as info,
  ca.teacher_email,
  ca.course_name,
  COUNT(s.id) as soumissions_count
FROM course_assignments ca
LEFT JOIN assignments a ON ca.course_name = a.course
LEFT JOIN assignment_submissions s ON a.id = s.assignment_id
WHERE ca.is_active = true
GROUP BY ca.teacher_email, ca.course_name
ORDER BY ca.teacher_email, ca.course_name;

-- 6. Vérifier spécifiquement pour les enseignants connectés
SELECT 
  'Test pour icholadaniel13@gmail.com' as info,
  ca.teacher_email,
  ca.course_name,
  ca.is_active,
  COUNT(s.id) as soumissions_count
FROM course_assignments ca
LEFT JOIN assignments a ON ca.course_name = a.course
LEFT JOIN assignment_submissions s ON a.id = s.assignment_id
WHERE ca.teacher_email = 'icholadaniel13@gmail.com'
AND ca.is_active = true
GROUP BY ca.teacher_email, ca.course_name, ca.is_active;

SELECT 
  'Test pour gnonlonfoun@ensetmasters.org' as info,
  ca.teacher_email,
  ca.course_name,
  ca.is_active,
  COUNT(s.id) as soumissions_count
FROM course_assignments ca
LEFT JOIN assignments a ON ca.course_name = a.course
LEFT JOIN assignment_submissions s ON a.id = s.assignment_id
WHERE ca.teacher_email = 'gnonlonfoun@ensetmasters.org'
AND ca.is_active = true
GROUP BY ca.teacher_email, ca.course_name, ca.is_active; 