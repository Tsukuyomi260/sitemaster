-- Script de diagnostic pour le système de blocage
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Vérifier si la table profiles existe
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'profiles';

-- 2. Vérifier la structure de la table profiles
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 3. Vérifier si la colonne blocked existe
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'blocked';

-- 4. Voir les données actuelles dans profiles
SELECT 
    id,
    email,
    role,
    blocked,
    created_at
FROM profiles 
LIMIT 10;

-- 5. Compter les utilisateurs par statut de blocage
SELECT 
    CASE 
        WHEN blocked = TRUE THEN 'Bloqués'
        WHEN blocked = FALSE THEN 'Actifs'
        WHEN blocked IS NULL THEN 'Non défini'
        ELSE 'Autre'
    END as statut,
    COUNT(*) as nombre
FROM profiles 
GROUP BY blocked;

-- 6. Vérifier les politiques RLS sur la table profiles
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- 7. Vérifier les permissions sur la table profiles
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'profiles'; 