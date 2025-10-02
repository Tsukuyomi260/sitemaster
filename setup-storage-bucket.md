# Configuration du Bucket de Stockage Supabase

## Étapes à suivre dans l'interface Supabase :

### 1. Créer le bucket "assignments"

1. Allez dans votre dashboard Supabase
2. Cliquez sur "Storage" dans le menu de gauche
3. Cliquez sur "New Bucket"
4. Configurez le bucket :
   - **Nom** : `assignments`
   - **Public bucket** : ✅ OUI
   - **File size limit** : `50MB`
   - **Allowed MIME types** :
     - `application/pdf`
     - `application/msword`
     - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
     - `application/vnd.ms-powerpoint`
     - `application/vnd.openxmlformats-officedocument.presentationml.presentation`
     - `text/plain`
     - `image/*`

### 2. Configurer les politiques RLS pour le bucket

Dans l'onglet "Policies" du bucket `assignments`, ajoutez ces politiques :

#### Politique pour l'upload (INSERT)
```sql
-- Permettre l'upload aux utilisateurs authentifiés
CREATE POLICY "Allow authenticated users to upload assignments" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'assignments' AND 
  auth.role() = 'authenticated'
);
```

#### Politique pour la lecture (SELECT)
```sql
-- Permettre la lecture publique des fichiers
CREATE POLICY "Allow public read access to assignments" ON storage.objects
FOR SELECT USING (
  bucket_id = 'assignments'
);
```

#### Politique pour la mise à jour (UPDATE)
```sql
-- Permettre aux utilisateurs de mettre à jour leurs propres fichiers
CREATE POLICY "Allow users to update their own files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'assignments' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Politique pour la suppression (DELETE)
```sql
-- Permettre aux utilisateurs de supprimer leurs propres fichiers
CREATE POLICY "Allow users to delete their own files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'assignments' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### 3. Exécuter les scripts SQL

Exécutez dans l'ordre ces scripts dans l'éditeur SQL de Supabase :

1. `create-assignments-table.sql`
2. `create-assignment-submissions-table.sql` (si pas déjà fait)
3. `setup-rls-policies.sql`

### 4. Vérifier la configuration

Après avoir configuré tout cela, testez la soumission de devoir dans l'interface étudiant. 