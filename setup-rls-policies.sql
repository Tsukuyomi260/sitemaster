-- Politiques RLS pour assignment_submissions

-- 1. Permettre aux étudiants de voir leurs propres soumissions
CREATE POLICY "Students can view their own submissions" ON assignment_submissions
FOR SELECT USING (
  student_id::uuid = (auth.jwt() ->> 'sub')::uuid
);

-- 2. Permettre aux étudiants de créer leurs propres soumissions
CREATE POLICY "Students can create their own submissions" ON assignment_submissions
FOR INSERT WITH CHECK (
  student_id::uuid = (auth.jwt() ->> 'sub')::uuid
);

-- 3. Permettre aux enseignants de voir toutes les soumissions
CREATE POLICY "Teachers can view all submissions" ON assignment_submissions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id::uuid = (auth.jwt() ->> 'sub')::uuid
    AND profiles.role = 'teacher'
  )
);

-- 4. Permettre aux enseignants de mettre à jour les soumissions (pour les notes)
CREATE POLICY "Teachers can update submissions" ON assignment_submissions
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id::uuid = (auth.jwt() ->> 'sub')::uuid
    AND profiles.role = 'teacher'
  )
);

-- 5. Permettre aux admins de tout faire
CREATE POLICY "Admins can do everything" ON assignment_submissions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id::uuid = (auth.jwt() ->> 'sub')::uuid
    AND profiles.role = 'admin'
  )
);

-- Activer RLS sur la table
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY; 