-- Script pour vérifier les cours assignés
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Vérifier si la table course_assignments existe
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'course_assignments';

-- 2. Vérifier la structure de la table course_assignments
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'course_assignments'
ORDER BY ordinal_position;

-- 3. Voir tous les cours assignés
SELECT 
    id,
    teacher_email,
    course_name,
    is_active
FROM course_assignments 
ORDER BY id DESC;

-- 4. Compter les cours assignés
SELECT 
    COUNT(*) as total_cours_assignes
FROM course_assignments;

-- 5. Voir les cours assignés par enseignant
SELECT 
    teacher_email,
    COUNT(*) as nombre_cours,
    STRING_AGG(course_name, ', ') as cours_assignes
FROM course_assignments 
GROUP BY teacher_email
ORDER BY nombre_cours DESC;

-- 6. Vérifier les politiques RLS sur course_assignments
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'course_assignments';

-- 7. Voir les permissions sur la table
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'course_assignments';

-- 8. Voir les enseignants disponibles
SELECT 
    id,
    email,
    role
FROM profiles 
WHERE role = 'teacher'
ORDER BY email; 