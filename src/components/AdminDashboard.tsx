import React, { useState, useEffect } from 'react';
import { 
  User, 
  BookOpen, 
  ClipboardCheck, 
  LogOut, 
  Bell, 
  Settings, 
  ChevronUp, 
  Users, 
  Shield, 
  GraduationCap, 
  BarChart3, 
  Plus,
  Trash2,
  Edit,
  Eye,
  Download,
  Send,
  Filter,
  Search,
  RefreshCw,
  Crown,
  FileText,
  X
} from 'lucide-react';
import { 
  getAllStudents, 
  getAllSubmissions, 
  getAllAdmins,
  getAllTeachers,
  getAllCoursesByMaster,
  getGlobalStats,
  createAdmin,
  createTeacher,
  assignCourseToTeacher,
  removeCourseAssignment,
  toggleUserBlock,
  sendMessageToAllUsers,
  sendIndividualMessage,
  promoteStudent,
  demoteStudent,
  getStudentsWithStudyYear
} from '../api';

interface AdminDashboardProps {
  adminName: string;
  onLogout: () => void;
}

// Interface pour les étudiants
interface Student {
  id: number;
  matricule: string;
  nom_complet: string;
  email: string;
  sexe: string;
  niveau: string;
  annee_academique: string;
  study_year?: number; // Année d'étude (1 pour 1ère année, 2 pour 2ème année)
  blocked?: boolean;
}

// Interface pour les administrateurs
interface Admin {
  id: string;
  email: string;
  role: string;
  created_at: string;
  blocked?: boolean;
}

// Interface pour les enseignants
interface Teacher {
  id: string;
  email: string;
  role: string;
  created_at: string;
  blocked?: boolean;
}

// Interface pour les cours assignés
interface CourseAssignment {
  id: number;
  teacher_email: string;
  course_name: string;
  created_at?: string;
  is_active: boolean;
  teachers?: {
    email: string;
    role: string;
  };
}

// Interface pour les soumissions de devoirs
interface AssignmentSubmission {
  id: number;
  assignment_id: number;
  student_id: string;
  file_url: string;
  file_name: string;
  submitted_at: string;
  comments: string;
  status: string;
  assignments: {
    title: string;
    course: string;
    due_date: string;
    points: number;
  };
  students: {
    nom_complet: string;
    email: string;
    matricule: string;
  };
}

// Interface pour les statistiques globales
interface GlobalStats {
  studentsCount: number;
  teachersCount: number;
  adminsCount: number;
  submissionsCount: number;
}
const fakeCourses = [
  { id: 1, name: "01 S1 PSYCHOPEDAGOGIE DE L'ENFANT ET DE L'ADOLESCENT" },
  { id: 2, name: "02 S1 PSYCHOLOGIE DE L'APPRENTISSAGE" },
  { id: 3, name: "03 S1 ADMINISTRATION DES ETABLISSEMENTS D'EFTP ET GPEC EN EFTP" },
];
const fakeNotifications = [
  { id: 1, message: 'Réunion importante demain à 10h', target: 'all' },
  { id: 2, message: 'Merci de rendre vos devoirs à temps', target: 'students' },
];

