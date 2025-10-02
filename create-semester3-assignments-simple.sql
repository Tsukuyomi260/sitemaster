-- Script simplifié pour créer les devoirs du semestre 3 (étudiants MRTDDEFTP)

-- 1. Vérifier les devoirs existants du semestre 3
SELECT 
  'Devoirs existants du semestre 3' as info,
  id,
  title,
  course,
  points
FROM assignments
WHERE course LIKE '%S3%'
ORDER BY course;

-- 2. Ajouter les devoirs du semestre 3 un par un (évite les problèmes de type)
-- Devoir 1
INSERT INTO assignments (title, course, description, due_date, points, is_active) 
SELECT 'Devoir 1 - Collaboration interdisciplinaire', '01 S3 Collaboration interdisciplinaire dans l''EFTP', 'Projet de collaboration interdisciplinaire en EFTP', '2024-12-31 23:59:00+00'::timestamp with time zone, 100, true
WHERE NOT EXISTS (SELECT 1 FROM assignments WHERE course = '01 S3 Collaboration interdisciplinaire dans l''EFTP');

-- Devoir 2
INSERT INTO assignments (title, course, description, due_date, points, is_active) 
SELECT 'Devoir 2 - Projets transversaux', '02 S3 Projet transverseaux dans l''EFTP', 'Conception et mise en œuvre de projets transversaux', '2024-12-31 23:59:00+00'::timestamp with time zone, 100, true
WHERE NOT EXISTS (SELECT 1 FROM assignments WHERE course = '02 S3 Projet transverseaux dans l''EFTP');

-- Devoir 3
INSERT INTO assignments (title, course, description, due_date, points, is_active) 
SELECT 'Devoir 3 - Recherche action', '03 S3 Conception et mise en oeuvre de projet de recherche action', 'Projet de recherche-action en contexte EFTP', '2024-12-31 23:59:00+00'::timestamp with time zone, 100, true
WHERE NOT EXISTS (SELECT 1 FROM assignments WHERE course = '03 S3 Conception et mise en oeuvre de projet de recherche action');

-- Devoir 4
INSERT INTO assignments (title, course, description, due_date, points, is_active) 
SELECT 'Devoir 4 - Amélioration des pratiques', '04 S3 Amélioration des pratiques pédagogiques dans les etablissements d''EFTP', 'Plan d''amélioration des pratiques pédagogiques', '2024-12-31 23:59:00+00'::timestamp with time zone, 100, true
WHERE NOT EXISTS (SELECT 1 FROM assignments WHERE course = '04 S3 Amélioration des pratiques pédagogiques dans les etablissements d''EFTP');

-- Devoir 5
INSERT INTO assignments (title, course, description, due_date, points, is_active) 
SELECT 'Devoir 5 - Appropriation des programmes', '05 S3 Appropriation des programmes d''études', 'Analyse et appropriation des programmes d''études', '2024-12-31 23:59:00+00'::timestamp with time zone, 100, true
WHERE NOT EXISTS (SELECT 1 FROM assignments WHERE course = '05 S3 Appropriation des programmes d''études');

-- Devoir 6
INSERT INTO assignments (title, course, description, due_date, points, is_active) 
SELECT 'Devoir 6 - Évaluation des programmes', '06 S3 Evaluation des programmes d''etude', 'Méthodologie d''évaluation des programmes d''études', '2024-12-31 23:59:00+00'::timestamp with time zone, 100, true
WHERE NOT EXISTS (SELECT 1 FROM assignments WHERE course = '06 S3 Evaluation des programmes d''etude');

-- Devoir 7-8
INSERT INTO assignments (title, course, description, due_date, points, is_active) 
SELECT 'Devoir 7-8 - Conception des curricula', '07 - 08 S3 Conception et redaction des curricula dans l''EFTP', 'Conception et rédaction de curricula adaptés à l''EFTP', '2024-12-31 23:59:00+00'::timestamp with time zone, 100, true
WHERE NOT EXISTS (SELECT 1 FROM assignments WHERE course = '07 - 08 S3 Conception et redaction des curricula dans l''EFTP');

-- Devoir 9
INSERT INTO assignments (title, course, description, due_date, points, is_active) 
SELECT 'Devoir 9 - TICE et innovation', '09 S3 Tice et innovation pédagogique en EFTP', 'Intégration des TICE et innovations pédagogiques', '2024-12-31 23:59:00+00'::timestamp with time zone, 100, true
WHERE NOT EXISTS (SELECT 1 FROM assignments WHERE course = '09 S3 Tice et innovation pédagogique en EFTP');

-- Devoir 10
INSERT INTO assignments (title, course, description, due_date, points, is_active) 
SELECT 'Devoir 10 - Anglais scientifique', '10 S3 Anglais scientifique', 'Communication scientifique en anglais', '2024-12-31 23:59:00+00'::timestamp with time zone, 100, true
WHERE NOT EXISTS (SELECT 1 FROM assignments WHERE course = '10 S3 Anglais scientifique');

-- Devoir 11
INSERT INTO assignments (title, course, description, due_date, points, is_active) 
SELECT 'Devoir 11 - Montage d''événements', '11 S3 Montage d''évènement scientifique et culturels', 'Organisation d''événements scientifiques et culturels', '2024-12-31 23:59:00+00'::timestamp with time zone, 100, true
WHERE NOT EXISTS (SELECT 1 FROM assignments WHERE course = '11 S3 Montage d''évènement scientifique et culturels');

-- 3. Vérifier le résultat
SELECT 
  'Devoirs du semestre 3 après création' as info,
  id,
  title,
  course,
  points,
  is_active
FROM assignments
WHERE course LIKE '%S3%'
ORDER BY course; 