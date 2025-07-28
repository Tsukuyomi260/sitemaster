-- Diagnostic complet de tous les cours dans le système

-- 1. Tous les cours dans la table assignments
SELECT 
  'Tous les cours dans assignments' as info,
  COUNT(*) as total_cours
FROM assignments;

SELECT 
  'Détail des cours dans assignments' as info,
  id,
  title,
  course,
  points,
  due_date
FROM assignments
ORDER BY course;

-- 2. Tous les cours dans course_assignments
SELECT 
  'Tous les cours dans course_assignments' as info,
  COUNT(*) as total_assignations
FROM course_assignments;

SELECT 
  'Détail des cours dans course_assignments' as info,
  id,
  teacher_email,
  course_name,
  is_active,
  created_at
FROM course_assignments
ORDER BY course_name;

-- 3. Tous les cours dans le dossier public/cours (basé sur les fichiers PDF)
-- Note: Cette requête ne fonctionne pas directement, mais on peut voir les dossiers
SELECT 
  'Cours disponibles dans le système de fichiers' as info,
  'Vérifiez le dossier public/cours/' as instruction;

-- 4. Comparaison: cours dans assignments vs course_assignments
SELECT 
  'Cours dans assignments mais pas dans course_assignments' as info,
  a.course,
  a.title,
  'NON ASSIGNÉ' as statut
FROM assignments a
LEFT JOIN course_assignments ca ON a.course = ca.course_name AND ca.is_active = true
WHERE ca.course_name IS NULL
ORDER BY a.course;

SELECT 
  'Cours dans course_assignments mais pas dans assignments' as info,
  ca.course_name,
  'ASSIGNÉ MAIS PAS DE DEVOIR' as statut
FROM course_assignments ca
LEFT JOIN assignments a ON ca.course_name = a.course
WHERE a.course IS NULL AND ca.is_active = true
ORDER BY ca.course_name;

-- 5. Résumé complet
SELECT 
  'Résumé complet' as info,
  'assignments' as table_name,
  COUNT(*) as count
FROM assignments
UNION ALL
SELECT 
  'Résumé complet' as info,
  'course_assignments (actifs)' as table_name,
  COUNT(*) as count
FROM course_assignments
WHERE is_active = true
UNION ALL
SELECT 
  'Résumé complet' as info,
  'course_assignments (tous)' as table_name,
  COUNT(*) as count
FROM course_assignments;

-- 6. Soumissions par cours
SELECT 
  'Soumissions par cours' as info,
  a.course,
  a.title,
  COUNT(s.id) as soumissions_count
FROM assignments a
LEFT JOIN assignment_submissions s ON a.id = s.assignment_id
GROUP BY a.course, a.title
ORDER BY soumissions_count DESC, a.course; 