import { supabase } from './supabaseClient';

export async function loginUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  
  // Vérifier si l'utilisateur est bloqué
  const user = data.user;
  if (user) {
    console.log('Vérification du blocage lors de la connexion pour:', email);
    
    // Vérifier d'abord directement dans la table students par email
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('blocked')
      .eq('email', email)
      .single();
    
    console.log('Vérification student par email:', student);
    
    if (student && student.blocked) {
      console.log('Étudiant bloqué détecté lors de la connexion');
      // Déconnecter l'utilisateur s'il est bloqué
      await supabase.auth.signOut();
      throw new Error('Votre compte a été bloqué par un administrateur. Veuillez contacter l\'administration.');
    }
    
    // Vérifier aussi avec la fonction checkIfUserIsBlocked
    const isBlocked = await checkIfUserIsBlocked(user.id);
    if (isBlocked) {
      console.log('Utilisateur bloqué détecté par checkIfUserIsBlocked');
      // Déconnecter l'utilisateur s'il est bloqué
      await supabase.auth.signOut();
      throw new Error('Votre compte a été bloqué par un administrateur. Veuillez contacter l\'administration.');
    }
  }
  
  return user;
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
  
  // Vérifier si l'utilisateur est bloqué
  if (user) {
    const isBlocked = await checkIfUserIsBlocked(user.id);
    if (isBlocked) {
      // Déconnecter l'utilisateur s'il est bloqué
      await supabase.auth.signOut();
      throw new Error('Votre compte a été bloqué par un administrateur. Veuillez contacter l\'administration.');
    }
  }
  
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

export async function getUserRoles(userId: string): Promise<string[]> {
  try {
    console.log('Recherche des rôles pour userId:', userId);
    
    // Essayer de récupérer les rôles depuis la table profiles
    const profile = await getUserProfile(userId);
    console.log('Profil trouvé:', profile);
    
    if (profile && profile.roles && Array.isArray(profile.roles)) {
      console.log('Rôles trouvés dans profiles:', profile.roles);
      return profile.roles;
    }
    
    // Fallback vers l'ancien système avec un seul rôle
    if (profile && profile.role) {
      console.log('Rôle unique trouvé dans profiles:', profile.role);
      return [profile.role];
    }
    
    // Si pas de profil, essayer de récupérer depuis les métadonnées
    const { data: { user } } = await supabase.auth.getUser();
    console.log('User auth:', user);
    
    if (user && user.user_metadata && user.user_metadata.role) {
      console.log('Rôle trouvé dans metadata:', user.user_metadata.role);
      return [user.user_metadata.role];
    }
    
    // Par défaut, retourner 'student'
    console.log('Aucun rôle trouvé, utilisation du rôle par défaut: student');
    return ['student'];
  } catch (error) {
    console.error('Erreur lors de la récupération des rôles:', error);
    // En cas d'erreur, retourner 'student' par défaut
    return ['student'];
  }
}

export async function getUserRole(userId: string) {
  const roles = await getUserRoles(userId);
  return roles.length > 0 ? roles[0] : 'student';
}

