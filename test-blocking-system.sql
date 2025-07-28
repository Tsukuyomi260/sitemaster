-- Script de test pour le système de blocage
-- Ce script permet de tester le blocage/déblocage des utilisateurs

-- 1. Vérifier que la colonne blocked existe
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'blocked';

-- 2. Voir les utilisateurs actuels et leur statut de blocage
SELECT 
    id,
    email,
    role,
    blocked,
    created_at
FROM profiles 
ORDER BY created_at DESC;

-- 3. Exemple de blocage d'un utilisateur (remplacer USER_ID par l'ID réel)
-- UPDATE profiles SET blocked = TRUE WHERE id = 'USER_ID';

-- 4. Exemple de déblocage d'un utilisateur (remplacer USER_ID par l'ID réel)
-- UPDATE profiles SET blocked = FALSE WHERE id = 'USER_ID';

-- 5. Voir les utilisateurs bloqués
SELECT 
    id,
    email,
    role,
    blocked,
    created_at
FROM profiles 
WHERE blocked = TRUE;

-- 6. Voir les utilisateurs actifs
SELECT 
    id,
    email,
    role,
    blocked,
    created_at
FROM profiles 
WHERE blocked = FALSE OR blocked IS NULL;

-- 7. Compter les utilisateurs par statut
SELECT 
    CASE 
        WHEN blocked = TRUE THEN 'Bloqués'
        WHEN blocked = FALSE THEN 'Actifs'
        ELSE 'Non défini'
    END as statut,
    COUNT(*) as nombre
FROM profiles 
GROUP BY blocked;

-- 8. Vérifier les politiques RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles'; 