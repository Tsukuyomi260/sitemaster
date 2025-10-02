-- Script pour implémenter le système de progression académique
-- Ajouter la colonne study_year pour identifier l'année d'étude des étudiants

-- Vérifier et ajouter la colonne study_year à la table students
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'students' 
        AND column_name = 'study_year'
    ) THEN
        -- Ajouter la colonne study_year
        ALTER TABLE students ADD COLUMN study_year INTEGER DEFAULT 1 CHECK (study_year IN (1, 2));
        
        -- Ajouter un commentaire pour documenter la colonne
        COMMENT ON COLUMN students.study_year IS 'Année d''étude : 1 pour 1ère année, 2 pour 2ème année du master MR-MRTDDEFTP';
        
        RAISE NOTICE 'Colonne study_year ajoutée à la table students';
    ELSE
        RAISE NOTICE 'La colonne study_year existe déjà dans la table students';
    END IF;
END $$;

-- Mettre à jour les étudiants existants : tous sont en 1ère année par défaut
UPDATE students SET study_year = 1 WHERE study_year IS NULL;

-- Créer un index pour optimiser les requêtes par année d'étude
CREATE INDEX IF NOT EXISTS idx_students_study_year ON students(study_year);

-- Créer une vue pour les étudiants selon l'année d'étude
CREATE OR REPLACE VIEW students_by_year AS
SELECT 
    id,
    matricule,
    nom_complet,
    email,
    sexe,
    niveau,
    annee_academique,
    study_year,
    blocked,
    CASE 
        WHEN study_year = 1 THEN '1ère année du Master MR-MRTDDEFTP'
        WHEN study_year = 2 THEN '2ème année du Master MR-MRTDDEFTP'
        ELSE 'Année non définie'
    END as year_description
FROM students;

-- Fonction pour promouvoir un étudiant en année supérieure
CREATE OR REPLACE FUNCTION promote_student(student_email TEXT)
RETURNS TEXT AS $$
DECLARE
    current_year INTEGER;
    student_name TEXT;
BEGIN
    -- Vérifier si l'étudiant existe
    SELECT study_year, nom_complet INTO current_year, student_name
    FROM students 
    WHERE email = student_email;
    
    IF student_name IS NULL THEN
        RETURN 'Étudiant non trouvé';
    END IF;
    
    -- Vérifier si déjà en 2ème année
    IF current_year = 2 THEN
        RETURN format('L''étudiant %s est déjà en 2ème année', student_name);
    END IF;
    
    -- Promouvoir l'étudiant
    UPDATE students 
    SET study_year = 2 
    WHERE email = student_email;
    
    RETURN format('Étudiant %s promu en 2ème année du Master MR-MRTDDEFTP', student_name);
END;
$$ LANGUAGE plpgsql;

-- Fonction pour rétrograder un étudiant (utilisée pour les erreurs)
CREATE OR REPLACE FUNCTION demote_student(student_email TEXT)
RETURNS TEXT AS $$
DECLARE
    current_year INTEGER;
    student_name TEXT;
BEGIN
    -- Vérifier si l'étudiant existe
    SELECT study_year, nom_complet INTO current_year, student_name
    FROM students 
    WHERE email = student_email;
    
    IF student_name IS NULL THEN
        RETURN 'Étudiant non trouvé';
    END IF;
    
    -- Vérifier si déjà en 1ère année
    IF current_year = 1 THEN
        RETURN format('L''étudiant %s est déjà en 1ère année', student_name);
    END IF;
    
    -- Rétrograder l'étudiant
    UPDATE students 
    SET study_year = 1 
    WHERE email = student_email;
    
    RETURN format('Étudiant %s rétrogradé en 1ère année du Master MR-MRTDDEFTP', student_name);
END;
$$ LANGUAGE plpgsql;

-- Script pour ajouter des étudiants de 1ère année du Master MR-MRTDDEFTP
INSERT INTO students (
    id,
    matricule, 
    nom_complet, 
    email, 
    sexe, 
    niveau, 
    annee_academique, 
    study_year, 
    blocked
) VALUES 
    ('STU_MR2024001', 'MR2024001', 'Dos Santos Alexandre', 'alexandre.dossantos@gmail.com', 'M', 'Master MR-MRTDDEFTP', '2024-2025', 1, false),
    ('STU_MR2024002', 'MR2024002', 'Akambi Fatima', 'fatima.akambi@gmail.com', 'F', 'Master MR-MRTDDEFTP', '2024-2025', 1, false),
    ('STU_MR2024003', 'MR2024003', 'Yovo Koffi', 'koffi.yovo@gmail.com', 'M', 'Master MR-MRTDDEFTP', '2024-2025', 1, false),
    ('STU_MR2024004', 'MR2024004', 'Adjovi Grace', 'grace.adjovi@gmail.com', 'F', 'Master MR-MRTDDEFTP', '2024-2025', 1, false),
    ('STU_MR2024005', 'MR2024005', 'Tossou Fabrice', 'fabrice.tossou@gmail.com', 'M', 'Master MR-MRTDDEFTP', '2024-2025', 1, false)
ON CONFLICT (email) DO UPDATE SET 
    matricule = EXCLUDED.matricule,
    nom_complet = EXCLUDED.nom_complet,
    niveau = EXCLUDED.niveau,
    study_year = EXCLUDED.study_year;

-- Affichage des statistiques par année d'étude
SELECT 
    CASE study_year
        WHEN 1 THEN '1ère année'
        WHEN 2 THEN '2ème année'
        ELSE 'Non défini'
    END as "Année d'étude",
    COUNT(*) as "Nombre d'étudiants",
    COUNT(CASE WHEN blocked = false THEN 1 END) as "Actifs",
    COUNT(CASE WHEN blocked = true THEN 1 END) as "Bloqués"
FROM students 
GROUP BY study_year
ORDER BY study_year;

-- Vérifier la structure de la table mise à jour
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'students' 
AND column_name IN ('study_year', 'matricule', 'nom_complet', 'email', 'niveau')
ORDER BY ordinal_position;