export async function getStudentInfo(email: string) {
  try {
    console.log('getStudentInfo appelé pour email:', email);
    
    // Vérifier si l'étudiant est bloqué directement par email
    const { data: student, error } = await supabase
      .from('students')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Erreur lors de la récupération des infos étudiant:', error);
    }
    
    // Si l'étudiant est bloqué, lancer une erreur
    if (student && student.blocked) {
      console.log('Étudiant bloqué détecté dans getStudentInfo');
      throw new Error('Votre compte a été bloqué par un administrateur. Veuillez contacter l\'administration.');
    }
    
    // Vérifier aussi si l'utilisateur actuel est bloqué
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const isBlocked = await checkIfUserIsBlocked(user.id);
      if (isBlocked) {
        throw new Error('Votre compte a été bloqué par un administrateur. Veuillez contacter l\'administration.');
      }
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
export async function submitAssignment(assignmentId: number, studentId: string, file: File, title: string, comments?: string) {
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
        student_id: studentId, // Utiliser directement le string
        file_url: publicUrl,
        file_name: file.name,
        submission_title: title,
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

// Fonction pour récupérer tous les étudiants
export async function getAllStudents() {
  try {
    const { data: students, error } = await supabase
      .from('students')
      .select('*')
      .order('nom_complet', { ascending: true });

    if (error) {
      throw error;
    }

    return students;
  } catch (error) {
    console.error('Erreur lors de la récupération des étudiants:', error);
    throw error;
  }
}

// Fonction pour récupérer tous les devoirs rendus
export async function getAllAssignmentSubmissions() {
  try {
    const { data: submissions, error } = await supabase
      .from('assignment_submissions')
      .select(`
        *,
        assignments (
          title,
          course,
          due_date,
          points
        ),
        students (
          nom_complet,
          email,
          matricule
        )
      `)
      .order('submitted_at', { ascending: false });

    if (error) {
      throw error;
    }

    return submissions;
  } catch (error) {
    console.error('Erreur lors de la récupération des soumissions:', error);
    throw error;
  }
}

// Fonction pour récupérer les cours assignés à un enseignant
export async function getTeacherCourses(teacherEmail: string) {
  try {
    const { data: courses, error } = await supabase
      .from('course_assignments')
      .select('*')
      .eq('teacher_email', teacherEmail)
      .eq('is_active', true)
      .order('assigned_at', { ascending: false });

    if (error) {
      throw error;
    }

    return courses;
  } catch (error) {
    console.error('Erreur lors de la récupération des cours enseignants:', error);
    throw error;
  }
}

// Fonction pour récupérer les étudiants inscrits à un cours
export async function getStudentsByCourse(courseName: string) {
  try {
    const { data: students, error } = await supabase
      .from('students')
      .select('*')
      .eq('niveau', 'MR-TDDEFTP-2') // Correction: utiliser le bon niveau
      .order('nom_complet', { ascending: true });

    if (error) {
      throw error;
    }

    return students;
  } catch (error) {
    console.error('Erreur lors de la récupération des étudiants par cours:', error);
    throw error;
  }
}

// Fonction pour récupérer les étudiants qui ont téléchargé un cours spécifique
export async function getStudentsWhoDownloadedCourse(courseName: string) {
  try {
    const { data: downloads, error } = await supabase
      .from('course_downloads')
      .select('student_email')
      .eq('course_name', courseName);

    if (error) {
      throw error;
    }

    if (downloads && downloads.length > 0) {
      const studentEmails = downloads.map(d => d.student_email);
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .in('email', studentEmails)
        .order('nom_complet', { ascending: true });

      if (studentsError) {
        throw studentsError;
      }

      return students;
    }

    return [];
  } catch (error) {
    console.error('Erreur lors de la récupération des étudiants ayant téléchargé le cours:', error);
    throw error;
  }
}

// Fonction pour envoyer un message aux étudiants d'un cours
export async function sendMessageToStudents(teacherEmail: string, courseName: string, messageTitle: string, messageContent: string) {
  try {
    // 1. Créer le message
    const { data: message, error: messageError } = await supabase
      .from('teacher_messages')
      .insert({
        teacher_email: teacherEmail,
        course_name: courseName,
        message_title: messageTitle,
        message_content: messageContent
      })
      .select()
      .single();

    if (messageError) {
      throw messageError;
    }

    // 2. Récupérer tous les étudiants Master 2
    const students = await getStudentsByCourse(courseName);

    // 3. Créer les notifications pour chaque étudiant
    if (students && students.length > 0) {
      const notifications = students.map(student => ({
        student_email: student.email,
        message_id: message.id
      }));

      const { error: notificationError } = await supabase
        .from('student_notifications')
        .insert(notifications);

      if (notificationError) {
        throw notificationError;
      }
    }

    return { success: true, messageId: message.id, studentsCount: students?.length || 0 };
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);
    throw error;
  }
}

// Fonction pour récupérer les notifications d'un étudiant
export async function getStudentNotifications(studentEmail: string) {
  try {
    const { data: notifications, error } = await supabase
      .from('student_notifications')
      .select(`
        *,
        teacher_messages (
          id,
          teacher_email,
          course_name,
          message_title,
          message_content,
          created_at
        )
      `)
      .eq('student_email', studentEmail)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return notifications;
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    throw error;
  }
}

// Fonction pour marquer une notification comme lue
export async function markNotificationAsRead(notificationId: number) {
  try {
    const { error } = await supabase
      .from('student_notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Erreur lors du marquage de la notification:', error);
    throw error;
  }
}

// Fonction pour enregistrer un téléchargement de cours
export async function recordCourseDownload(studentEmail: string, courseName: string) {
  try {
    const { error } = await supabase
      .from('course_downloads')
      .upsert({
        student_email: studentEmail,
        course_name: courseName
      }, {
        onConflict: 'student_email,course_name'
      });

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du téléchargement:', error);
    throw error;
  }
}

// Fonction pour envoyer un message à tous les étudiants Master 2
export async function sendMessageToAllStudents(teacherEmail: string, messageTitle: string, messageContent: string) {
  try {
    // 1. Créer le message
    const { data: message, error: messageError } = await supabase
      .from('teacher_messages')
      .insert({
        teacher_email: teacherEmail,
        course_name: 'Message général',
        message_title: messageTitle,
        message_content: messageContent
      })
      .select()
      .single();

    if (messageError) {
      throw messageError;
    }

                 // 2. Récupérer tous les étudiants Master 2
             const { data: students, error: studentsError } = await supabase
               .from('students')
               .select('*')
               .eq('niveau', 'MR-TDDEFTP-2')
               .order('nom_complet', { ascending: true });

    if (studentsError) {
      throw studentsError;
    }

    // 3. Créer les notifications pour chaque étudiant
    if (students && students.length > 0) {
      const notifications = students.map(student => ({
        student_email: student.email,
        message_id: message.id
      }));

      const { error: notificationError } = await supabase
        .from('student_notifications')
        .insert(notifications);

      if (notificationError) {
        throw notificationError;
      }
    }

    return { success: true, messageId: message.id, studentsCount: students?.length || 0 };
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message à tous les étudiants:', error);
    throw error;
  }
} 

// Nouvelles fonctions pour le Super Admin Dashboard

// Récupérer tous les administrateurs
export async function getAllAdmins() {
  try {
    const { data: admins, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin')
      .order('email', { ascending: true });
    
    if (error) {
      throw error;
    }
    return admins;
  } catch (error) {
    console.error('Erreur lors de la récupération des administrateurs:', error);
    throw error;
  }
}

// Récupérer tous les enseignants
export async function getAllTeachers() {
  try {
    const { data: teachers, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'teacher')
      .order('email', { ascending: true });
    
    if (error) {
      throw error;
    }
    return teachers;
  } catch (error) {
    console.error('Erreur lors de la récupération des enseignants:', error);
    throw error;
  }
}

// Récupérer tous les cours assignés par master
export async function getAllCoursesByMaster() {
  try {
    console.log('Récupération des cours assignés...');
    
    const { data: courses, error } = await supabase
      .from('course_assignments')
      .select(`
        id,
        teacher_email,
        course_name,
        created_at,
        is_active
      `)
      .order('course_name', { ascending: true });
    
    console.log('Cours assignés récupérés:', courses);
    console.log('Erreur éventuelle:', error);
    
    if (error) {
      throw error;
    }
    return courses;
  } catch (error) {
    console.error('Erreur lors de la récupération des cours par master:', error);
    throw error;
  }
}

// Récupérer les statistiques globales
export async function getGlobalStats() {
  try {
    // Compter les étudiants
    const { count: studentsCount, error: studentsError } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true });
    
    if (studentsError) throw studentsError;

    // Compter les enseignants
    const { count: teachersCount, error: teachersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'teacher');
    
    if (teachersError) throw teachersError;

    // Compter les administrateurs
    const { count: adminsCount, error: adminsError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'admin');
    
    if (adminsError) throw adminsError;

    // Compter les soumissions de devoirs
    const { count: submissionsCount, error: submissionsError } = await supabase
      .from('assignment_submissions')
      .select('*', { count: 'exact', head: true });
    
    if (submissionsError) throw submissionsError;

    return {
      studentsCount: studentsCount || 0,
      teachersCount: teachersCount || 0,
      adminsCount: adminsCount || 0,
      submissionsCount: submissionsCount || 0
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    throw error;
  }
}

// Créer un nouvel administrateur
export async function createAdmin(email: string, password: string) {
  try {
    // Créer l'utilisateur dans auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError) throw authError;

    // Ajouter le rôle admin dans profiles
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: email,
          role: 'admin'
        });

      if (profileError) throw profileError;
    }

    return authData.user;
  } catch (error) {
    console.error('Erreur lors de la création de l\'administrateur:', error);
    throw error;
  }
}

