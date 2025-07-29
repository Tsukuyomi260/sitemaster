-- Mise à jour de la table teacher_messages pour supporter les messages individuels
-- Ajouter les colonnes nécessaires pour les messages de diffusion et individuels

-- Ajouter la colonne target_type (pour distinguer diffusion vs individuel)
ALTER TABLE teacher_messages 
ADD COLUMN IF NOT EXISTS target_type VARCHAR(50) DEFAULT 'broadcast';

-- Ajouter la colonne target_email (pour les messages individuels)
ALTER TABLE teacher_messages 
ADD COLUMN IF NOT EXISTS target_email VARCHAR(255);

-- Rendre course_name optionnel (pour les messages de diffusion générale)
ALTER TABLE teacher_messages 
ALTER COLUMN course_name DROP NOT NULL;

-- Supprimer la contrainte existante si elle existe
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_target_type' 
        AND table_name = 'teacher_messages'
    ) THEN
        ALTER TABLE teacher_messages DROP CONSTRAINT check_target_type;
    END IF;
END $$;

-- Ajouter des contraintes pour s'assurer que les messages individuels ont un target_email
ALTER TABLE teacher_messages 
ADD CONSTRAINT check_target_type 
CHECK (
  (target_type = 'broadcast' AND course_name IS NOT NULL) OR 
  (target_type = 'individual' AND target_email IS NOT NULL)
);

-- Index pour améliorer les performances des requêtes par target_type
CREATE INDEX IF NOT EXISTS idx_teacher_messages_target_type ON teacher_messages(target_type);
CREATE INDEX IF NOT EXISTS idx_teacher_messages_target_email ON teacher_messages(target_email);

-- Mettre à jour les messages existants pour avoir le bon target_type
UPDATE teacher_messages 
SET target_type = 'broadcast' 
WHERE target_type IS NULL; 