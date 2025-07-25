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

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
} 