-- Script pour insérer des cours assignés de test
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Vérifier d'abord s'il y a des cours assignés
SELECT COUNT(*) as nombre_cours_assignes FROM course_assignments;

-- 2. Si la table est vide, insérer des cours assignés de test
-- Remplacez les emails par les vrais emails des enseignants de votre base

-- Exemple d'insertion de cours assignés
INSERT INTO course_assignments (teacher_email, course_name, is_active) 
VALUES 
    ('icholadaniel13@gmail.com', '01 S3 Collaboration interdisciplinaire dans l''EFTP', true),
    ('icholadaniel13@gmail.com', '02 S3 Projet transverseaux dans l''EFTP', true),
    ('gnonlonfoun@ensetmasters.org', '03 S3 Conception et mise en oeuvre de projet de recherche action', true),
    ('gnonlonfoun@ensetmasters.org', '04 S3 Amélioration des pratiques pédagogiques dans les etablissements d''EFTP', true),
    ('icholadaniel13@gmail.com', '05 S3 Appropriation des programmes d''études', true),
    ('gnonlonfoun@ensetmasters.org', '06 S3 Evaluation des programmes d''etude', true),
    ('icholadaniel13@gmail.com', '07 - 08 S3 Conception et redaction des curricula dans l''EFTP', true),
    ('gnonlonfoun@ensetmasters.org', '09 S3 Tice et innovation pédagogique en EFTP', true),
    ('icholadaniel13@gmail.com', '10 S3 Anglais scientifique', true),
    ('gnonlonfoun@ensetmasters.org', '11 S3 Montage d''évènement scientifique et culturels', true)
ON CONFLICT (teacher_email, course_name) DO NOTHING;

-- 3. Vérifier que les insertions ont fonctionné
SELECT 
    id,
    teacher_email,
    course_name,
    created_at,
    is_active
FROM course_assignments 
ORDER BY created_at DESC;

-- 4. Compter les cours assignés par enseignant
SELECT 
    teacher_email,
    COUNT(*) as nombre_cours,
    STRING_AGG(course_name, ', ') as cours_assignes
FROM course_assignments 
GROUP BY teacher_email
ORDER BY nombre_cours DESC; 