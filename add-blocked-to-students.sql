-- Script pour ajouter la colonne blocked à la table students
-- Cette colonne permettra de bloquer/débloquer les étudiants

-- Vérifier si la colonne blocked existe déjà dans students
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'students' 
        AND column_name = 'blocked'
    ) THEN
        -- Ajouter la colonne blocked
        ALTER TABLE students ADD COLUMN blocked BOOLEAN DEFAULT FALSE;
        
        -- Ajouter un commentaire pour documenter la colonne
        COMMENT ON COLUMN students.blocked IS 'Indique si l''étudiant est bloqué (true) ou actif (false)';
        
        RAISE NOTICE 'Colonne blocked ajoutée à la table students';
    ELSE
        RAISE NOTICE 'La colonne blocked existe déjà dans la table students';
    END IF;
END $$;

-- Créer un index pour optimiser les requêtes de blocage
CREATE INDEX IF NOT EXISTS idx_students_blocked ON students(blocked);

-- Mettre à jour les politiques RLS pour inclure la colonne blocked
-- Les étudiants bloqués ne peuvent pas accéder aux données
DROP POLICY IF EXISTS "Students can view their own data" ON students;
CREATE POLICY "Students can view their own data" ON students
    FOR SELECT USING (
        email = auth.jwt() ->> 'email'
        AND (blocked IS NULL OR blocked = FALSE)
    );

DROP POLICY IF EXISTS "Students can update their own data" ON students;
CREATE POLICY "Students can update their own data" ON students
    FOR UPDATE USING (
        email = auth.jwt() ->> 'email'
        AND (blocked IS NULL OR blocked = FALSE)
    );

-- Politique pour les admins (peuvent voir et modifier tous les étudiants)
DROP POLICY IF EXISTS "Admins can manage all students" ON students;
CREATE POLICY "Admins can manage all students" ON students
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Politique pour les enseignants (peuvent voir les étudiants de leurs cours)
DROP POLICY IF EXISTS "Teachers can view their students" ON students;
CREATE POLICY "Teachers can view their students" ON students
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM course_assignments ca
            JOIN assignments a ON ca.course_name = a.course
            JOIN assignment_submissions asub ON a.id = asub.assignment_id
            WHERE asub.student_id = students.id
            AND ca.teacher_email = auth.jwt() ->> 'email'
        )
        AND (blocked IS NULL OR blocked = FALSE)
    );

-- Vérifier que les changements ont été appliqués
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'students' 
AND column_name = 'blocked';

-- Voir les étudiants actuels et leur statut de blocage
SELECT 
    id,
    matricule,
    nom_complet,
    email,
    blocked,
    created_at
FROM students 
ORDER BY created_at DESC
LIMIT 10; 