// Créer un nouvel enseignant
export async function createTeacher(email: string, password: string) {
  try {
    // Créer l'utilisateur dans auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError) throw authError;

    // Ajouter le rôle teacher dans profiles
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: email,
          role: 'teacher'
        });

      if (profileError) throw profileError;
    }

    return authData.user;
  } catch (error) {
    console.error('Erreur lors de la création de l\'enseignant:', error);
    throw error;
  }
}

// Assigner un cours à un enseignant
export async function assignCourseToTeacher(teacherEmail: string, courseName: string) {
  try {
    const { data, error } = await supabase
      .from('course_assignments')
      .insert({
        teacher_email: teacherEmail,
        course_name: courseName
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de l\'assignation du cours:', error);
    throw error;
  }
}

// Supprimer l'assignation d'un cours
export async function removeCourseAssignment(assignmentId: number) {
  try {
    const { error } = await supabase
      .from('course_assignments')
      .delete()
      .eq('id', assignmentId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'assignation:', error);
    throw error;
  }
}

// Vérifier si un utilisateur est bloqué
export async function checkIfUserIsBlocked(userId: string): Promise<boolean> {
  try {
    console.log('Vérification du blocage pour userId:', userId);
    
    // D'abord, récupérer l'email de l'utilisateur depuis profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, blocked')
      .eq('id', userId)
      .single();
    
    console.log('Profil trouvé:', profile);
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Erreur lors de la récupération du profil:', profileError);
    }
    
    // Si on a trouvé le profil et qu'il est bloqué
    if (profile && profile.blocked) {
      console.log('Utilisateur bloqué dans profiles');
      return true;
    }
    
    // Si on a l'email, vérifier aussi dans la table students
    if (profile && profile.email) {
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('blocked')
        .eq('email', profile.email)
        .single();
      
      console.log('Étudiant trouvé:', student);
      
      if (student && student.blocked) {
        console.log('Étudiant bloqué dans students');
        return true;
      }
    }
    
    // Vérifier aussi directement dans students si on a l'email
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.email) {
      const { data: studentByEmail, error: studentEmailError } = await supabase
        .from('students')
        .select('blocked')
        .eq('email', user.email)
        .single();
      
      console.log('Étudiant trouvé par email:', studentByEmail);
      
      if (studentByEmail && studentByEmail.blocked) {
        console.log('Étudiant bloqué par email');
        return true;
      }
    }
    
    console.log('Utilisateur non bloqué');
    return false;
  } catch (error) {
    console.error('Erreur lors de la vérification du statut de blocage:', error);
    return false;
  }
}

