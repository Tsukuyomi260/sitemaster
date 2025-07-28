-- Script pour diagnostiquer et corriger l'accès aux soumissions pour les enseignants

-- 1. Voir les cours actuellement assignés aux enseignants
SELECT 
  'Cours actuellement assignés' as info,
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

-- 2. Voir les soumissions existantes avec leurs cours
SELECT 
  'Soumissions existantes' as info,
  s.id,
  s.student_id,
  s.submission_title,
  s.submitted_at,
  a.title as assignment_title,
  a.course as assignment_course,
  CASE 
    WHEN ca.course_name IS NOT NULL THEN 'ASSIGNÉ À: ' || ca.teacher_email
    ELSE 'NON ASSIGNÉ'
  END as statut_assignment
FROM assignment_submissions s
LEFT JOIN assignments a ON s.assignment_id = a.id
LEFT JOIN course_assignments ca ON a.course = ca.course_name AND ca.is_active = true
ORDER BY s.submitted_at DESC;

-- 3. Voir les cours du semestre 3 (cours des étudiants MRTDDEFTP)
SELECT 
  'Cours du semestre 3 (étudiants MRTDDEFTP)' as info,
  id,
  title,
  course,
  points
FROM assignments
WHERE course LIKE '%S3%'
ORDER BY course;

-- 4. Voir les enseignants disponibles
SELECT 
  'Enseignants disponibles' as info,
  email,
  role,
  created_at
FROM auth.users 
WHERE role = 'teacher' 
AND email_confirmed_at IS NOT NULL
ORDER BY created_at;

-- 5. Assigner les cours du semestre 3 à un enseignant (si pas déjà assigné)
-- Remplacez 'prof@example.com' par l'email d'un vrai enseignant
INSERT INTO course_assignments (teacher_email, course_name, is_active) 
SELECT 
  'prof@example.com' as teacher_email,
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

-- 6. Vérifier le résultat après assignation
SELECT 
  'Résultat après assignation' as info,
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