-- Script pour tester le blocage d'un utilisateur
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Voir les étudiants actuels et leur statut de blocage
SELECT 
    id,
    matricule,
    nom_complet,
    email,
    blocked,
    created_at
FROM students 
ORDER BY created_at DESC;

-- 2. Bloquer un étudiant spécifique (remplacez EMAIL par l'email de l'étudiant)
-- UPDATE students SET blocked = TRUE WHERE email = 'EMAIL_DE_L_ETUDIANT';

-- 3. Exemple : Bloquer l'étudiant avec l'email 2324-9@mrtddeftp.bj
-- UPDATE students SET blocked = TRUE WHERE email = '2324-9@mrtddeftp.bj';

-- 4. Vérifier que l'étudiant est bien bloqué
SELECT 
    id,
    matricule,
    nom_complet,
    email,
    blocked,
    CASE 
        WHEN blocked = TRUE THEN 'BLOQUÉ'
        WHEN blocked = FALSE THEN 'ACTIF'
        ELSE 'NON DÉFINI'
    END as statut
FROM students 
WHERE email = '2324-9@mrtddeftp.bj';

-- 5. Débloquer un étudiant (remplacez EMAIL par l'email de l'étudiant)
-- UPDATE students SET blocked = FALSE WHERE email = 'EMAIL_DE_L_ETUDIANT';

-- 6. Voir tous les étudiants bloqués
SELECT 
    id,
    matricule,
    nom_complet,
    email,
    blocked,
    created_at
FROM students 
WHERE blocked = TRUE;

-- 7. Voir tous les étudiants actifs
SELECT 
    id,
    matricule,
    nom_complet,
    email,
    blocked,
    created_at
FROM students 
WHERE blocked = FALSE OR blocked IS NULL;

-- 8. Compter les étudiants par statut
SELECT 
    CASE 
        WHEN blocked = TRUE THEN 'Bloqués'
        WHEN blocked = FALSE THEN 'Actifs'
        ELSE 'Non défini'
    END as statut,
    COUNT(*) as nombre
FROM students 
GROUP BY blocked; 