// Bloquer/Débloquer un utilisateur
export async function toggleUserBlock(userId: string, blocked: boolean) {
  try {
    console.log('toggleUserBlock appelé avec:', { userId, blocked });
    
    // Essayer d'abord de mettre à jour dans la table students (car l'ID vient de là)
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .update({ blocked })
      .eq('id', userId)
      .select();

    console.log('Résultat de la mise à jour students:', { studentData, error: studentError });

    if (!studentError) {
      console.log('Mise à jour réussie dans la table students');
      return true;
    }

    // Si ça ne marche pas, essayer dans la table profiles
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .update({ blocked })
      .eq('id', userId)
      .select();

    console.log('Résultat de la mise à jour profiles:', { profileData, error: profileError });

    if (!profileError) {
      console.log('Mise à jour réussie dans la table profiles');
      return true;
    }

    // Si les deux échouent, essayer avec les métadonnées auth
    console.log('Tentative avec les métadonnées auth...');
    const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { blocked }
    });
    
    if (authError) {
      console.error('Toutes les méthodes ont échoué:', { studentError, profileError, authError });
      throw new Error('Impossible de mettre à jour le statut de blocage');
    }
    
    console.log('toggleUserBlock réussi avec les métadonnées auth');
    return true;
  } catch (error) {
    console.error('Erreur lors du changement de statut utilisateur:', error);
    throw error;
  }
}

