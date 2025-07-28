-- Script de diagnostic pour les soumissions non visibles par les enseignants

-- 1. Vérifier les soumissions existantes
SELECT 
  'Soumissions existantes' as info,
  COUNT(*) as count
FROM assignment_submissions;

-- 2. Voir les détails des soumissions avec les devoirs
SELECT 
  'Détails des soumissions' as info,
  s.id,
  s.student_id,
  s.submission_title,
  s.submitted_at,
  a.title as assignment_title,
  a.course as assignment_course
FROM assignment_submissions s
LEFT JOIN assignments a ON s.assignment_id = a.id
ORDER BY s.submitted_at DESC;

-- 3. Vérifier les cours assignés aux enseignants
SELECT 
  'Cours assignés aux enseignants' as info,
  ca.id,
  ca.teacher_email,
  ca.course_name,
  ca.is_active
FROM course_assignments ca
WHERE ca.is_active = true;

-- 4. Vérifier les devoirs disponibles
SELECT 
  'Devoirs disponibles' as info,
  id,
  title,
  course,
  points
FROM assignments
ORDER BY course;

-- 5. Croiser les données : soumissions vs cours assignés
SELECT 
  'Soumissions par cours assigné' as info,
  ca.teacher_email,
  ca.course_name,
  COUNT(s.id) as soumissions_count
FROM course_assignments ca
LEFT JOIN assignments a ON ca.course_name = a.course
LEFT JOIN assignment_submissions s ON a.id = s.assignment_id
WHERE ca.is_active = true
GROUP BY ca.teacher_email, ca.course_name
ORDER BY ca.teacher_email, ca.course_name;

-- 6. Vérifier si les cours des devoirs correspondent aux cours assignés
SELECT 
  'Cours des devoirs vs cours assignés' as info,
  a.course as devoir_course,
  CASE 
    WHEN ca.course_name IS NOT NULL THEN 'ASSIGNÉ'
    ELSE 'NON ASSIGNÉ'
  END as statut_assignment
FROM assignments a
LEFT JOIN course_assignments ca ON a.course = ca.course_name AND ca.is_active = true
ORDER BY a.course; 