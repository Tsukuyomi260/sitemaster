-- Script pour mettre à jour le rôle d'un utilisateur
-- Remplace 'ton-email@example.com' par ton vrai email

-- Option 1: Mettre à jour via l'email
UPDATE profiles 
SET role = 'student' 
WHERE email = 'ton-email@example.com';

-- Option 2: Mettre à jour via l'ID utilisateur (si tu connais l'ID)
-- UPDATE profiles 
-- SET role = 'student' 
-- WHERE id = 'ton-user-id';

-- Option 3: Insérer un profil si il n'existe pas
INSERT INTO profiles (id, email, role)
SELECT id, email, 'student'
FROM auth.users 
WHERE email = 'ton-email@example.com'
ON CONFLICT (id) DO UPDATE SET role = 'student';

-- Vérifier le résultat
SELECT id, email, role FROM profiles WHERE email = 'ton-email@example.com'; 