// Envoyer un message à tous les utilisateurs (fonctionnalité admin)
export async function sendMessageToAllUsers(adminEmail: string, messageTitle: string, messageContent: string, targetRole?: string) {
  try {
    console.log('sendMessageToAllUsers appelé avec:', { adminEmail, messageTitle, messageContent, targetRole });
    
    // 1. Créer le message
    const { data: message, error: messageError } = await supabase
      .from('teacher_messages')
      .insert({
        teacher_email: adminEmail,
        course_name: 'Message administratif',
        message_title: messageTitle,
        message_content: messageContent,
        target_type: 'broadcast'
      })
      .select()
      .single();

    if (messageError) {
      console.error('Erreur lors de la création du message:', messageError);
      throw messageError;
    }

    console.log('Message créé avec succès:', message);

    // 2. Récupérer les utilisateurs cibles selon le rôle
    let users: any[] = [];
    
    if (targetRole === 'all_students' || !targetRole) {
      // Récupérer tous les étudiants
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('email');
      
      if (studentsError) {
        console.error('Erreur lors de la récupération des étudiants:', studentsError);
        throw studentsError;
      }
      users = users.concat(students || []);
    }
    
    if (targetRole === 'all_teachers') {
      // Récupérer tous les enseignants
      const { data: teachers, error: teachersError } = await supabase
        .from('profiles')
        .select('email')
        .eq('role', 'teacher');
      
      if (teachersError) {
        console.error('Erreur lors de la récupération des enseignants:', teachersError);
        throw teachersError;
      }
      users = users.concat(teachers || []);
    }
    
    if (targetRole === 'all_admins') {
      // Récupérer tous les administrateurs
      const { data: admins, error: adminsError } = await supabase
        .from('profiles')
        .select('email')
        .eq('role', 'admin');
      
      if (adminsError) {
        console.error('Erreur lors de la récupération des administrateurs:', adminsError);
        throw adminsError;
      }
      users = users.concat(admins || []);
    }
    
    if (targetRole === 'all_users') {
      // Récupérer tous les utilisateurs (étudiants + enseignants + admins)
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('email');
      
      const { data: teachers, error: teachersError } = await supabase
        .from('profiles')
        .select('email')
        .eq('role', 'teacher');
      
      const { data: admins, error: adminsError } = await supabase
        .from('profiles')
        .select('email')
        .eq('role', 'admin');
      
      if (studentsError || teachersError || adminsError) {
        console.error('Erreur lors de la récupération des utilisateurs:', { studentsError, teachersError, adminsError });
        throw studentsError || teachersError || adminsError;
      }
      
      users = users.concat(students || [], teachers || [], admins || []);
    }

    console.log('Utilisateurs cibles trouvés:', users);

    // 3. Créer les notifications pour les étudiants
    if (users && users.length > 0) {
      const notifications = users.map(user => ({
        student_email: user.email,
        message_id: message.id
      }));

      const { error: notificationError } = await supabase
        .from('student_notifications')
        .insert(notifications);

      if (notificationError) {
        console.error('Erreur lors de la création des notifications:', notificationError);
        throw notificationError;
      }
    }

    console.log('Message envoyé avec succès à', users.length, 'utilisateurs');
    return { success: true, messageId: message.id, usersCount: users.length };
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message à tous les utilisateurs:', error);
    throw error;
  }
} 

