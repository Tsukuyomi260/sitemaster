-- Note: Ce script doit être exécuté dans l'interface Supabase Storage
-- Allez dans Supabase Dashboard > Storage > New Bucket

-- Nom du bucket: assignments
-- Public bucket: OUI (pour permettre l'accès aux fichiers)
-- File size limit: 50MB (ou selon vos besoins)
-- Allowed MIME types: 
--   - application/pdf
--   - application/msword
--   - application/vnd.openxmlformats-officedocument.wordprocessingml.document
--   - application/vnd.ms-powerpoint
--   - application/vnd.openxmlformats-officedocument.presentationml.presentation
--   - text/plain

-- Politique RLS pour le bucket assignments:
-- Permettre l'upload aux utilisateurs authentifiés
-- Permettre la lecture publique des fichiers soumis 