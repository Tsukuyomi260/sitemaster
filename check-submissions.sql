-- Script pour vérifier les soumissions de devoirs
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Vérifier si la table assignment_submissions existe
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'assignment_submissions';

-- 2. Vérifier la structure de la table assignment_submissions
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'assignment_submissions'
ORDER BY ordinal_position;

-- 3. Voir toutes les soumissions
SELECT 
    id,
    assignment_id,
    student_id,
    file_url,
    file_name,
    submitted_at,
    comments,
    status
FROM assignment_submissions 
ORDER BY submitted_at DESC;

-- 4. Compter les soumissions
SELECT 
    COUNT(*) as total_soumissions
FROM assignment_submissions;

-- 5. Voir les soumissions avec les détails des devoirs
SELECT 
    asub.id,
    asub.assignment_id,
    asub.student_id,
    asub.file_name,
    asub.submitted_at,
    a.title as devoir_titre,
    a.course as cours
FROM assignment_submissions asub
LEFT JOIN assignments a ON asub.assignment_id = a.id
ORDER BY asub.submitted_at DESC;

-- 6. Voir les soumissions avec les détails des étudiants
SELECT 
    asub.id,
    asub.assignment_id,
    asub.student_id,
    asub.file_name,
    asub.submitted_at,
    s.nom_complet,
    s.matricule,
    s.email
FROM assignment_submissions asub
LEFT JOIN students s ON asub.student_id = s.id
ORDER BY asub.submitted_at DESC;

-- 7. Voir les soumissions complètes (devoirs + étudiants)
SELECT 
    asub.id,
    asub.assignment_id,
    asub.student_id,
    asub.file_name,
    asub.submitted_at,
    asub.comments,
    a.title as devoir_titre,
    a.course as cours,
    s.nom_complet,
    s.matricule,
    s.email
FROM assignment_submissions asub
LEFT JOIN assignments a ON asub.assignment_id = a.id
LEFT JOIN students s ON asub.student_id = s.id
ORDER BY asub.submitted_at DESC;

-- 8. Vérifier les politiques RLS sur assignment_submissions
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'assignment_submissions';

-- 9. Voir les permissions sur la table
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'assignment_submissions';

-- 10. Vérifier les relations entre les tables
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name='assignment_submissions'; 