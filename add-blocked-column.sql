-- Script pour ajouter la colonne blocked à la table profiles
-- Cette colonne permettra de bloquer/débloquer les utilisateurs

-- Vérifier si la colonne blocked existe déjà
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'blocked'
    ) THEN
        -- Ajouter la colonne blocked
        ALTER TABLE profiles ADD COLUMN blocked BOOLEAN DEFAULT FALSE;
        
        -- Ajouter un commentaire pour documenter la colonne
        COMMENT ON COLUMN profiles.blocked IS 'Indique si l''utilisateur est bloqué (true) ou actif (false)';
        
        RAISE NOTICE 'Colonne blocked ajoutée à la table profiles';
    ELSE
        RAISE NOTICE 'La colonne blocked existe déjà dans la table profiles';
    END IF;
END $$;

-- Créer un index pour optimiser les requêtes de blocage
CREATE INDEX IF NOT EXISTS idx_profiles_blocked ON profiles(blocked);

-- Mettre à jour les politiques RLS pour inclure la colonne blocked
-- Les utilisateurs bloqués ne peuvent pas accéder aux données
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (
        auth.uid() = id 
        AND (blocked IS NULL OR blocked = FALSE)
    );

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (
        auth.uid() = id 
        AND (blocked IS NULL OR blocked = FALSE)
    );

-- Politique pour les admins (peuvent voir et modifier tous les profils)
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
CREATE POLICY "Admins can manage all profiles" ON profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Vérifier que les changements ont été appliqués
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'blocked'; 