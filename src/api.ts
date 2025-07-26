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
    // Essayer de récupérer le rôle depuis la table profiles
    const profile = await getUserProfile(userId);
    if (profile && profile.role) {
      return profile.role;
    }
    
    // Si pas de profil, essayer de récupérer depuis les métadonnées
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.user_metadata && user.user_metadata.role) {
      return user.user_metadata.role;
    }
    
    // Par défaut, retourner 'student'
    return 'student';
  } catch (error) {
    console.error('Erreur lors de la récupération du rôle:', error);
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