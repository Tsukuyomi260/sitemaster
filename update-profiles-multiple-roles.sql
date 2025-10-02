-- Script pour permettre les rôles multiples
-- Étape 1: Ajouter une colonne pour les rôles multiples
ALTER TABLE profiles ADD COLUMN roles TEXT[] DEFAULT ARRAY['student'];

-- Étape 2: Mettre à jour les utilisateurs existants pour avoir leurs rôles actuels
UPDATE profiles SET roles = ARRAY[role] WHERE roles IS NULL;

-- Étape 3: Ajouter les rôles admin aux enseignants spécifiés
UPDATE profiles 
SET roles = ARRAY['teacher', 'admin'], updated_at = NOW()
WHERE email = 'gnonlonfoun@ensetmasters.org';

UPDATE profiles 
SET roles = ARRAY['teacher', 'admin'], updated_at = NOW()
WHERE email = 'icholadaniel13@gmail.com';

-- Étape 4: Vérifier les modifications
SELECT email, roles FROM profiles WHERE email IN ('gnonlonfoun@ensetmasters.org', 'icholadaniel13@gmail.com'); 