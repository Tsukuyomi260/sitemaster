-- Politiques RLS pour la table assignments
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- Permettre la lecture des devoirs à tous les utilisateurs authentifiés
CREATE POLICY "Allow authenticated users to read assignments" ON assignments
  FOR SELECT USING (auth.role() = 'authenticated');

-- Permettre aux enseignants et admins de créer/modifier des devoirs
CREATE POLICY "Allow teachers and admins to manage assignments" ON assignments
  FOR ALL USING (
    auth.role() = 'authenticated' AND (
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('teacher', 'admin')
      )
    )
  );

-- Politiques RLS pour la table assignment_submissions
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;

-- Permettre aux étudiants de voir leurs propres soumissions
CREATE POLICY "Allow students to view their own submissions" ON assignment_submissions
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      student_id = auth.uid()::text OR
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('teacher', 'admin')
      )
    )
  );

-- Permettre aux étudiants de créer leurs propres soumissions
CREATE POLICY "Allow students to create their own submissions" ON assignment_submissions
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND (
      student_id = auth.uid()::text OR
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('teacher', 'admin')
      )
    )
  );

-- Permettre aux enseignants et admins de modifier les soumissions (pour les notes)
CREATE POLICY "Allow teachers and admins to update submissions" ON assignment_submissions
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND (
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('teacher', 'admin')
      )
    )
  );

-- Politiques RLS pour la table course_assignments
ALTER TABLE course_assignments ENABLE ROW LEVEL SECURITY;

-- Permettre la lecture des assignations de cours à tous les utilisateurs authentifiés
CREATE POLICY "Allow authenticated users to read course assignments" ON course_assignments
  FOR SELECT USING (auth.role() = 'authenticated');

-- Permettre aux admins de gérer les assignations de cours
CREATE POLICY "Allow admins to manage course assignments" ON course_assignments
  FOR ALL USING (
    auth.role() = 'authenticated' AND (
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
      )
    )
  ); 