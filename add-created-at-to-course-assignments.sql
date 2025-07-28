-- Script pour ajouter la colonne created_at à la table course_assignments
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Vérifier si la colonne created_at existe déjà
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'course_assignments' 
AND column_name = 'created_at';

-- 2. Ajouter la colonne created_at si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'course_assignments' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE course_assignments 
        ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        
        -- Mettre à jour les enregistrements existants avec la date actuelle
        UPDATE course_assignments 
        SET created_at = NOW() 
        WHERE created_at IS NULL;
        
        RAISE NOTICE 'Colonne created_at ajoutée à la table course_assignments';
    ELSE
        RAISE NOTICE 'La colonne created_at existe déjà dans la table course_assignments';
    END IF;
END $$;

-- 3. Vérifier la structure mise à jour
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'course_assignments'
ORDER BY ordinal_position;

-- 4. Voir les cours assignés avec la date de création
SELECT 
    id,
    teacher_email,
    course_name,
    created_at,
    is_active
FROM course_assignments 
ORDER BY created_at DESC; 