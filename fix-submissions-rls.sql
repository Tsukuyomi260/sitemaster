-- Script pour corriger les politiques RLS sur assignment_submissions
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Vérifier les politiques RLS actuelles
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'assignment_submissions';

-- 2. Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "Students can view their own submissions" ON assignment_submissions;
DROP POLICY IF EXISTS "Students can insert their own submissions" ON assignment_submissions;
DROP POLICY IF EXISTS "Teachers can view submissions for their courses" ON assignment_submissions;
DROP POLICY IF EXISTS "Admins can view all submissions" ON assignment_submissions;
DROP POLICY IF EXISTS "Enable read access for all users" ON assignment_submissions;

-- 3. Créer une politique simple pour permettre l'accès à tous les utilisateurs authentifiés
CREATE POLICY "Enable read access for all authenticated users" ON assignment_submissions
    FOR SELECT USING (auth.role() = 'authenticated');

-- 4. Créer une politique pour permettre l'insertion par les étudiants
CREATE POLICY "Students can insert their own submissions" ON assignment_submissions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 5. Créer une politique pour permettre la mise à jour par les étudiants
CREATE POLICY "Students can update their own submissions" ON assignment_submissions
    FOR UPDATE USING (auth.role() = 'authenticated');

-- 6. Vérifier que RLS est activé
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;

-- 7. Vérifier les nouvelles politiques
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'assignment_submissions';

-- 8. Test d'accès aux soumissions
SELECT COUNT(*) as nombre_soumissions FROM assignment_submissions;

-- 9. Test d'accès avec les détails
SELECT 
    asub.id,
    asub.assignment_id,
    asub.student_id,
    asub.file_name,
    asub.submitted_at,
    a.title as devoir_titre,
    a.course as cours,
    s.nom_complet,
    s.matricule
FROM assignment_submissions asub
LEFT JOIN assignments a ON asub.assignment_id = a.id
LEFT JOIN students s ON asub.student_id = s.id
ORDER BY asub.submitted_at DESC
LIMIT 5; 