// Fonction pour récupérer tous les devoirs disponibles
export async function getAllAssignments() {
  try {
    const { data: assignments, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('is_active', true)
      .order('due_date', { ascending: true });

    if (error) {
      throw error;
    }

    return assignments;
  } catch (error) {
    console.error('Erreur lors de la récupération des devoirs:', error);
    throw error;
  }
}

// Fonction pour récupérer les devoirs d'un cours spécifique
export async function getAssignmentsByCourse(courseName: string) {
  try {
    const { data: assignments, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('course', courseName)
      .eq('is_active', true)
      .order('due_date', { ascending: true });

    if (error) {
      throw error;
    }

    return assignments;
  } catch (error) {
    console.error('Erreur lors de la récupération des devoirs du cours:', error);
    throw error;
  }
} 

// Fonction pour récupérer les soumissions de devoirs par cours (pour les enseignants)
export async function getSubmissionsByCourse(courseName: string) {
  try {
    console.log('getSubmissionsByCourse - Recherche pour le cours:', courseName);
    
    // D'abord, récupérer les IDs des devoirs pour ce cours
    const { data: assignments, error: assignmentsError } = await supabase
      .from('assignments')
      .select('id')
      .eq('course', courseName);

    console.log('getSubmissionsByCourse - Devoirs trouvés:', assignments);

    if (assignmentsError) {
      throw assignmentsError;
    }

    if (!assignments || assignments.length === 0) {
      console.log('getSubmissionsByCourse - Aucun devoir trouvé pour ce cours');
      return [];
    }

    // Extraire les IDs des devoirs
    const assignmentIds = assignments.map(assignment => assignment.id);
    console.log('getSubmissionsByCourse - IDs des devoirs:', assignmentIds);

    // Ensuite, récupérer les soumissions pour ces devoirs
    const { data: submissions, error: submissionsError } = await supabase
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
      .in('assignment_id', assignmentIds)
      .order('submitted_at', { ascending: false });

    console.log('getSubmissionsByCourse - Soumissions trouvées:', submissions);

    if (submissionsError) {
      throw submissionsError;
    }

    return submissions;
  } catch (error) {
    console.error('Erreur lors de la récupération des soumissions par cours:', error);
    throw error;
  }
}

// Fonction pour récupérer les soumissions des cours assignés à un enseignant
export async function getSubmissionsForTeacher(teacherEmail: string) {
  try {
    console.log('getSubmissionsForTeacher - Recherche pour:', teacherEmail);
    
    // D'abord, récupérer les cours assignés à l'enseignant
    const { data: assignedCourses, error: coursesError } = await supabase
      .from('course_assignments')
      .select('course_name')
      .eq('teacher_email', teacherEmail)
      .eq('is_active', true);

    console.log('getSubmissionsForTeacher - Cours assignés:', assignedCourses);
    console.log('getSubmissionsForTeacher - Erreur cours:', coursesError);

    if (coursesError) {
      throw coursesError;
    }

    if (!assignedCourses || assignedCourses.length === 0) {
      console.log('getSubmissionsForTeacher - Aucun cours assigné');
      return [];
    }

    // Extraire les noms des cours
    const courseNames = assignedCourses.map(course => course.course_name);
    console.log('getSubmissionsForTeacher - Noms des cours:', courseNames);

    // Ensuite, récupérer les IDs des devoirs pour ces cours
    const { data: assignments, error: assignmentsError } = await supabase
      .from('assignments')
      .select('id')
      .in('course', courseNames);

    console.log('getSubmissionsForTeacher - Devoirs trouvés:', assignments);

    if (assignmentsError) {
      throw assignmentsError;
    }

    if (!assignments || assignments.length === 0) {
      console.log('getSubmissionsForTeacher - Aucun devoir trouvé pour ces cours');
      return [];
    }

    // Extraire les IDs des devoirs
    const assignmentIds = assignments.map(assignment => assignment.id);
    console.log('getSubmissionsForTeacher - IDs des devoirs:', assignmentIds);

    // Ensuite, récupérer les soumissions pour ces devoirs
    const { data: submissions, error: submissionsError } = await supabase
      .from('assignment_submissions')
      .select('*')
      .in('assignment_id', assignmentIds)
      .order('submitted_at', { ascending: false });

    console.log('getSubmissionsForTeacher - Soumissions trouvées:', submissions);

    if (submissionsError) {
      throw submissionsError;
    }

    // Récupérer les détails des devoirs séparément
    const { data: assignmentsDetails, error: assignmentsDetailsError } = await supabase
      .from('assignments')
      .select('*')
      .in('id', assignmentIds);

    console.log('getSubmissionsForTeacher - Détails des devoirs:', assignmentsDetails);

    if (assignmentsDetailsError) {
      throw assignmentsDetailsError;
    }

    // Récupérer les informations des étudiants
    const studentIds = submissions?.map(s => s.student_id) || [];
    const { data: studentsInfo, error: studentsError } = await supabase
      .from('students')
      .select('id, nom_complet, matricule, email')
      .in('id', studentIds);

    console.log('getSubmissionsForTeacher - Informations étudiants:', studentsInfo);

    if (studentsError) {
      console.error('Erreur lors de la récupération des informations étudiants:', studentsError);
    }

    // Combiner les soumissions avec les détails des devoirs et des étudiants
    const submissionsWithDetails = submissions?.map(submission => {
      const assignment = assignmentsDetails?.find(a => a.id === submission.assignment_id);
      const student = studentsInfo?.find(s => s.id === submission.student_id);
      return {
        ...submission,
        assignments: assignment,
        student: student
      };
    });

    console.log('getSubmissionsForTeacher - Soumissions avec détails:', submissionsWithDetails);

    return submissionsWithDetails || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des soumissions pour l\'enseignant:', error);
    throw error;
  }
}

// Fonction pour récupérer toutes les soumissions pour un enseignant (tous cours confondus)
export async function getAllSubmissionsForTeacher() {
  try {
    const { data: submissions, error } = await supabase
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
      .order('submitted_at', { ascending: false });

    if (error) {
      throw error;
    }

    return submissions;
  } catch (error) {
    console.error('Erreur lors de la récupération de toutes les soumissions:', error);
    throw error;
  }
}

// Fonction pour envoyer un message individuel à un utilisateur spécifique
export async function sendIndividualMessage(adminEmail: string, recipientEmail: string, messageTitle: string, messageContent: string) {
  try {
    console.log('Envoi de message individuel:', { adminEmail, recipientEmail, messageTitle, messageContent });
    
    // Vérifier d'abord si le destinataire existe
    const { data: recipient, error: recipientError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('email', recipientEmail)
      .single();
    
    if (recipientError && recipientError.code !== 'PGRST116') {
      console.error('Erreur lors de la vérification du destinataire:', recipientError);
      throw new Error('Destinataire non trouvé');
    }
    
    // Si le destinataire n'est pas dans profiles, vérifier dans students
    if (!recipient) {
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('id, email')
        .eq('email', recipientEmail)
        .single();
      
      if (studentError && studentError.code !== 'PGRST116') {
        console.error('Erreur lors de la vérification de l\'étudiant:', studentError);
        throw new Error('Destinataire non trouvé');
      }
      
      if (!student) {
        throw new Error('Destinataire non trouvé');
      }
    }
    
    // Insérer le message dans la table teacher_messages
    const { data: message, error: messageError } = await supabase
      .from('teacher_messages')
      .insert({
        teacher_email: adminEmail,
        course_name: null, // null pour les messages individuels
        message_title: messageTitle,
        message_content: messageContent,
        target_type: 'individual',
        target_email: recipientEmail,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (messageError) {
      console.error('Erreur lors de l\'insertion du message:', messageError);
      throw messageError;
    }
    
    // Créer une notification pour le destinataire
    const { error: notificationError } = await supabase
      .from('student_notifications')
      .insert({
        student_email: recipientEmail,
        message_id: message.id
      });
    
    if (notificationError) {
      console.error('Erreur lors de la création de la notification:', notificationError);
      // Ne pas faire échouer l'envoi du message si la notification échoue
    }
    
    console.log('Message individuel envoyé avec succès:', message);
    return message;
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message individuel:', error);
    throw error;
  }
}

// Fonction pour récupérer toutes les soumissions (pour les admins)
export async function getAllSubmissions() {
  try {
    console.log('getAllSubmissions - Début de la récupération...');
    
    // Récupérer d'abord toutes les soumissions avec les détails des devoirs
    const { data: submissions, error } = await supabase
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
      .order('submitted_at', { ascending: false });

    console.log('getAllSubmissions - Soumissions récupérées:', submissions);
    console.log('getAllSubmissions - Erreur éventuelle:', error);

    if (error) {
      throw error;
    }

    // Récupérer les informations des étudiants
    const studentIds = submissions?.map(s => s.student_id) || [];
    console.log('getAllSubmissions - IDs étudiants à récupérer:', studentIds);
    
    const { data: studentsInfo, error: studentsError } = await supabase
      .from('students')
      .select('id, nom_complet, matricule, email')
      .in('id', studentIds);

    console.log('getAllSubmissions - Informations étudiants:', studentsInfo);
    console.log('getAllSubmissions - Erreur étudiants:', studentsError);

    if (studentsError) {
      console.error('Erreur lors de la récupération des informations étudiants:', studentsError);
    }

    // Combiner les soumissions avec les détails des étudiants
    const submissionsWithDetails = submissions?.map(submission => {
      const student = studentsInfo?.find(s => s.id === submission.student_id);
      return {
        ...submission,
        students: student
      };
    });

    console.log('getAllSubmissions - Soumissions avec détails:', submissionsWithDetails);

    return submissionsWithDetails || [];
  } catch (error) {
    console.error('Erreur lors de la récupération de toutes les soumissions:', error);
    throw error;
  }
} 