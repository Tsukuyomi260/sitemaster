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
    const { data: courses, error } = await supabase
      .from('course_assignments')
      .select(`
        *,
        teachers:profiles(email, role)
      `)
      .order('course_name', { ascending: true });
    
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

// Bloquer/Débloquer un utilisateur
export async function toggleUserBlock(userId: string, blocked: boolean) {
  try {
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { blocked }
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erreur lors du changement de statut utilisateur:', error);
    throw error;
  }
}

// Envoyer un message à tous les utilisateurs (fonctionnalité admin)
export async function sendMessageToAllUsers(adminEmail: string, messageTitle: string, messageContent: string, targetRole?: string) {
  try {
    // 1. Créer le message
    const { data: message, error: messageError } = await supabase
      .from('teacher_messages')
      .insert({
        teacher_email: adminEmail,
        course_name: 'Message administratif',
        message_title: messageTitle,
        message_content: messageContent
      })
      .select()
      .single();

    if (messageError) throw messageError;

    // 2. Récupérer les utilisateurs cibles
    let usersQuery = supabase.from('students').select('email');
    
    if (targetRole) {
      usersQuery = supabase.from('profiles').select('email').eq('role', targetRole);
    }

    const { data: users, error: usersError } = await usersQuery;
    if (usersError) throw usersError;

    // 3. Créer les notifications
    if (users && users.length > 0) {
      const notifications = users.map(user => ({
        student_email: user.email,
        message_id: message.id
      }));

      const { error: notificationError } = await supabase
        .from('student_notifications')
        .insert(notifications);

      if (notificationError) throw notificationError;
    }

    return { success: true, messageId: message.id, usersCount: users?.length || 0 };
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