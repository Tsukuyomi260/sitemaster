-- Script pour corriger la relation entre assignment_submissions et assignments

-- 1. Vérifier la structure actuelle des tables
SELECT 
  'Structure de assignment_submissions' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'assignment_submissions'
ORDER BY ordinal_position;

SELECT 
  'Structure de assignments' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'assignments'
ORDER BY ordinal_position;

-- 2. Vérifier les contraintes existantes
SELECT 
  'Contraintes sur assignment_submissions' as info,
  constraint_name,
  constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'assignment_submissions';

-- 3. Ajouter la contrainte de clé étrangère si elle n'existe pas
-- D'abord, vérifier si la contrainte existe déjà
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'assignment_submissions' 
        AND constraint_name = 'assignment_submissions_assignment_id_fkey'
    ) THEN
        -- Ajouter la contrainte de clé étrangère
        ALTER TABLE assignment_submissions 
        ADD CONSTRAINT assignment_submissions_assignment_id_fkey 
        FOREIGN KEY (assignment_id) REFERENCES assignments(id);
        
        RAISE NOTICE 'Contrainte de clé étrangère ajoutée avec succès';
    ELSE
        RAISE NOTICE 'La contrainte de clé étrangère existe déjà';
    END IF;
END $$;

-- 4. Vérifier que la contrainte a été ajoutée
SELECT 
  'Contraintes après correction' as info,
  constraint_name,
  constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'assignment_submissions';

-- 5. Vérifier les données pour s'assurer qu'elles sont cohérentes
SELECT 
  'Vérification des données' as info,
  COUNT(*) as total_submissions,
  COUNT(DISTINCT assignment_id) as unique_assignments,
  COUNT(CASE WHEN assignment_id IS NULL THEN 1 END) as null_assignments
FROM assignment_submissions;

-- 6. Vérifier les soumissions orphelines (sans devoir correspondant)
SELECT 
  'Soumissions orphelines' as info,
  s.id,
  s.assignment_id,
  s.student_id,
  s.submission_title
FROM assignment_submissions s
LEFT JOIN assignments a ON s.assignment_id = a.id
WHERE a.id IS NULL; 