import { supabase } from './supabaseClient';

export async function loginUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data.user;
}

export async function loginStudent(email: string, password: string) {
  return loginUser(email, password);
}

export async function loginTeacher(email: string, password: string) {
  return loginUser(email, password);
}

export async function loginAdmin(email: string, password: string) {
  return loginUser(email, password);
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getUserProfile(userId: string) {
  // Essayer de récupérer le profil depuis une table 'profiles'
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    console.error('Erreur lors de la récupération du profil:', error);
  }
  
  return profile;
}

export async function getUserRole(userId: string) {
  try {
    console.log('Recherche du rôle pour userId:', userId);
    
    // Essayer de récupérer le rôle depuis la table profiles
    const profile = await getUserProfile(userId);
    console.log('Profil trouvé:', profile);
    
    if (profile && profile.role) {
      console.log('Rôle trouvé dans profiles:', profile.role);
      return profile.role;
    }
    
    // Si pas de profil, essayer de récupérer depuis les métadonnées
    const { data: { user } } = await supabase.auth.getUser();
    console.log('User auth:', user);
    
    if (user && user.user_metadata && user.user_metadata.role) {
      console.log('Rôle trouvé dans metadata:', user.user_metadata.role);
      return user.user_metadata.role;
    }
    
    // Par défaut, retourner 'student'
    console.log('Aucun rôle trouvé, utilisation du rôle par défaut: student');
    return 'student';
  } catch (error) {
    console.error('Erreur lors de la récupération du rôle:', error);
    // En cas d'erreur, retourner 'student' par défaut
    return 'student';
  }
}

export async function getStudentInfo(email: string) {
  try {
    // Récupérer les informations de l'étudiant depuis la table students
    const { data: student, error } = await supabase
      .from('students')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Erreur lors de la récupération des infos étudiant:', error);
    }
    
    return student;
  } catch (error) {
    console.error('Erreur lors de la récupération des infos étudiant:', error);
    return null;
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Fonctions pour les soumissions de devoirs
export async function submitAssignment(assignmentId: number, studentId: string, file: File, comments?: string) {
  try {
    // Upload du fichier vers Supabase Storage
    const fileName = `${studentId}_assignment_${assignmentId}_${Date.now()}.${file.name.split('.').pop()}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('assignments')
      .upload(fileName, file);

    if (uploadError) {
      throw uploadError;
    }

    // Récupérer l'URL publique du fichier
    const { data: { publicUrl } } = supabase.storage
      .from('assignments')
      .getPublicUrl(fileName);

    // Enregistrer la soumission dans la base de données
    const { data, error } = await supabase
      .from('assignment_submissions')
      .insert({
        assignment_id: assignmentId,
        student_id: studentId,
        file_url: publicUrl,
        file_name: file.name,
        submitted_at: new Date().toISOString(),
        comments: comments || '',
        status: 'submitted'
      });

    if (error) {
      throw error;
    }

    return { success: true, data, fileUrl: publicUrl };
  } catch (error) {
    console.error('Erreur lors de la soumission du devoir:', error);
    throw error;
  }
}

export async function getAssignmentSubmissions(studentId: string) {
  try {
    const { data, error } = await supabase
      .from('assignment_submissions')
      .select(`
        *,
        assignments (
          title,
          course,
          due_date,
          points
        )
      `)
      .eq('student_id', studentId)
      .order('submitted_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des soumissions:', error);
    throw error;
  }
} 