export default function AdminDashboard({ adminName, onLogout }: AdminDashboardProps) {
  // États principaux
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Données
  const [students, setStudents] = useState<Student[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courseAssignments, setCourseAssignments] = useState<CourseAssignment[]>([]);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStats>({
    studentsCount: 0,
    teachersCount: 0,
    adminsCount: 0,
    submissionsCount: 0
  });

  // États de chargement
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);

  // Filtres et recherche
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudentAnnee, setSelectedStudentAnnee] = useState('');
  const [selectedStudentNiveau, setSelectedStudentNiveau] = useState('');
  const [adminSearch, setAdminSearch] = useState('');
  const [teacherSearch, setTeacherSearch] = useState('');
  const [courseSearch, setCourseSearch] = useState('');
  const [submissionSearch, setSubmissionSearch] = useState('');

  // États pour les modals et formulaires
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [showCreateTeacherModal, setShowCreateTeacherModal] = useState(false);
  const [showAssignCourseModal, setShowAssignCourseModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Formulaires
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newTeacherEmail, setNewTeacherEmail] = useState('');
  const [newTeacherPassword, setNewTeacherPassword] = useState('');
  const [selectedTeacherForCourse, setSelectedTeacherForCourse] = useState('');
  const [selectedCourseForAssignment, setSelectedCourseForAssignment] = useState('');
  const [messageTitle, setMessageTitle] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [messageTarget, setMessageTarget] = useState('all');
  const [messageRecipientSearch, setMessageRecipientSearch] = useState('');
  const [showRecipientSuggestions, setShowRecipientSuggestions] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<null | { email: string; name: string; role: string }>(null);
  const [messageType, setMessageType] = useState<'broadcast' | 'individual'>('broadcast');

  // États pour la gestion de la promotion
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [selectedStudentForPromotion, setSelectedStudentForPromotion] = useState<Student | null>(null);
  const [promotionLoading, setPromotionLoading] = useState(false);
  const [promotionInBatch, setPromotionInBatch] = useState<string[]>([]);
  // Charger toutes les données au montage du composant
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        
        // Charger les statistiques globales
        const stats = await getGlobalStats();
        setGlobalStats(stats);
        
        // Charger les étudiants avec année d'étude
        const studentsData = await getStudentsWithStudyYear();
        setStudents(studentsData || []);
        
        // Charger les administrateurs
        const adminsData = await getAllAdmins();
        setAdmins(adminsData || []);
        
        // Charger les enseignants
        const teachersData = await getAllTeachers();
        setTeachers(teachersData || []);
        
        // Charger les cours assignés
        const coursesData = await getAllCoursesByMaster();
        setCourseAssignments(coursesData || []);
        
        // Charger les soumissions de devoirs
        console.log('Chargement des soumissions de devoirs...');
        const submissionsData = await getAllSubmissions();
        console.log('Données des soumissions reçues:', submissionsData);
        setSubmissions(submissionsData || []);
        console.log('État submissions mis à jour:', submissionsData || []);
        
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  // Effet pour logger les changements de courseAssignments
  useEffect(() => {
    console.log('État courseAssignments mis à jour:', courseAssignments);
    console.log('Nombre de cours assignés:', courseAssignments.length);
  }, [courseAssignments]);

  // Effet pour fermer les suggestions quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.recipient-search-container')) {
        setShowRecipientSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fonctions de rechargement spécifiques
  const reloadStudents = async () => {
    try {
      setStudentsLoading(true);
      const studentsData = await getStudentsWithStudyYear();
      setStudents(studentsData || []);
    } catch (error) {
      console.error('Erreur lors du rechargement des étudiants:', error);
    } finally {
      setStudentsLoading(false);
    }
  };

  const reloadAdmins = async () => {
    try {
      setAdminsLoading(true);
      const adminsData = await getAllAdmins();
      setAdmins(adminsData || []);
    } catch (error) {
      console.error('Erreur lors du rechargement des administrateurs:', error);
    } finally {
      setAdminsLoading(false);
    }
  };

  const reloadTeachers = async () => {
    try {
      setTeachersLoading(true);
      const teachersData = await getAllTeachers();
      setTeachers(teachersData || []);
    } catch (error) {
      console.error('Erreur lors du rechargement des enseignants:', error);
    } finally {
      setTeachersLoading(false);
    }
  };

  const reloadCourses = async () => {
    try {
      setCoursesLoading(true);
      console.log('Rechargement des cours assignés...');
      const coursesData = await getAllCoursesByMaster();
      console.log('Données des cours reçues:', coursesData);
      setCourseAssignments(coursesData || []);
      console.log('État courseAssignments mis à jour:', coursesData || []);
    } catch (error) {
      console.error('Erreur lors du rechargement des cours:', error);
    } finally {
      setCoursesLoading(false);
    }
  };

  const reloadSubmissions = async () => {
    try {
      setSubmissionsLoading(true);
      console.log('Rechargement des soumissions...');
      const submissionsData = await getAllSubmissions();
      console.log('Données des soumissions reçues:', submissionsData);
      setSubmissions(submissionsData || []);
    } catch (error) {
      console.error('Erreur lors du rechargement des soumissions:', error);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  // Obtenir les années académiques uniques
  const anneesAcademiques = Array.from(new Set(students.map(s => s.annee_academique))).filter(Boolean);
  
  // Obtenir les niveaux uniques
  const niveaux = Array.from(new Set(students.map(s => s.niveau))).filter(Boolean);

  // Obtenir les cours uniques pour les soumissions
  const submissionCourses = Array.from(new Set(submissions.map(s => s.assignments?.course))).filter(Boolean);

  // Filtrer les soumissions selon la recherche
  const filteredSubmissions = submissions.filter(submission => {
    const searchLower = submissionSearch.toLowerCase();
    return (
      submission.students?.nom_complet?.toLowerCase().includes(searchLower) ||
      submission.students?.matricule?.toLowerCase().includes(searchLower) ||
      submission.assignments?.title?.toLowerCase().includes(searchLower) ||
      submission.assignments?.course?.toLowerCase().includes(searchLower) ||
      submission.file_name?.toLowerCase().includes(searchLower)
    );
  });

  // Effet pour logger les changements de submissions
  useEffect(() => {
    console.log('État submissions mis à jour:', submissions);
    console.log('Nombre de soumissions:', submissions.length);
    console.log('État filteredSubmissions:', filteredSubmissions);
    console.log('Nombre de soumissions filtrées:', filteredSubmissions.length);
  }, [submissions, filteredSubmissions]);

  const filteredStudents = students.filter(student => {
    const matchAnnee = selectedStudentAnnee ? student.annee_academique === selectedStudentAnnee : true;
    const matchNiveau = selectedStudentNiveau ? student.niveau === selectedStudentNiveau : true;
    const matchSearch = studentSearch ? (
      student.nom_complet.toLowerCase().includes(studentSearch.toLowerCase()) ||
      student.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
      student.matricule.toLowerCase().includes(studentSearch.toLowerCase())
    ) : true;
    return matchAnnee && matchNiveau && matchSearch;
  });

  // Fonctions de gestion des utilisateurs
  const handleCreateAdmin = async () => {
    try {
      await createAdmin(newAdminEmail, newAdminPassword);
      setNewAdminEmail('');
      setNewAdminPassword('');
      setShowCreateAdminModal(false);
      reloadAdmins();
      // Mettre à jour les stats
      const stats = await getGlobalStats();
      setGlobalStats(stats);
    } catch (error) {
      console.error('Erreur lors de la création de l\'administrateur:', error);
    }
  };

  const handleCreateTeacher = async () => {
    try {
      await createTeacher(newTeacherEmail, newTeacherPassword);
      setNewTeacherEmail('');
      setNewTeacherPassword('');
      setShowCreateTeacherModal(false);
      reloadTeachers();
      // Mettre à jour les stats
      const stats = await getGlobalStats();
      setGlobalStats(stats);
    } catch (error) {
      console.error('Erreur lors de la création de l\'enseignant:', error);
    }
  };

  const handleAssignCourse = async () => {
    try {
      await assignCourseToTeacher(selectedTeacherForCourse, selectedCourseForAssignment);
      setSelectedTeacherForCourse('');
      setSelectedCourseForAssignment('');
      setShowAssignCourseModal(false);
      reloadCourses();
    } catch (error) {
      console.error('Erreur lors de l\'assignation du cours:', error);
    }
  };

  const handleRemoveCourseAssignment = async (assignmentId: number) => {
    try {
      await removeCourseAssignment(assignmentId);
      reloadCourses();
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'assignation:', error);
    }
  };

  const handleToggleUserBlock = async (userId: string, blocked: boolean) => {
    try {
      console.log('handleToggleUserBlock appelé avec:', { userId, blocked });
      await toggleUserBlock(userId, blocked);
      console.log('toggleUserBlock réussi');
      
      // Recharger les données appropriées
      reloadStudents();
      reloadAdmins();
      reloadTeachers();
    } catch (error) {
      console.error('Erreur lors du changement de statut utilisateur:', error);
      throw error; // Propager l'erreur pour l'afficher
    }
  };

  const handleSendMessage = async () => {
    try {
      console.log('handleSendMessage appelé avec:', {
        messageType,
        messageTitle,
        messageContent,
        messageTarget,
        selectedRecipient
      });

      if (messageType === 'broadcast') {
        // Message de diffusion
        console.log('Envoi de message de diffusion...');
        await sendMessageToAllUsers(adminName, messageTitle, messageContent, messageTarget);
        console.log('Message de diffusion envoyé avec succès');
      } else {
        // Message individuel
        console.log('Envoi de message individuel...');
        if (!selectedRecipient) {
          alert('Veuillez sélectionner un destinataire');
          return;
        }
        // Pour les messages individuels, nous utiliserons une fonction différente
        // qui enverra le message à un utilisateur spécifique
        await sendIndividualMessage(adminName, selectedRecipient.email, messageTitle, messageContent);
        console.log('Message individuel envoyé avec succès');
      }
      
      // Réinitialiser le formulaire
      setMessageTitle('');
      setMessageContent('');
      setMessageTarget('all');
      setMessageType('broadcast');
      setSelectedRecipient(null);
      setMessageRecipientSearch('');
      setShowMessageModal(false);
      
      alert('Message envoyé avec succès !');
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      alert('Erreur lors de l\'envoi du message: ' + error);
    }
  };

  const handleBlockStudent = async (student: Student) => {
    try {
      console.log('Tentative de blocage/déblocage pour l\'étudiant:', student);
      console.log('ID étudiant:', student.id, 'Type:', typeof student.id);
      console.log('Statut actuel blocked:', student.blocked);
      
      await handleToggleUserBlock(student.id.toString(), !student.blocked);
      console.log('Blocage/déblocage réussi');
      
      // Recharger les étudiants pour avoir les données à jour
      reloadStudents();
    } catch (error) {
      console.error('Erreur lors du blocage/déblocage de l\'étudiant:', error);
      alert('Erreur lors du blocage/déblocage: ' + error);
    }
  };

  const loadSubmissions = async () => {
    try {
      setSubmissionsLoading(true);
      const submissionsData = await getAllSubmissions();
      setSubmissions(submissionsData || []);
    } catch (error) {
      console.error('Erreur lors du chargement des soumissions:', error);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const handleDownloadSubmission = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Fonctions de gestion de la promotion
  const handlePromoteStudent = async (student: Student) => {
    try {
      setPromotionLoading(true);
      const result = await promoteStudent(student.email);
      alert(result);
      reloadStudents(); // Recharger la liste des étudiants
    } catch (error) {
      console.error('Erreur lors de la promotion:', error);
      alert('Erreur lors de la promotion: ' + error);
    } finally {
      setPromotionLoading(false);
    }
  };

  const handleDemoteStudent = async (student: Student) => {
    try {
      setPromotionLoading(true);
      const result = await demoteStudent(student.email);
      alert(result);
      reloadStudents(); // Recharger la liste des étudiants
    } catch (error) {
      console.error('Erreur lors de la rétrogradation:', error);
      alert('Erreur lors de la rétrogradation: ' + error);
    } finally {
      setPromotionLoading(false);
    }
  };

  const handlePromoteSelectedStudents = async () => {
    if (promotionInBatch.length === 0) {
      alert('Veuillez sélectionner au moins un étudiant à promouvoir');
      return;
    }

    try {
      setPromotionLoading(true);
      const results = await Promise.all(
        promotionInBatch.map(email => promoteStudent(email))
      );
      
      alert(`Promotion effectuée pour ${promotionInBatch.length} étudiant(s)`);
      reloadStudents();
      setPromotionInBatch([]);
    } catch (error) {
      console.error('Erreur lors de la promotion en lot:', error);
      alert('Erreur lors de la promotion en lot: ' + error);
    } finally {
      setPromotionLoading(false);
    }
  };
  // Gestion du scroll pour le bouton "retour en haut"
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  const handleDeleteCourse = (id: number) => {
    // Cette fonction sera implémentée plus tard
    console.log('Suppression du cours:', id);
  };
  const handleAddCourse = () => {
    // Cette fonction sera implémentée plus tard
    console.log('Ajout du cours');
  };
  const handleAddNotification = () => {
    // Cette fonction sera implémentée plus tard
    console.log('Ajout de notification');
  };
  const handleDeleteNotification = (id: number) => {
    // Cette fonction sera implémentée plus tard
    console.log('Suppression de notification:', id);
  };

  // Fonction pour tronquer les noms de fichiers
  const truncateFileName = (fileName: string, maxLength: number = 30) => {
    if (fileName.length <= maxLength) return fileName;
    const extension = fileName.split('.').pop();
    const nameWithoutExtension = fileName.substring(0, fileName.lastIndexOf('.'));
    const truncatedName = nameWithoutExtension.substring(0, maxLength - 3);
    return `${truncatedName}...${extension ? '.' + extension : ''}`;
  };

  // Fonction pour obtenir tous les destinataires possibles
  const getAllRecipients = () => {
    const recipients: { email: string; name: string; role: string }[] = [];
    
    // Ajouter les étudiants
    students.forEach(student => {
      recipients.push({
        email: student.email,
        name: student.nom_complet,
        role: 'Étudiant'
      });
    });
    
    // Ajouter les enseignants
    teachers.forEach(teacher => {
      recipients.push({
        email: teacher.email,
        name: teacher.email, // Les enseignants n'ont que l'email
        role: 'Enseignant'
      });
    });
    
    // Ajouter les administrateurs
    admins.forEach(admin => {
      recipients.push({
        email: admin.email,
        name: admin.email, // Les admins n'ont que l'email
        role: 'Administrateur'
      });
    });
    
    return recipients;
  };

  // Filtrer les destinataires selon la recherche
  const filteredRecipients = getAllRecipients().filter(recipient =>
    recipient.email.toLowerCase().includes(messageRecipientSearch.toLowerCase()) ||
    recipient.name.toLowerCase().includes(messageRecipientSearch.toLowerCase())
  );

  // Fonction pour sélectionner un destinataire
  const selectRecipient = (recipient: { email: string; name: string; role: string }) => {
    setSelectedRecipient(recipient);
    setMessageRecipientSearch(recipient.email);
    setShowRecipientSuggestions(false);
  };

  // Gérer la fermeture des suggestions quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.recipient-search-container')) {
        setShowRecipientSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [notificationStudentSearch, setNotificationStudentSearch] = useState('');
  const [showStudentSuggestions, setShowStudentSuggestions] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<null | Student>(null);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      {/* Sidebar navigation moderne - FIXE */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-slate-800 shadow-lg border-r border-slate-200 dark:border-slate-700 flex-col justify-between hidden md:flex z-50">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center bg-white shadow-lg border border-slate-200">
              <img src="/logo-enset.png" alt="Logo ENSET-MASTERS" className="object-contain w-full h-full" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 dark:text-white text-lg">ENSET-MASTERS</h1>
              <div className="flex items-center space-x-2">
                <p className="text-xs text-slate-600 dark:text-slate-400">Espace</p>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500 to-blue-600 text-white">
                  <Crown className="w-3 h-3 mr-1" />
                  Super Admin
                </span>
            </div>
          </div>
          </div>
          
          {/* Navigation principale */}
          <nav className="space-y-2">
            <button 
              onClick={() => setActiveTab('overview')} 
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 font-medium ${
                activeTab === 'overview' 
                  ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg' 
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:shadow-md'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span>Vue d'ensemble</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('students')} 
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 font-medium ${
                activeTab === 'students' 
                  ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg' 
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:shadow-md'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Étudiants</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('admins')} 
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 font-medium ${
                activeTab === 'admins' 
                  ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg' 
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:shadow-md'
              }`}
            >
              <Shield className="w-5 h-5" />
              <span>Administrateurs</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('teachers')} 
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 font-medium ${
                activeTab === 'teachers' 
                  ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg' 
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:shadow-md'
              }`}
            >
              <GraduationCap className="w-5 h-5" />
              <span>Enseignants</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('courses')} 
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 font-medium ${
                activeTab === 'courses' 
                  ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg' 
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:shadow-md'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span>Cours assignés</span>
            </button>
            
            <button 
              onClick={() => { setActiveTab('submissions'); loadSubmissions(); }} 
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 font-medium ${
                activeTab === 'submissions' 
                  ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg' 
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:shadow-md'
              }`}
            >
              <ClipboardCheck className="w-5 h-5" />
              <span>Devoirs rendus</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('messages')} 
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 font-medium ${
                activeTab === 'messages' 
                  ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg' 
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:shadow-md'
              }`}
            >
              <Send className="w-5 h-5" />
              <span>Messages</span>
            </button>
          </nav>
          
          {/* Raccourcis rapides */}
          <div className="mt-6 space-y-2">
            <button 
              onClick={() => setShowProfileModal(true)}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 font-medium"
            >
              <Settings className="w-5 h-5" />
              <span>Mon profil</span>
            </button>
          </div>
        </div>
        <div className="p-6 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <p className="font-semibold text-slate-900 dark:text-white truncate">{adminName}</p>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-sm">
                  Super Admin
                </span>
            </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">Administrateur central</p>
          </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200 font-medium">
            <LogOut className="w-4 h-4" />
            <span>Se déconnecter</span>
          </button>
        </div>
      </div>
      {/* Top nav Apple-style (visible sur mobile) */}
      <nav className="sticky top-0 z-30 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 md:px-8 py-3 shadow-sm md:hidden">
        <div className="flex items-center gap-1 lg:gap-2 overflow-x-auto scrollbar-hide flex-1 mr-4">
          <button onClick={() => setActiveTab('overview')} className={`px-3 py-2 rounded-full text-xs lg:text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${activeTab === 'overview' ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>Vue d'ensemble</button>
          <button onClick={() => setActiveTab('students')} className={`px-3 py-2 rounded-full text-xs lg:text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${activeTab === 'students' ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>Étudiants</button>
          <button onClick={() => setActiveTab('admins')} className={`px-3 py-2 rounded-full text-xs lg:text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${activeTab === 'admins' ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>Admins</button>
          <button onClick={() => setActiveTab('teachers')} className={`px-3 py-2 rounded-full text-xs lg:text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${activeTab === 'teachers' ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>Enseignants</button>
          <button onClick={() => setActiveTab('courses')} className={`px-3 py-2 rounded-full text-xs lg:text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${activeTab === 'courses' ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>Cours</button>
          <button onClick={() => { setActiveTab('submissions'); loadSubmissions(); }} className={`px-3 py-2 rounded-full text-xs lg:text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${activeTab === 'submissions' ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>Devoirs</button>
          <button onClick={() => setActiveTab('messages')} className={`px-3 py-2 rounded-full text-xs lg:text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${activeTab === 'messages' ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>Messages</button>
        </div>
        
        {/* Raccourcis en haut à droite */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowProfileModal(true)}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            title="Mon profil"
          >
            <Settings className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </button>
          <button 
            onClick={onLogout}
            className="p-2 rounded-full bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
            title="Se déconnecter"
          >
            <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
          </button>
        </div>
      </nav>
      <div className="flex-1 p-4 md:p-8 md:ml-64">
        {/* Vue d'ensemble */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* En-tête avec titre et actions rapides */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">Vue d'ensemble</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2">Tableau de bord du Super Administrateur</p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={() => setShowCreateAdminModal(true)}
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl hover:from-purple-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl text-sm lg:text-base"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nouvel Admin</span>
                </button>
                <button
                  onClick={() => setShowCreateTeacherModal(true)}
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl text-sm lg:text-base"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nouvel Enseignant</span>
                </button>
              </div>
            </div>

            {/* Cartes de statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Étudiants */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Étudiants</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{globalStats.studentsCount}</p>
                    <p className="text-xs text-slate-500 mt-1">Inscrits actuellement</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              {/* Enseignants */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Enseignants</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{globalStats.teachersCount}</p>
                    <p className="text-xs text-slate-500 mt-1">Actifs sur la plateforme</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              {/* Administrateurs */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Administrateurs</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{globalStats.adminsCount}</p>
                    <p className="text-xs text-slate-500 mt-1">Accès complet</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              {/* Devoirs rendus */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Devoirs rendus</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{globalStats.submissionsCount}</p>
                    <p className="text-xs text-slate-500 mt-1">Soumissions totales</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                    <ClipboardCheck className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Actions rapides</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowAssignCourseModal(true)}
                    className="w-full flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                  >
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium">Assigner un cours</span>
                  </button>
                  <button
                    onClick={() => {
                      console.log('Bouton Messages cliqué, ouverture du modal...');
                      console.log('État showMessageModal avant:', showMessageModal);
                      setShowMessageModal(true);
                      console.log('État showMessageModal après setShowMessageModal(true)');
                    }}
                    className="w-full flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                  >
                    <Send className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium">Envoyer un message</span>
                  </button>
                  

                  <button
                    onClick={() => setActiveTab('submissions')}
                    className="w-full flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                  >
                    <ClipboardCheck className="w-5 h-5 text-orange-600" />
                    <span className="text-sm font-medium">Voir les devoirs</span>
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Navigation rapide</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setActiveTab('students')}
                    className="w-full flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                  >
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium">Gérer les étudiants</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('teachers')}
                    className="w-full flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                  >
                    <GraduationCap className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium">Gérer les enseignants</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('courses')}
                    className="w-full flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                  >
                    <BookOpen className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium">Cours assignés</span>
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Statut système</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">Système opérationnel</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Base de données connectée</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-400">Authentification active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section Gestion des Administrateurs */}
        {activeTab === 'admins' && (
          <div className="space-y-6">
            {/* En-tête */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Gestion des Administrateurs</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2">Gérez tous les administrateurs de la plateforme</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={reloadAdmins}
                  disabled={adminsLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200"
                >
                  <RefreshCw className={`w-4 h-4 ${adminsLoading ? 'animate-spin' : ''}`} />
                  <span>Actualiser</span>
                </button>
                <button
                  onClick={() => setShowCreateAdminModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl hover:from-purple-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nouvel Admin</span>
                </button>
              </div>
            </div>

            {/* Filtres et recherche */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Rechercher un administrateur..."
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                  <Search className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Liste des administrateurs */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Administrateurs ({admins.filter(admin => 
                    admin.email.toLowerCase().includes(adminSearch.toLowerCase())
                  ).length})
                </h3>
              </div>
              
              {adminsLoading ? (
                <div className="p-8 text-center">
                  <div className="inline-flex items-center space-x-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-purple-600" />
                    <span className="text-slate-600 dark:text-slate-400">Chargement des administrateurs...</span>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Administrateur
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Rôle
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Date de création
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                      {admins
                        .filter(admin => admin.email.toLowerCase().includes(adminSearch.toLowerCase()))
                        .map((admin, index) => (
                          <tr key={admin.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                                  <Shield className="w-5 h-5 text-white" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-slate-900 dark:text-white">
                                    {admin.email.length > 30 ? `${admin.email.substring(0, 30)}...` : admin.email}
                                  </div>
                                  <div className="text-sm text-slate-500 dark:text-slate-400">
                                    ID: {admin.id.substring(0, 8)}...
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                                <Crown className="w-3 h-3 mr-1" />
                                {admin.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                              {new Date(admin.created_at).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedUser(admin);
                                    setShowUserProfileModal(true);
                                  }}
                                  className="flex items-center space-x-1 px-3 py-1.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                                >
                                  <Eye className="w-4 h-4" />
                                  <span>Voir</span>
                                </button>
                                <button
                                  onClick={() => handleToggleUserBlock(admin.id, !admin.blocked)}
                                  className="flex items-center space-x-1 px-3 py-1.5 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span>Bloquer</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  
                  {admins.filter(admin => admin.email.toLowerCase().includes(adminSearch.toLowerCase())).length === 0 && (
                    <div className="p-8 text-center">
                      <Shield className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-500 dark:text-slate-400">Aucun administrateur trouvé</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 mb-8">
            <h2 className="text-xl font-semibold mb-4">Liste de tous les étudiants ({filteredStudents.length})</h2>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                <span className="ml-2 text-slate-600">Chargement des étudiants...</span>
              </div>
            ) : (
              <>
            {/* Filtres et recherche */}
            <div className="flex flex-wrap gap-4 mb-6 items-center">
              <input
                type="text"
                    placeholder="Rechercher par nom, email ou matricule..."
                value={studentSearch}
                onChange={e => setStudentSearch(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm flex-1 min-w-[200px]"
                  />
              <select
                value={selectedStudentAnnee}
                onChange={e => setSelectedStudentAnnee(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="">Toutes les années</option>
                    {anneesAcademiques.map(annee => (
                      <option key={annee} value={annee}>{annee}</option>
                ))}
              </select>
              <select
                    value={selectedStudentNiveau}
                    onChange={e => setSelectedStudentNiveau(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                    <option value="">Tous les niveaux</option>
                    {niveaux.map(niveau => (
                      <option key={niveau} value={niveau}>{niveau}</option>
                ))}
              </select>
            </div>
                
                {/* Liste des étudiants */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Matricule</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Nom complet</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Email</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Niveau</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Année</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
              {filteredStudents.map(student => (
                        <tr key={student.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4 text-sm font-mono text-slate-600">{student.matricule}</td>
                          <td className="py-3 px-4 font-medium text-slate-900">{student.nom_complet}</td>
                          <td className="py-3 px-4 text-sm text-slate-600">{student.email}</td>
                          <td className="py-3 px-4 text-sm text-slate-600">{student.niveau}</td>
                          <td className="py-3 px-4 text-sm text-slate-600">{student.annee_academique}</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => setSelectedProfile(student)} 
                                className="text-xs text-blue-600 hover:underline"
                              >
                                Voir profil
                              </button>
                              <button 
                                onClick={() => handleBlockStudent(student)} 
                                className={`text-xs rounded px-2 py-1 ${
                                  student.blocked ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                                } hover:bg-red-200 transition-all`}
                              >
                                {student.blocked ? 'Débloquer' : 'Bloquer'}
                              </button>
                  </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {filteredStudents.length === 0 && !loading && (
                  <div className="text-center py-8 text-slate-500">
                    Aucun étudiant trouvé avec les critères sélectionnés.
                  </div>
                )}
              </>
            )}
            {/* Modal profil étudiant */}
            {selectedProfile && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md relative">
                  <button onClick={() => setSelectedProfile(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 text-xl">&times;</button>
                  <h3 className="text-lg font-bold mb-4">Profil de l'étudiant</h3>
                  <div className="space-y-3">
                    <div><span className="font-semibold">Matricule :</span> <span className="font-mono">{selectedProfile.matricule}</span></div>
                    <div><span className="font-semibold">Nom complet :</span> {selectedProfile.nom_complet}</div>
                    <div><span className="font-semibold">Email :</span> {selectedProfile.email}</div>
                    <div><span className="font-semibold">Sexe :</span> {selectedProfile.sexe}</div>
                    <div><span className="font-semibold">Niveau :</span> {selectedProfile.niveau}</div>
                    <div><span className="font-semibold">Année académique :</span> {selectedProfile.annee_academique}</div>
                    <div><span className="font-semibold">Statut :</span> 
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${
                        selectedProfile.blocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {selectedProfile.blocked ? 'Bloqué' : 'Actif'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'teachers' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Gestion des Enseignants</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Liste de tous les enseignants de la plateforme</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={reloadTeachers}
                  disabled={teachersLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${teachersLoading ? 'animate-spin' : ''}`} />
                  <span>Actualiser</span>
                </button>
                <button
                  onClick={() => setShowCreateTeacherModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nouvel Enseignant</span>
                </button>
              </div>
            </div>

            {/* Recherche */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher un enseignant..."
                  value={teacherSearch}
                  onChange={(e) => setTeacherSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
                <Search className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
              </div>
            </div>

            {/* Liste des enseignants */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Enseignants ({teachers.filter(teacher => 
                    teacher.email.toLowerCase().includes(teacherSearch.toLowerCase())
                  ).length})
                </h3>
              </div>
              
              {teachersLoading ? (
                <div className="p-8 text-center">
                  <div className="inline-flex items-center space-x-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-green-600" />
                    <span className="text-slate-600 dark:text-slate-400">Chargement des enseignants...</span>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Enseignant
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Rôle
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Date de création
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                      {teachers
                        .filter(teacher => teacher.email.toLowerCase().includes(teacherSearch.toLowerCase()))
                        .map((teacher, index) => (
                          <tr key={teacher.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                                  <GraduationCap className="w-5 h-5 text-white" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-slate-900 dark:text-white">
                                    {teacher.email.length > 30 ? `${teacher.email.substring(0, 30)}...` : teacher.email}
                                  </div>
                                  <div className="text-sm text-slate-500 dark:text-slate-400">
                                    ID: {teacher.id.substring(0, 8)}...
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                                <GraduationCap className="w-3 h-3 mr-1" />
                                {teacher.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                              {new Date(teacher.created_at).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedUser(teacher);
                                    setShowUserProfileModal(true);
                                  }}
                                  className="flex items-center space-x-1 px-3 py-1.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                                >
                                  <Eye className="w-4 h-4" />
                                  <span>Voir</span>
                                </button>
                                <button
                                  onClick={() => handleToggleUserBlock(teacher.id, !teacher.blocked)}
                                  className="flex items-center space-x-1 px-3 py-1.5 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span>Bloquer</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  
                  {teachers.filter(teacher => teacher.email.toLowerCase().includes(teacherSearch.toLowerCase())).length === 0 && (
                    <div className="p-8 text-center">
                      <GraduationCap className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-500 dark:text-slate-400">Aucun enseignant trouvé</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="space-y-6">
            {/* En-tête avec titre et actions */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Gestion des Cours Assignés</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2">Assignation et gestion des cours aux enseignants</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={reloadCourses}
                  disabled={coursesLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${coursesLoading ? 'animate-spin' : ''}`} />
                  <span>Actualiser</span>
                </button>
                <button
                  onClick={() => setShowAssignCourseModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-4 h-4" />
                  <span>Assigner un Cours</span>
                </button>
              </div>
            </div>

            {/* Recherche */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher un cours ou un enseignant..."
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
                <Search className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
              </div>
            </div>

            {/* Liste des cours assignés */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Cours Assignés ({courseAssignments.filter(course => 
                    course.course_name.toLowerCase().includes(courseSearch.toLowerCase()) ||
                    course.teacher_email.toLowerCase().includes(courseSearch.toLowerCase())
                  ).length})
                </h3>
              </div>

              {coursesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-white"></div>
                  <span className="ml-3 text-slate-600 dark:text-slate-400">Chargement des cours...</span>
                </div>
              ) : courseAssignments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Aucun cours assigné</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">Commencez par assigner des cours aux enseignants</p>
                  <button
                    onClick={() => setShowAssignCourseModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Assigner un cours
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {courseAssignments
                    .filter(course => 
                      course.course_name.toLowerCase().includes(courseSearch.toLowerCase()) ||
                      course.teacher_email.toLowerCase().includes(courseSearch.toLowerCase())
                    )
                    .map(course => (
                      <div key={course.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-slate-900 dark:text-white text-lg">
                                  {course.course_name}
                                </h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                  Assigné à: <span className="font-medium">{course.teacher_email}</span>
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
                              {course.created_at && (
                                <>
                                  <span>Assigné le: {new Date(course.created_at).toLocaleDateString('fr-FR')}</span>
                                  <span>•</span>
                                </>
                              )}
                              <span>ID: {course.id}</span>
                              <span>•</span>
                              <span>Statut: {course.is_active ? 'Actif' : 'Inactif'}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setSelectedUser(course)}
                              className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                              title="Voir les détails"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRemoveCourseAssignment(course.id)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Retirer l'assignation"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Statistiques des cours */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Cours Assignés</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{courseAssignments.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Enseignants Actifs</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                      {new Set(courseAssignments.map(c => c.teacher_email)).size}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Cours par Enseignant</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                      {courseAssignments.length > 0 ? (courseAssignments.length / new Set(courseAssignments.map(c => c.teacher_email)).size).toFixed(1) : '0'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Bell className="w-5 h-5" /> Notifications</h2>
            <form className="flex flex-col md:flex-row gap-2 mb-4" onSubmit={e => { e.preventDefault(); handleAddNotification(); }}>
              <input
                type="text"
                placeholder="Message de la notification"
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                disabled
              />
              <select
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                disabled
              >
                <option value="all">Tous les utilisateurs</option>
                <option value="students">Tous les étudiants</option>
                <option value="teachers">Tous les enseignants</option>
              </select>
              {/* Recherche étudiant pour notification individuelle */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher un étudiant..."
                  value={notificationStudentSearch}
                  onChange={e => {
                    setNotificationStudentSearch(e.target.value);
                    setShowStudentSuggestions(!!e.target.value);
                  }}
                  onFocus={() => setShowStudentSuggestions(!!notificationStudentSearch)}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm w-48"
                />
                {showStudentSuggestions && notificationStudentSearch && (
                  <div className="absolute bg-white border border-slate-200 rounded shadow mt-1 max-h-40 overflow-y-auto w-full z-10">
                    {students.filter(s =>
                      s.nom_complet.toLowerCase().includes(notificationStudentSearch.toLowerCase()) ||
                      s.email.toLowerCase().includes(notificationStudentSearch.toLowerCase())
                    ).map(s => (
                      <div
                        key={s.id}
                        className="px-3 py-2 hover:bg-slate-100 cursor-pointer text-sm"
                        onClick={() => {
                          setNotificationStudentSearch(s.nom_complet);
                          setShowStudentSuggestions(false);
                        }}
                      >
                        {s.nom_complet} <span className="text-xs text-slate-400">({s.email})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Envoyer</button>
            </form>
            <ul className="divide-y divide-slate-100">
              <li className="py-2 flex items-center justify-between">
                <span className="text-slate-400">Aucune notification pour le moment</span>
                </li>
            </ul>
          </div>
        )}
        
        {activeTab === 'submissions' && (
          <div className="space-y-6">
            {/* En-tête avec titre et actions */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                  <ClipboardCheck className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600" />
                  Devoirs rendus
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Gestion et consultation de tous les devoirs soumis par les étudiants
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={reloadSubmissions}
                  className="px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium flex items-center gap-2 text-sm lg:text-base"
                >
                  <RefreshCw className="w-4 h-4" />
                  Actualiser
                </button>
              </div>
            </div>

            {/* Barre de recherche */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Rechercher
                  </label>
                  <input
                    type="text"
                    placeholder="Rechercher par nom d'étudiant, matricule, cours, devoir ou fichier..."
                    value={submissionSearch}
                    onChange={e => setSubmissionSearch(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Contenu principal */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
              {submissionsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-white"></div>
                  <span className="ml-3 text-slate-600 dark:text-slate-400">Chargement des devoirs...</span>
                </div>
              ) : filteredSubmissions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ClipboardCheck className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Aucun devoir rendu</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    {submissionSearch ? 'Aucun devoir ne correspond à votre recherche' : 'Aucun étudiant n\'a encore soumis de devoir'}
                  </p>
                  {submissionSearch && (
                    <button
                      onClick={() => setSubmissionSearch('')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Effacer la recherche
                    </button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredSubmissions.map(submission => (
                    <div key={submission.id} className="p-4 lg:p-6 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                              <FileText className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-slate-900 dark:text-white text-base lg:text-lg truncate">
                                {submission.assignments?.title || 'Devoir sans titre'}
                              </h4>
                              <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                                Cours: <span className="font-medium">{submission.assignments?.course || 'Cours non spécifié'}</span>
                              </p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-slate-600 dark:text-slate-400">
                            <div>
                              <span className="font-medium text-slate-700 dark:text-slate-300">Étudiant:</span>
                              <div className="mt-1">
                                <div className="font-medium text-slate-900 dark:text-white">
                                  {submission.students?.nom_complet || 'Nom non disponible'}
                                </div>
                                <div className="text-xs">
                                  {submission.students?.matricule || 'Matricule non disponible'}
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <span className="font-medium text-slate-700 dark:text-slate-300">Fichier:</span>
                              <div className="mt-1 truncate max-w-[200px]" title={submission.file_name}>
                                {submission.file_name ? truncateFileName(submission.file_name, 25) : 'Fichier non disponible'}
                              </div>
                            </div>
                            
                            <div>
                              <span className="font-medium text-slate-700 dark:text-slate-300">Soumis le:</span>
                              <div className="mt-1">
                                {new Date(submission.submitted_at).toLocaleDateString('fr-FR', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                          </div>
                          
                          {submission.comments && (
                            <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                              <span className="font-medium text-slate-700 dark:text-slate-300 text-sm">Commentaires:</span>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{submission.comments}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 lg:ml-4">
                          <button
                            onClick={() => handleDownloadSubmission(submission.file_url, submission.file_name)}
                            className="p-2 lg:p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Télécharger le fichier"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedUser(submission)}
                            className="p-2 lg:p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            title="Voir les détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Statistiques des soumissions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 lg:p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm font-medium text-slate-600 dark:text-slate-400">Total Devoirs Rendu</p>
                    <p className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white mt-1">{submissions.length}</p>
                  </div>
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <ClipboardCheck className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 lg:p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm font-medium text-slate-600 dark:text-slate-400">Étudiants Actifs</p>
                    <p className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white mt-1">
                      {new Set(submissions.map(s => s.students?.email)).size}
                    </p>
                  </div>
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 lg:p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm font-medium text-slate-600 dark:text-slate-400">Cours avec Devoirs</p>
                    <p className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white mt-1">
                      {new Set(submissions.map(s => s.assignments?.course)).size}
                    </p>
                  </div>
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section Messages */}
        {activeTab === 'messages' && (
          <div className="space-y-6">
            {/* En-tête avec titre et actions */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                  <Send className="w-6 h-6 lg:w-8 lg:h-8 text-orange-600" />
                  Gestion des Messages
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Envoyer des messages aux étudiants, enseignants et administrateurs
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowMessageModal(true)}
                  className="px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-200 font-medium flex items-center gap-2 text-sm lg:text-base shadow-lg hover:shadow-xl"
                >
                  <Send className="w-4 h-4" />
                  Nouveau Message
                </button>
              </div>
            </div>

            {/* Statistiques des messages */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 lg:p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm font-medium text-slate-600 dark:text-slate-400">Messages envoyés</p>
                    <p className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white mt-1">
                      {students.length + teachers.length + admins.length}
                    </p>
                  </div>
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                    <Send className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 lg:p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm font-medium text-slate-600 dark:text-slate-400">Destinataires étudiants</p>
                    <p className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white mt-1">
                      {students.length}
                    </p>
                  </div>
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 lg:p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm font-medium text-slate-600 dark:text-slate-400">Destinataires enseignants</p>
                    <p className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white mt-1">
                      {teachers.length}
                    </p>
                  </div>
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 lg:p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm font-medium text-slate-600 dark:text-slate-400">Destinataires admins</p>
                    <p className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white mt-1">
                      {admins.length}
                    </p>
                  </div>
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Guide d'utilisation */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Send className="w-5 h-5 text-orange-600" />
                Comment envoyer des messages
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-orange-600">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white">Messages de diffusion</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Envoyez des messages à tous les utilisateurs, tous les étudiants, tous les enseignants ou tous les administrateurs.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-orange-600">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white">Messages individuels</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Recherchez et sélectionnez un utilisateur spécifique pour lui envoyer un message personnalisé.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-orange-600">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white">Notifications automatiques</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Les destinataires recevront automatiquement les messages dans leur espace personnel.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-orange-600">4</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white">Suivi des messages</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Tous les messages envoyés sont enregistrés et peuvent être consultés ultérieurement.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de création d'administrateur */}
        {showCreateAdminModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
              <button 
                onClick={() => setShowCreateAdminModal(false)} 
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white text-xl font-bold"
              >
                ×
              </button>
              
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Créer un Administrateur</h3>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Ajouter un nouvel administrateur à la plateforme</p>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleCreateAdmin(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Adresse email
                  </label>
                  <input
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    placeholder="admin@example.com"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    placeholder="Mot de passe sécurisé"
                    required
                    minLength={6}
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateAdminModal(false)}
                    className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl hover:from-purple-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                  >
                    Créer l'Admin
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de création d'enseignant */}
        {showCreateTeacherModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
              <button 
                onClick={() => setShowCreateTeacherModal(false)} 
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white text-xl font-bold"
              >
                ×
              </button>
              
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Créer un Enseignant</h3>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Ajouter un nouvel enseignant à la plateforme</p>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleCreateTeacher(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Adresse email
                  </label>
                  <input
                    type="email"
                    value={newTeacherEmail}
                    onChange={(e) => setNewTeacherEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    placeholder="enseignant@example.com"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    value={newTeacherPassword}
                    onChange={(e) => setNewTeacherPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    placeholder="Mot de passe sécurisé"
                    required
                    minLength={6}
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateTeacherModal(false)}
                    className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                  >
                    Créer l'Enseignant
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal d'assignation de cours */}
        {showAssignCourseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
              <button 
                onClick={() => setShowAssignCourseModal(false)} 
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white text-xl font-bold"
              >
                ×
              </button>
              
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Assigner un Cours</h3>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Assigner un cours à un enseignant</p>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleAssignCourse(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Enseignant
                  </label>
                  <select
                    value={selectedTeacherForCourse}
                    onChange={(e) => setSelectedTeacherForCourse(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    required
                  >
                    <option value="">Sélectionner un enseignant</option>
                    {teachers.map(teacher => (
                      <option key={teacher.id} value={teacher.email}>{teacher.email}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Cours
                  </label>
                  <select
                    value={selectedCourseForAssignment}
                    onChange={(e) => setSelectedCourseForAssignment(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    required
                  >
                    <option value="">Sélectionner un cours</option>
                    <option value="01 S3 Collaboration interdisciplinaire dans l'EFTP">01 S3 Collaboration interdisciplinaire dans l'EFTP</option>
                    <option value="02 S3 Méthodologie de recherche en EFTP">02 S3 Méthodologie de recherche en EFTP</option>
                    <option value="03 S3 Évaluation et certification en EFTP">03 S3 Évaluation et certification en EFTP</option>
                    <option value="04 S3 Innovation pédagogique en EFTP">04 S3 Innovation pédagogique en EFTP</option>
                    <option value="05 S3 Appropriation des programmes d'études">05 S3 Appropriation des programmes d'études</option>
                  </select>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAssignCourseModal(false)}
                    className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                  >
                    Assigner le Cours
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal d'envoi de messages */}
        {showMessageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
              <button 
                onClick={() => setShowMessageModal(false)} 
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white text-xl font-bold"
              >
                ×
              </button>
              
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Send className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Envoyer un Message</h3>
                <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">Diffusion ou message individuel</p>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="space-y-4">
                {/* Type de message */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Type de message
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setMessageType('broadcast')}
                      className={`flex-1 px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                        messageType === 'broadcast'
                          ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      Diffusion
                    </button>
                    <button
                      type="button"
                      onClick={() => setMessageType('individual')}
                      className={`flex-1 px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                        messageType === 'individual'
                          ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      Individuel
                    </button>
                  </div>
                </div>

                {/* Destinataire */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {messageType === 'broadcast' ? 'Destinataires' : 'Destinataire'}
                  </label>
                  
                  {messageType === 'broadcast' ? (
                                      <select
                    value={messageTarget}
                    onChange={(e) => setMessageTarget(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                    required
                  >
                      <option value="">Sélectionner les destinataires</option>
                      <option value="all_students">Tous les étudiants</option>
                      <option value="all_teachers">Tous les enseignants</option>
                      <option value="all_admins">Tous les administrateurs</option>
                      <option value="all_users">Tous les utilisateurs</option>
                    </select>
                                     ) : (
                     <div className="space-y-3 recipient-search-container">
                       <input
                         type="text"
                         placeholder="Rechercher un destinataire par email..."
                         value={messageRecipientSearch}
                         onChange={(e) => setMessageRecipientSearch(e.target.value)}
                         className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                         required
                       />
                      
                                             {/* Suggestions de destinataires */}
                       {messageRecipientSearch && filteredRecipients.length > 0 && (
                         <div className="relative">
                           <div className="absolute z-10 w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                             {filteredRecipients.map((recipient, index) => (
                               <button
                                 key={index}
                                 type="button"
                                 onClick={() => selectRecipient(recipient)}
                                 className="w-full px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors border-b border-slate-200 dark:border-slate-600 last:border-b-0 text-sm"
                               >
                                <div className="font-medium text-slate-900 dark:text-white">{recipient.name}</div>
                                <div className="text-sm text-slate-600 dark:text-slate-400">{recipient.email}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-500 capitalize">{recipient.role}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                                             {/* Destinataire sélectionné */}
                       {selectedRecipient && (
                         <div className="p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-green-900 dark:text-green-100">{selectedRecipient.name}</div>
                              <div className="text-sm text-green-700 dark:text-green-300">{selectedRecipient.email}</div>
                              <div className="text-xs text-green-600 dark:text-green-400 capitalize">{selectedRecipient.role}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSelectedRecipient(null)}
                              className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Titre du message */}
                                 <div>
                   <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                     Titre du message
                   </label>
                   <input
                     type="text"
                     value={messageTitle}
                     onChange={(e) => setMessageTitle(e.target.value)}
                     className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                     placeholder="Titre du message..."
                     required
                   />
                 </div>

                {/* Contenu du message */}
                                 <div>
                   <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                     Contenu du message
                   </label>
                   <textarea
                     value={messageContent}
                     onChange={(e) => setMessageContent(e.target.value)}
                     rows={3}
                     className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white resize-none text-sm"
                     placeholder="Contenu du message..."
                     required
                   />
                 </div>

                {/* Boutons d'action */}
                <div className="flex gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowMessageModal(false)}
                    className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium text-sm"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-3 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl text-sm"
                  >
                    <Send className="w-4 h-4 inline mr-2" />
                    Envoyer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de profil utilisateur */}
        {showUserProfileModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
              <button 
                onClick={() => setShowUserProfileModal(false)} 
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white text-xl font-bold"
              >
                ×
              </button>
              
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Profil Utilisateur</h3>
                <p className="text-slate-600 dark:text-slate-400 mt-1">{selectedUser.role}</p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Email</span>
                    <span className="text-slate-900 dark:text-white font-mono text-sm">{selectedUser.email}</span>
                  </div>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Rôle</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                      {selectedUser.role}
                    </span>
                  </div>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Date de création</span>
                    <span className="text-slate-900 dark:text-white text-sm">
                      {new Date(selectedUser.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700 dark:text-slate-300">ID</span>
                    <span className="text-slate-900 dark:text-white font-mono text-xs">{selectedUser.id}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  onClick={() => setShowUserProfileModal(false)}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Bouton retour en haut */}
        {showScrollToTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 p-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
            title="Retour en haut"
          >
            <ChevronUp className="w-6 h-6" />
          </button>
        )}
        
        {/* Modal profil administrateur */}
        {showProfileModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
              <button 
                onClick={() => setShowProfileModal(false)} 
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 text-xl font-bold"
              >
                ×
              </button>
              
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Profil Administrateur</h3>
                <p className="text-slate-600 mt-1">Super Administrateur</p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700">Email</span>
                    <span className="text-slate-900 font-mono text-sm">{adminName}</span>
                  </div>
                </div>
                
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700">Rôle</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500 to-blue-600 text-white">
                      Super Admin
                    </span>
                  </div>
                </div>
                
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700">Statut</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      Actif
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium"
                >
                  Fermer
                </button>
                <button
                  onClick={onLogout}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
                >
                  Se déconnecter
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 