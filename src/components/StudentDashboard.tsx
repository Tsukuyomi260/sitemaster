import React, { useState, useEffect } from 'react';
import { submitAssignment, getStudentNotifications, markNotificationAsRead, recordCourseDownload } from '../api';
import {
  BookOpen,
  Award,
  FileText,
  Bell,
  User,
  LogOut,
  Home,
  ClipboardCheck,
  Settings,
  MessageSquare,
  Eye
} from 'lucide-react';
import { EmailIcon, WhatsAppIcon } from './ContactIcons';

interface Course {
  id: number;
  title: string;
  instructor: string;
  progress: number;
  nextDeadline: string;
  status: string;
  color: string;
  description: string;
  credits: number;
  semester: string;
  lastActivity: string;
  assignmentsCount: number;
  completedAssignments: number;
  pdf?: string;
}

interface Assignment {
  id: number;
  title: string;
  course: string;
  courseId: number;
  dueDate: string;
  status: 'À rendre' | 'En cours' | 'Rendu' | 'Noté';
  priority: 'high' | 'medium' | 'low';
  description: string;
  type: 'Devoir' | 'TP' | 'Projet' | 'Examen';
  points: number;
  submittedAt?: string;
  grade?: number;
  maxGrade?: number;
  feedback?: string;
}

interface Result {
  id: number;
  title: string;
  course: string;
  courseId: number;
  score: number;
  maxScore: number;
  date: string;
  type: 'Devoir' | 'TP' | 'Projet' | 'Examen';
  weight: number; // Poids dans le calcul de la moyenne
  feedback?: string;
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  subtitle: string;
  color: string;
}

interface CourseCardProps {
  course: Course;
}

interface AssignmentItemProps {
  assignment: Assignment;
}

interface ResultItemProps {
  result: Result;
}

interface StudentDashboardProps {
  studentName: string;
  studentInfo?: any; // Informations de l'étudiant depuis la table students
  onLogout: () => void;
}

interface StudentProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  matricule: string;
  yearOfStudy: string;
  program: string;
  department: string;
  advisor: string;
  enrollmentDate: string;
  photoUrl?: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
}

interface Settings {
  theme: 'light' | 'dark';
  language: 'fr' | 'en';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    showProfile: boolean;
    showProgress: boolean;
    allowContact: boolean;
  };
  accessibility: {
    fontSize: 'small' | 'medium' | 'large';
    highContrast: boolean;
    reduceMotion: boolean;
  };
}

// Interface pour les cours
interface CoursItem {
  nom: string;
  fichier: string;
  professeur?: string;
}

interface Notification {
  id: number;
  student_email: string;
  message_id: number;
  is_read: boolean;
  created_at: string;
  teacher_messages: {
    id: number;
    teacher_email: string;
    course_name: string;
    message_title: string;
    message_content: string;
    created_at: string;
  };
}

// AJOUTER APRÈS LES IMPORTS
const coursParSemestre: { semestre: string; cours: CoursItem[] }[] = [
  {
    semestre: 'Semestre 3',
    cours: [
      { nom: "01 S3 Collaboration interdisciplinaire dans l'EFTP", fichier: "01 S3 Collaboration interdisciplinaire dans l'EFTP.pdf" },
      { nom: "02 S3 Projet transverseaux dans l'EFTP", fichier: "02 S3 Projet transverseaux dans l'EFTP.pdf" },
      { nom: "03 S3 Conception et mise en oeuvre de projet de recherche action", fichier: "03 S3 Conception et mise en oeuvre de projet de recherche action.pdf" },
      { nom: "04 S3 Amélioration des pratiques pédagogiques dans les etablissements d'EFTP", fichier: "04 S3 Amélioration des pratiques pédagogiques dans les etablissements d'EFTP.pdf" },
      { nom: "05 S3 Appropriation des programmes d'études", fichier: "05 S3 Appropriation des programmes d'études.pdf" },
      { nom: "06 S3 Evaluation des programmes d'etude", fichier: "06 S3 Evaluation des programmes d'etude.pdf" },
      { nom: "07 - 08 S3 Conception et redaction des curricula dans l'EFTP", fichier: "07 - 08 S3 Conception et redaction des curricula dans l'EFTP.pdf" },
      { nom: "09 S3 Tice et innovation pédagogique en EFTP", fichier: "09 S3 Tice et innovation pédagogique en EFTP.pdf" },
      { nom: "10 S3 Anglais scientifique", fichier: "10 S3 Anglais scientifique.pdf" },
      { nom: "11 S3 Montage d'évènement scientifique et culturels", fichier: "11 S3 Montage d'évènement scientifique et culturels.pdf" }
    ]
  }
];

// Fonction de fabrique pour Assignment
function createAssignment(
  id: number,
  title: string,
  course: string,
  courseId: number,
  dueDate: string
): Assignment {
  return {
    id,
    title,
    course,
    courseId,
    dueDate,
    status: 'À rendre',
    priority: 'medium',
    description: `Rendez le devoir du cours ${course}.`,
    type: 'Devoir',
    points: 20
  };
}

export default function StudentDashboard({ studentName, studentInfo, onLogout }: StudentDashboardProps) {
  console.log('StudentDashboard - studentInfo:', studentInfo); // Debug
  console.log('StudentDashboard - studentName:', studentName); // Debug
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [watchedVideos, setWatchedVideos] = useState<Set<string>>(new Set());
  const [assignmentFilter, setAssignmentFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [submissionTitle, setSubmissionTitle] = useState('');
  const [submissionComments, setSubmissionComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showNotificationDetail, setShowNotificationDetail] = useState<Notification | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Charger les notifications au montage du composant
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const notificationsData = await getStudentNotifications(studentName);
        setNotifications(notificationsData || []);
        setUnreadCount(notificationsData?.filter(n => !n.is_read).length || 0);
      } catch (error) {
        console.error('Erreur lors du chargement des notifications:', error);
      }
    };

    loadNotifications();
    
    // Debug: Afficher les informations de l'étudiant
    console.log('=== DASHBOARD ÉTUDIANT ===');
    console.log('Student Name:', studentName);
    console.log('Student Info:', studentInfo);
    console.log('Student ID:', studentInfo?.id);
    console.log('==========================');
  }, [studentName]);

  // Appliquer le thème au chargement
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setSettings(prev => ({ ...prev, theme: savedTheme }));
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);
  const [settings, setSettings] = useState<Settings>({
    theme: 'light',
    language: 'fr',
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    privacy: {
      showProfile: true,
      showProgress: true,
      allowContact: false
    },
    accessibility: {
      fontSize: 'medium',
      highContrast: false,
      reduceMotion: false
    }
  });

  // Données du profil étudiant - utiliser les vraies données de studentInfo
  const studentProfile: StudentProfile = {
    id: studentInfo?.id || 'STU001',
    firstName: studentInfo?.nom_complet ? studentInfo.nom_complet.split(' ')[0] : 'Prénom',
    lastName: studentInfo?.nom_complet ? studentInfo.nom_complet.split(' ').slice(1).join(' ') : 'Nom',
    email: studentInfo?.email || 'email@example.com',
    phone: studentInfo?.telephone || '+229 90 12 34 56',
    matricule: studentInfo?.matricule || 'Matricule',
    yearOfStudy: studentInfo?.niveau || '2ème année',
    program: studentInfo?.formation || 'Master en Sciences et Technologies de l\'Information',
    department: studentInfo?.departement || 'Informatique et Télécommunications',
    advisor: studentInfo?.encadreur || 'Dr. GNONLONFOUN Jean Marc',
    enrollmentDate: studentInfo?.date_inscription || '2023-09-15',
    address: studentInfo?.adresse || '123 Rue de l\'Université, Cotonou, Bénin',
    emergencyContact: studentInfo?.contact_urgence || 'Contact d\'urgence',
    emergencyPhone: studentInfo?.telephone_urgence || '+229 90 98 76 54'
  };

  // Données fictives - Tous les cours du semestre 3
  const courses: Course[] = [
    {
      id: 1,
      title: "01 S3 Collaboration interdisciplinaire dans l'EFTP",
      instructor: '',
      progress: 0,
      nextDeadline: '2025-08-15',
      status: 'Non commencé',
      color: 'bg-blue-500',
      description: 'Développement de la collaboration entre disciplines dans l\'EFTP',
      credits: 4,
      semester: 'Semestre 3',
      lastActivity: 'Aucune activité',
      assignmentsCount: 0,
      completedAssignments: 0,
      pdf: '/cours/semestre3/01 S3 Collaboration interdisciplinaire dans l\'EFTP.pdf'
    },
    {
      id: 2,
      title: "02 S3 Projet transverseaux dans l'EFTP",
      instructor: '',
      progress: 0,
      nextDeadline: '2025-08-20',
      status: 'Non commencé',
      color: 'bg-blue-500',
      description: 'Conception et mise en œuvre de projets transversaux',
      credits: 5,
      semester: 'Semestre 3',
      lastActivity: 'Aucune activité',
      assignmentsCount: 0,
      completedAssignments: 0,
      pdf: '/cours/semestre3/02 S3 Projet transverseaux dans l\'EFTP.pdf'
    },
    {
      id: 3,
      title: "03 S3 Conception et mise en oeuvre de projet de recherche action",
      instructor: '',
      progress: 0,
      nextDeadline: '2025-08-25',
      status: 'Non commencé',
      color: 'bg-blue-500',
      description: 'Méthodologie de recherche-action en contexte EFTP',
      credits: 6,
      semester: 'Semestre 3',
      lastActivity: 'Aucune activité',
      assignmentsCount: 0,
      completedAssignments: 0,
      pdf: '/cours/semestre3/03 S3 Conception et mise en oeuvre de projet de recherche action.pdf'
    },
    {
      id: 4,
      title: "04 S3 Amélioration des pratiques pédagogiques dans les etablissements d'EFTP",
      instructor: '',
      progress: 0,
      nextDeadline: '2025-08-30',
      status: 'Non commencé',
      color: 'bg-blue-500',
      description: 'Amélioration des pratiques pédagogiques en EFTP',
      credits: 4,
      semester: 'Semestre 3',
      lastActivity: 'Aucune activité',
      assignmentsCount: 0,
      completedAssignments: 0,
      pdf: '/cours/semestre3/04 S3 Amélioration des pratiques pédagogiques dans les etablissements d\'EFTP.pdf'
    },
    {
      id: 5,
      title: "05 S3 Appropriation des programmes d'études",
      instructor: '',
      progress: 0,
      nextDeadline: '2025-09-05',
      status: 'Non commencé',
      color: 'bg-blue-500',
      description: 'Appropriation et mise en œuvre des programmes d\'études',
      credits: 5,
      semester: 'Semestre 3',
      lastActivity: 'Aucune activité',
      assignmentsCount: 0,
      completedAssignments: 0,
      pdf: '/cours/semestre3/05 S3 Appropriation des programmes d\'études.pdf'
    },
    {
      id: 6,
      title: "06 S3 Evaluation des programmes d'etude",
      instructor: '',
      progress: 0,
      nextDeadline: '2025-09-10',
      status: 'Non commencé',
      color: 'bg-blue-500',
      description: 'Évaluation et amélioration des programmes d\'études',
      credits: 4,
      semester: 'Semestre 3',
      lastActivity: 'Aucune activité',
      assignmentsCount: 0,
      completedAssignments: 0,
      pdf: '/cours/semestre3/06 S3 Evaluation des programmes d\'etude.pdf'
    },
    {
      id: 7,
      title: "07 - 08 S3 Conception et redaction des curricula dans l'EFTP",
      instructor: '',
      progress: 0,
      nextDeadline: '2025-09-15',
      status: 'Non commencé',
      color: 'bg-blue-500',
      description: 'Conception et rédaction des curricula en EFTP',
      credits: 6,
      semester: 'Semestre 3',
      lastActivity: 'Aucune activité',
      assignmentsCount: 0,
      completedAssignments: 0,
      pdf: '/cours/semestre3/07 - 08 S3 Conception et redaction des curricula dans l\'EFTP.pdf'
    },
    {
      id: 8,
      title: "09 S3 Tice et innovation pédagogique en EFTP",
      instructor: '',
      progress: 0,
      nextDeadline: '2025-09-20',
      status: 'Non commencé',
      color: 'bg-blue-500',
      description: 'Technologies de l\'information et innovation pédagogique',
      credits: 4,
      semester: 'Semestre 3',
      lastActivity: 'Aucune activité',
      assignmentsCount: 0,
      completedAssignments: 0,
      pdf: '/cours/semestre3/09 S3 Tice et innovation pédagogique en EFTP.pdf'
    },
    {
      id: 9,
      title: "10 S3 Anglais scientifique",
      instructor: '',
      progress: 0,
      nextDeadline: '2025-09-25',
      status: 'Non commencé',
      color: 'bg-blue-500',
      description: 'Anglais scientifique et communication académique',
      credits: 3,
      semester: 'Semestre 3',
      lastActivity: 'Aucune activité',
      assignmentsCount: 0,
      completedAssignments: 0,
      pdf: '/cours/semestre3/10 S3 Anglais scientifique.pdf'
    },
    {
      id: 10,
      title: "11 S3 Montage d'évènement scientifique et culturels",
      instructor: '',
      progress: 0,
      nextDeadline: '2025-09-30',
      status: 'Non commencé',
      color: 'bg-blue-500',
      description: 'Organisation d\'événements scientifiques et culturels',
      credits: 4,
      semester: 'Semestre 3',
      lastActivity: 'Aucune activité',
      assignmentsCount: 0,
      completedAssignments: 0,
      pdf: '/cours/semestre3/11 S3 Montage d\'évènement scientifique et culturels.pdf'
    }
  ];

  const assignments: Assignment[] = [
    {
      id: 1,
      title: "01 S3 Collaboration interdisciplinaire dans l'EFTP",
      course: "01 S3 Collaboration interdisciplinaire dans l'EFTP",
      courseId: 1,
      dueDate: '',
      status: 'À rendre',
      priority: 'medium',
      description: '',
      type: 'Devoir',
      points: 0
    },
    {
      id: 2,
      title: "02 S3 Projet transverseaux dans l'EFTP",
      course: "02 S3 Projet transverseaux dans l'EFTP",
      courseId: 2,
      dueDate: '',
      status: 'À rendre',
      priority: 'medium',
      description: '',
      type: 'Devoir',
      points: 0
    },
    {
      id: 3,
      title: "03 S3 Conception et mise en oeuvre de projet de recherche action",
      course: "03 S3 Conception et mise en oeuvre de projet de recherche action",
      courseId: 3,
      dueDate: '',
      status: 'À rendre',
      priority: 'medium',
      description: '',
      type: 'Devoir',
      points: 0
    },
    {
      id: 4,
      title: "04 S3 Amélioration des pratiques pédagogiques dans les etablissements d'EFTP",
      course: "04 S3 Amélioration des pratiques pédagogiques dans les etablissements d'EFTP",
      courseId: 4,
      dueDate: '',
      status: 'À rendre',
      priority: 'medium',
      description: '',
      type: 'Devoir',
      points: 0
    },
    {
      id: 5,
      title: "05 S3 Appropriation des programmes d'études",
      course: "05 S3 Appropriation des programmes d'études",
      courseId: 5,
      dueDate: '',
      status: 'À rendre',
      priority: 'medium',
      description: '',
      type: 'Devoir',
      points: 0
    },
    {
      id: 6,
      title: "06 S3 Evaluation des programmes d'etude",
      course: "06 S3 Evaluation des programmes d'etude",
      courseId: 6,
      dueDate: '',
      status: 'À rendre',
      priority: 'medium',
      description: '',
      type: 'Devoir',
      points: 0
    },
    {
      id: 7,
      title: "07 - 08 S3 Conception et redaction des curricula dans l'EFTP",
      course: "07 - 08 S3 Conception et redaction des curricula dans l'EFTP",
      courseId: 7,
      dueDate: '',
      status: 'À rendre',
      priority: 'medium',
      description: '',
      type: 'Devoir',
      points: 0
    },
    {
      id: 8,
      title: "09 S3 Tice et innovation pédagogique en EFTP",
      course: "09 S3 Tice et innovation pédagogique en EFTP",
      courseId: 8,
      dueDate: '',
      status: 'À rendre',
      priority: 'medium',
      description: '',
      type: 'Devoir',
      points: 0
    },
    {
      id: 9,
      title: "10 S3 Anglais scientifique",
      course: "10 S3 Anglais scientifique",
      courseId: 9,
      dueDate: '',
      status: 'À rendre',
      priority: 'medium',
      description: '',
      type: 'Devoir',
      points: 0
    },
    {
      id: 10,
      title: "11 S3 Montage d'évènement scientifique et culturels",
      course: "11 S3 Montage d'évènement scientifique et culturels",
      courseId: 10,
      dueDate: '',
      status: 'À rendre',
      priority: 'medium',
      description: '',
      type: 'Devoir',
      points: 0
    }
  ];

  const recentResults: Result[] = [];

  // Données fictives pour les supports de cours
  const courseSupports: any = {};

  const handleViewCourse = (course: Course) => {
    setSelectedCourse(course);
  };

  const handleBackToDashboard = () => {
    setSelectedCourse(null);
  };

  const handleVideoComplete = (courseId: number, videoId: number) => {
    const videoKey = `${courseId}-${videoId}`;
    setWatchedVideos(prev => new Set(Array.from(prev).concat([videoKey])));
  };

  const isVideoUnlocked = (courseId: number, videoIndex: number) => {
    if (videoIndex === 0) return true; // Première vidéo toujours accessible
    
    // Vérifier si la vidéo précédente a été regardée
    const previousVideoId = videoIndex;
    const previousVideoKey = `${courseId}-${previousVideoId}`;
    const previousVideoWatched = watchedVideos.has(previousVideoKey);
    
    return previousVideoWatched;
  };

  const isVideoWatched = (courseId: number, videoId: number) => {
    const videoKey = `${courseId}-${videoId}`;
    return watchedVideos.has(videoKey);
  };

  const getFilteredAssignments = () => {
    switch (assignmentFilter) {
      case 'pending':
        return assignments.filter(a => a.status === 'À rendre');
      case 'submitted':
        return assignments.filter(a => a.status === 'Rendu');
      case 'graded':
        return assignments.filter(a => a.status === 'Noté');
      default:
        return assignments;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'À rendre':
        return 'bg-red-100 text-red-700';
      case 'En cours':
        return 'bg-orange-100 text-orange-700';
      case 'Rendu':
        return 'bg-blue-100 text-blue-700';
      case 'Noté':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-orange-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-slate-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Devoir':
        return <FileText className="w-4 h-4" />;
      case 'TP':
        return <ClipboardCheck className="w-4 h-4" />;
      case 'Projet':
        return <BookOpen className="w-4 h-4" />;
      case 'Examen':
        return <Award className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: Home },
    { id: 'courses', label: 'Mes cours', icon: BookOpen },
    { id: 'assignments', label: 'Devoirs', icon: ClipboardCheck },
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ];

  const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, subtitle, color }) => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const CourseCard: React.FC<CourseCardProps> = ({ course }) => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{course.title}</h3>
          {course.instructor && (
          <p className="text-sm text-slate-600 dark:text-slate-400">Prof. {course.instructor}</p>
          )}
        </div>
        <span className={`w-3 h-3 rounded-full ${course.color}`}></span>
      </div>



      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500 dark:text-slate-400">Échéance: {course.nextDeadline}</span>
        <div className="flex space-x-2">
          <a
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95"
            href={course.pdf}
            download
            target="_blank"
            rel="noopener noreferrer"
          >
            Télécharger
          </a>
        </div>
      </div>
    </div>
  );

  const DetailedCourseCard: React.FC<{ course: Course }> = ({ course }) => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className={`w-3 h-3 rounded-full ${course.color}`}></span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              course.status === 'Presque terminé' ? 'bg-green-100 text-green-700' :
              course.status === 'En cours' ? 'bg-blue-100 text-blue-700' :
              'bg-orange-100 text-orange-700'
            }`}>
              {course.status}
            </span>
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1 text-lg">{course.title}</h3>
          {course.instructor && (
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Prof. {course.instructor}</p>
          )}
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{course.description}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Crédits</p>
          <p className="font-medium text-slate-900 dark:text-white">{course.credits} ECTS</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Semestre</p>
          <p className="font-medium text-slate-900 dark:text-white">{course.semester}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Devoirs</p>
          <p className="font-medium text-slate-900 dark:text-white">{course.completedAssignments}/{course.assignmentsCount}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Dernière activité</p>
          <p className="font-medium text-slate-900 dark:text-white">{course.lastActivity}</p>
        </div>
      </div>
      

      
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Prochaine échéance</p>
          <p className="text-sm font-medium text-slate-900 dark:text-white">{course.nextDeadline}</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => handleViewCourse(course)}
            className="text-sm font-medium px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95"
          >
            Voir le cours
          </button>
          <button
            onClick={() => course.pdf && handleCourseDownload(course.title, course.pdf)}
            className="text-sm font-medium px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95"
          >
            Télécharger
          </button>
        </div>
      </div>
      {course.pdf && (
        <button
          onClick={() => handleCourseDownload(course.title, course.pdf!)}
          className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mt-4"
        >
          Télécharger le PDF du cours
        </button>
      )}
    </div>
  );

  const CourseDetail: React.FC<{ course: Course; onBack: () => void }> = ({ course, onBack }) => {
    const supports = courseSupports[course.id as keyof typeof courseSupports];
    const [selectedVideo, setSelectedVideo] = useState<number | null>(null);
    
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{course.title}</h1>
              {course.instructor && (
              <p className="text-slate-600">Prof. {course.instructor}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              course.status === 'Presque terminé' ? 'bg-green-100 text-green-700' :
              course.status === 'En cours' ? 'bg-blue-100 text-blue-700' :
              'bg-orange-100 text-orange-700'
            }`}>
              {course.status}
            </span>
          </div>
        </div>

        {/* Course Info */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Informations du cours</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Crédits:</span>
                  <span className="font-medium dark:text-white">{course.credits} ECTS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Semestre:</span>
                  <span className="font-medium dark:text-white">{course.semester}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Progression:</span>
                  <span className="font-medium dark:text-white">{course.progress}%</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Description</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">{course.description}</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Prochaine échéance</h3>
              <p className="text-slate-600 dark:text-slate-400">{course.nextDeadline}</p>
            </div>
          </div>
        </div>

        {/* Videos */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Vidéos de cours</h3>
          
          {/* Video Player */}
          {selectedVideo && supports.videos && supports.videos[selectedVideo - 1] && (
            <div className="mb-6">
              <div className="relative w-full bg-black rounded-lg overflow-hidden">
                <video 
                  className="w-full h-auto max-h-96"
                  controls
                  preload="metadata"
                  onEnded={() => handleVideoComplete(course.id, selectedVideo)}
                >
                  <source src={supports.videos[selectedVideo - 1].url} type="video/mp4" />
                  Votre navigateur ne supporte pas la lecture de vidéos.
                </video>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <h4 className="font-medium text-slate-900 dark:text-white">{supports.videos[selectedVideo - 1].title}</h4>
                <button 
                  onClick={() => setSelectedVideo(null)}
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  Fermer
                </button>
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            {supports.videos && supports.videos.map((video: any, index: number) => {
              const isUnlocked = isVideoUnlocked(course.id, index);
              const isWatched = isVideoWatched(course.id, video.id);
              
              return (
                <div key={video.id} className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  isUnlocked 
                    ? 'border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700' 
                    : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      isWatched ? 'bg-green-500' : 
                      isUnlocked ? 'bg-slate-300 dark:bg-slate-500' : 'bg-slate-200 dark:bg-slate-600'
                    }`}></div>
                    <div>
                      <p className={`font-medium ${
                        isUnlocked ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'
                      }`}>
                        {video.title}
                        {!isUnlocked && (
                          <span className="ml-2 text-xs text-slate-400 dark:text-slate-500">(Vidéo précédente requise)</span>
                        )}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{video.duration}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => isUnlocked && setSelectedVideo(video.id)}
                    disabled={!isUnlocked}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      isUnlocked
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {isUnlocked ? 'Regarder' : 'Vidéo précédente requise'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4">Documents de cours</h3>
          <div className="space-y-3">
            {supports.documents && supports.documents.map((doc: any) => (
              <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-medium text-slate-600">{doc.type}</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{doc.title}</p>
                    <p className="text-sm text-slate-600">{doc.size}</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Télécharger
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Assignments */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4">Devoirs</h3>
          <div className="space-y-3">
            {supports.assignments && supports.assignments.map((assignment: any) => (
              <div key={assignment.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                <div>
                  <p className="font-medium text-slate-900">{assignment.title}</p>
                  <p className="text-sm text-slate-600">Échéance: {assignment.dueDate}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    assignment.status === 'Terminé' ? 'bg-green-100 text-green-700' :
                    assignment.status === 'En cours' ? 'bg-orange-100 text-orange-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {assignment.status}
                  </span>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Voir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Practical Works */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4">Travaux Pratiques</h3>
          <div className="space-y-3">
            {supports.practicalWorks && supports.practicalWorks.map((tp: any) => (
              <div key={tp.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                <div>
                  <p className="font-medium text-slate-900">{tp.title}</p>
                  <p className="text-sm text-slate-600">Échéance: {tp.dueDate}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    tp.status === 'Terminé' ? 'bg-green-100 text-green-700' :
                    tp.status === 'En cours' ? 'bg-orange-100 text-orange-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {tp.status}
                  </span>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    Commencer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const AssignmentCard: React.FC<{ assignment: Assignment }> = ({ assignment }) => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between min-h-[160px]">
        <div>
        <h3 className="font-semibold text-slate-900 dark:text-white text-lg mb-2">Devoir - {assignment.course}</h3>
        </div>
      <button
        onClick={() => handleSubmitAssignment(assignment)}
        className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
      >
        Rendre le devoir
            </button>
    </div>
  );

  const AssignmentItem: React.FC<AssignmentItemProps> = ({ assignment }) => (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-sm transition-all duration-200">
      <div className="flex items-center space-x-3">
        <div className={`w-2 h-2 rounded-full ${getPriorityColor(assignment.priority)}`}></div>
        <div>
          <h4 className="font-medium text-slate-900 dark:text-white">{assignment.title}</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">{assignment.course}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm text-slate-900 dark:text-white">{assignment.dueDate}</p>
        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(assignment.status)}`}>
          {assignment.status}
        </span>
      </div>
    </div>
  );

  const calculateAverage = () => {
    if (recentResults.length === 0) return 0;
    
    let totalWeightedScore = 0;
    let totalWeight = 0;
    
    recentResults.forEach(result => {
      const percentage = (result.score / result.maxScore) * 20; // Convertir sur 20
      totalWeightedScore += percentage * result.weight;
      totalWeight += result.weight;
    });
    
    return totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
  };

  const getGradeColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGradeEmoji = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return '🎉';
    if (percentage >= 60) return '👍';
    return '📝';
  };

  const ResultCard: React.FC<{ result: Result }> = ({ result }) => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400">
              {getTypeIcon(result.type)}
              <span className="text-xs">{result.type}</span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">{result.course}</span>
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{result.title}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Rendu le {result.date}</p>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${getGradeColor(result.score, result.maxScore)}`}>
            {result.score}/{result.maxScore}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {Math.round((result.score / result.maxScore) * 100)}%
          </div>
          <div className="text-lg">{getGradeEmoji(result.score, result.maxScore)}</div>
        </div>
      </div>

      {result.feedback && (
        <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Feedback</p>
          <p className="text-sm text-slate-700 dark:text-slate-300">{result.feedback}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">Poids: {result.weight}x</span>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
          Voir détails
        </button>
      </div>
    </div>
  );

  const ResultItem: React.FC<ResultItemProps> = ({ result }) => (
    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
      <div>
        <h4 className="font-medium text-slate-900">{result.title}</h4>
        <p className="text-sm text-slate-600">{result.course}</p>
        <p className="text-xs text-slate-500">{result.date}</p>
      </div>
      <div className="text-right">
        <p className={`text-lg font-bold ${getGradeColor(result.score, result.maxScore)}`}>
          {result.score}/{result.maxScore}
        </p>
        <p className="text-sm text-slate-600">{Math.round((result.score / result.maxScore) * 100)}%</p>
      </div>
    </div>
  );

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePhoto(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setSubmissionTitle(`Devoir - ${assignment.course}`);
    setIsSubmissionModalOpen(true);
    setSubmissionError('');
    setSubmissionSuccess(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain'
      ];
      
      if (allowedTypes.includes(file.type)) {
        setSubmissionFile(file);
        setSubmissionError('');
      } else {
        setSubmissionError('Format de fichier non supporté. Utilisez PDF, Word, PowerPoint ou texte.');
        setSubmissionFile(null);
      }
    }
  };

  const handleSubmissionSubmit = async () => {
    // Debug: Afficher les informations de débogage
    console.log('=== DEBUG SOUMISSION ===');
    console.log('Student Info:', studentInfo);
    console.log('Student ID:', studentInfo?.id);
    console.log('Selected Assignment:', selectedAssignment);
    console.log('Submission File:', submissionFile);
    console.log('Submission Title:', submissionTitle);
    console.log('=======================');

    if (!submissionFile || !selectedAssignment || !studentInfo?.id) {
      setSubmissionError('Veuillez sélectionner un fichier à soumettre.');
      return;
    }

    if (!submissionTitle.trim()) {
      setSubmissionError('Veuillez saisir le titre du devoir.');
      return;
    }

    setIsSubmitting(true);
    setSubmissionError('');

    try {
      await submitAssignment(
        selectedAssignment.id,
        studentInfo.id,
        submissionFile,
        submissionTitle,
        submissionComments
      );

      setSubmissionSuccess(true);
      setSubmissionFile(null);
      setSubmissionTitle('');
      setSubmissionComments('');
      
      // Fermer le modal après 2 secondes
      setTimeout(() => {
        setIsSubmissionModalOpen(false);
        setSubmissionSuccess(false);
        setSelectedAssignment(null);
      }, 2000);

    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      setSubmissionError('Erreur lors de la soumission. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeSubmissionModal = () => {
    setIsSubmissionModalOpen(false);
    setSelectedAssignment(null);
    setSubmissionFile(null);
    setSubmissionTitle('');
    setSubmissionComments('');
    setSubmissionError('');
    setSubmissionSuccess(false);
  };

  // Fonction pour gérer le téléchargement d'un cours
  const handleCourseDownload = async (courseName: string, pdfPath: string) => {
    try {
      // Enregistrer le téléchargement dans la base de données
      await recordCourseDownload(studentName, courseName);
      
      // Télécharger le fichier
      const link = document.createElement('a');
      link.href = pdfPath;
      link.download = courseName + '.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    }
  };

  // Fonction pour marquer une notification comme lue
  const handleMarkNotificationAsRead = async (notificationId: number) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error);
    }
  };

  // Fonction pour afficher le détail d'une notification
  const handleViewNotification = (notification: Notification) => {
    if (!notification.is_read) {
      handleMarkNotificationAsRead(notification.id);
    }
    setShowNotificationDetail(notification);
  };

  const ProfileSection: React.FC = () => {
    const [formData, setFormData] = useState(studentProfile);

    const handleInputChange = (field: keyof StudentProfile, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveProfile = () => {
      // Ici on pourrait sauvegarder les données
      setIsEditingProfile(false);
    };

    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Mon profil</h2>
            <p className="text-slate-600">Gérez vos informations personnelles et académiques</p>
          </div>
          <div className="flex space-x-2">
            {!isEditingProfile ? (
              <button 
                onClick={() => setIsEditingProfile(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Modifier
              </button>
            ) : (
              <>
                <button 
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleSaveProfile}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Sauvegarder
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Photo de profil */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Photo de profil</h3>
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden mx-auto mb-4">
                    {profilePhoto ? (
                      <img 
                        src={profilePhoto} 
                        alt="Photo de profil" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-slate-400 dark:text-slate-500" />
                    )}
                  </div>
                  {isEditingProfile && (
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      <div className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                        Changer la photo
                      </div>
                    </label>
                  )}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  {profilePhoto ? 'Photo personnalisée' : 'Aucune photo'}
                </p>
              </div>
            </div>
          </div>

          {/* Informations personnelles */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 mb-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Informations personnelles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Prénom</label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  ) : (
                    <p className="text-slate-900 dark:text-white">{formData.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-slate-900">{formData.lastName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  {isEditingProfile ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-slate-900">{formData.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
                  {isEditingProfile ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-slate-900">{formData.phone}</p>
                  )}
                </div>

              </div>
            </div>

            {/* Informations académiques */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 mb-6">
              <h3 className="font-semibold text-slate-900 mb-4">Informations académiques</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Numéro matricule</label>
                  <p className="text-slate-900 font-mono bg-slate-100 px-2 py-1 rounded">{formData.matricule}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Année d'étude</label>
                  <p className="text-slate-900">{formData.yearOfStudy}</p>
                </div>

              </div>
            </div>


          </div>
        </div>
      </div>
    );
  };

  const handleSettingChange = (category: keyof Settings, field: string, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      if (category === 'notifications') {
        newSettings.notifications = { ...prev.notifications, [field]: value };
      } else if (category === 'privacy') {
        newSettings.privacy = { ...prev.privacy, [field]: value };
      } else if (category === 'accessibility') {
        newSettings.accessibility = { ...prev.accessibility, [field]: value };
      }
      return newSettings;
    });
  };

  const handleThemeChange = (theme: 'light' | 'dark') => {
    setSettings(prev => ({
      ...prev,
      theme
    }));
    // Appliquer le thème au niveau global
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const SettingsSection: React.FC = () => {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Paramètres</h2>
            <p className="text-slate-600 dark:text-slate-400">Personnalisez votre expérience utilisateur</p>
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              Réinitialiser
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
              Sauvegarder
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Apparence */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
              </svg>
              Apparence
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Thème</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleThemeChange('light')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      settings.theme === 'light'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                      <span className="font-medium dark:text-white">Clair</span>
                    </div>
                  </button>
                  <button
                    onClick={() => handleThemeChange('dark')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      settings.theme === 'dark'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-slate-700 rounded-full"></div>
                      <span className="font-medium dark:text-white">Sombre</span>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Langue</label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value as 'fr' | 'en' }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Taille de police</label>
                <select
                  value={settings.accessibility.fontSize}
                  onChange={(e) => handleSettingChange('accessibility', 'fontSize', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="small">Petite</option>
                  <option value="medium">Moyenne</option>
                  <option value="large">Grande</option>
                </select>
              </div>
            </div>
          </div>



          {/* Confidentialité */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Confidentialité
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Profil public</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Permettre aux autres de voir votre profil</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.privacy.showProfile}
                    onChange={(e) => handleSettingChange('privacy', 'showProfile', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Progression visible</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Afficher votre progression aux autres</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.privacy.showProgress}
                    onChange={(e) => handleSettingChange('privacy', 'showProgress', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Autoriser les contacts</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Permettre aux autres de vous contacter</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.privacy.allowContact}
                    onChange={(e) => handleSettingChange('privacy', 'allowContact', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>


        </div>

                 {/* Actions avancées */}
         <div className="mt-6 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
           <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Actions avancées</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <button className="p-4 text-left border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
               <div className="flex items-center space-x-3">
                 <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                   <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                   </svg>
                 </div>
                 <div>
                   <p className="font-medium text-slate-900 dark:text-white">Exporter mes données</p>
                   <p className="text-sm text-slate-600 dark:text-slate-400">Télécharger mes informations</p>
                 </div>
               </div>
             </button>

             <div className="p-4 text-left border border-slate-200 dark:border-slate-600 rounded-lg">
               <div className="flex items-center space-x-3 mb-3">
                 <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                   <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                   </svg>
                 </div>
                 <div>
                   <p className="font-medium text-slate-900 dark:text-white">Signaler un problème</p>
                   <p className="text-sm text-slate-600 dark:text-slate-400">Nous aider à améliorer</p>
                 </div>
               </div>
               <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                 <a 
                   href="mailto:gnonlonfoun@ensetmasters.org" 
                   className="text-xs text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center gap-1"
                 >
                   <EmailIcon />
                   gnonlonfoun@ensetmasters.org
                 </a>
                 <a 
                   href="https://wa.me/22996113246" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="text-xs text-green-600 hover:text-green-800 transition-colors duration-200 flex items-center gap-1"
                 >
                   <WhatsAppIcon />
                   +229 96 11 32 46
                 </a>
               </div>
             </div>
           </div>
         </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar desktop */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-slate-800 shadow-lg border-r border-slate-200 dark:border-slate-700 z-10 hidden md:block">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-white">
              <img src="/logo-enset.png" alt="Logo ENSET-MASTERS" className="object-contain w-full h-full" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 dark:text-white">MR-MRTDDEFTP</h1>
              <p className="text-xs text-slate-600 dark:text-slate-400">Espace Master ENSET-MASTERS</p>
            </div>
          </div>
          <nav className="space-y-3">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-4 rounded-xl transition-all duration-200 font-medium ${
                  activeTab === item.id
                    ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-lg'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:shadow-md'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="absolute bottom-0 w-full p-6 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </div>
            <div>
              <p className="font-medium text-slate-900 dark:text-white">
                {studentInfo?.nom_complet || studentName}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">Étudiant Master</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      {/* Burger menu mobile */}
      <div className="md:hidden flex items-center p-4 bg-white shadow-sm sticky top-0 z-20">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 rounded-md text-slate-700 hover:bg-slate-100 focus:outline-none"
          aria-label="Ouvrir le menu"
        >
          {/* Icône burger */}
          <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <span className="ml-4 font-bold text-lg text-slate-900">ENSET-MASTERS</span>
      </div>

      {/* Drawer mobile */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex">
          {/* Overlay */}
          <div className="fixed inset-0 bg-black bg-opacity-40" onClick={() => setIsMobileMenuOpen(false)} />
          {/* Drawer */}
          <div className="relative w-64 bg-white h-full shadow-lg p-6 animate-slide-in-left">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-md text-slate-700 hover:bg-slate-100"
              aria-label="Fermer le menu"
            >
              {/* Icône croix */}
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="flex items-center space-x-3 mb-8 mt-2">
              <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-white">
                <img src="/logo-enset.png" alt="Logo ENSET-MASTERS" className="object-contain w-full h-full" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900 dark:text-white">MR-MRTDDEFTP</h1>
                <p className="text-xs text-slate-600 dark:text-slate-400">Espace Master ENSET-MASTERS</p>
              </div>
            </div>
            <nav className="space-y-3">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center space-x-3 px-4 py-4 rounded-xl transition-all duration-200 font-medium ${
                    activeTab === item.id
                      ? 'bg-slate-900 text-white shadow-lg'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:shadow-md'
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{item.label}</span>
                </button>
              ))}
            </nav>
            <div className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {studentInfo?.nom_complet || studentName}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Étudiant Master</p>
                </div>
              </div>
              <button
                onClick={() => { setIsMobileMenuOpen(false); onLogout(); }}
                className="w-full flex items-center space-x-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-4 md:ml-64">
        {selectedCourse ? (
          <CourseDetail course={selectedCourse} onBack={handleBackToDashboard} />
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  {activeTab === 'dashboard' ? 'Tableau de bord' :
                   activeTab === 'courses' ? 'Mes cours' :
                   activeTab === 'assignments' ? 'Devoirs' :
                   activeTab === 'profile' ? 'Profil' : 'Paramètres'}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Bienvenue, {studentInfo?.nom_complet || studentName}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setShowNotifications(true)}
                  className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <button onClick={onLogout} className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Dashboard Content */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <StatCard
                    icon={BookOpen}
                    title="Cours actifs"
                    value={coursParSemestre.find(s => s.semestre === 'Semestre 3')?.cours.length.toString() || "0"}
                    subtitle="Semestre 3"
                    color="bg-blue-500"
                  />
                  <StatCard
                    icon={ClipboardCheck}
                    title="Devoirs à rendre"
                    value="10"
                    subtitle="Cette semaine"
                    color="bg-orange-500"
                  />
                </div>

                {/* Courses Overview */}
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 mb-4">Mes cours</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {courses.map(course => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* Other tabs content */}
            {activeTab !== 'dashboard' && (
              <div className="space-y-6">
                {activeTab === 'courses' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Mes cours</h2>
                        <p className="text-slate-600 dark:text-slate-400">Téléchargez vos cours par semestre</p>
                      </div>
                    </div>
                    <div className="space-y-8">
                      {coursParSemestre.map((semestre) => (
                        <div key={semestre.semestre}>
                          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">{semestre.semestre}</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {semestre.cours.map((cours) => (
                              <div key={cours.fichier} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-slate-900 dark:text-white">{cours.nom}</p>
                                  {cours.professeur && (
                                    <p className="text-xs text-slate-600 dark:text-slate-400">{cours.professeur}</p>
                                  )}
                                </div>
                                <a
                                  href={`/cours/${semestre.semestre.toLowerCase().replace(/ /g, '')}/${cours.fichier}`}
                                  download
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                  Télécharger
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'assignments' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Mes devoirs</h2>
                        <p className="text-slate-600 dark:text-slate-400">Gérez vos devoirs et suivez vos rendus</p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                          Rechercher
                        </button>
                        <button className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors">
                          Nouveau devoir
                        </button>
                      </div>
                    </div>

                    {/* Filtres */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 mb-6">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setAssignmentFilter('all')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            assignmentFilter === 'all'
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                          }`}
                        >
                          Tous ({assignments.length})
                        </button>
                        <button
                          onClick={() => setAssignmentFilter('pending')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            assignmentFilter === 'pending'
                              ? 'bg-red-600 text-white'
                              : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/30'
                          }`}
                        >
                          À rendre ({assignments.filter(a => a.status === 'À rendre').length})
                        </button>
                        <button
                          onClick={() => setAssignmentFilter('submitted')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            assignmentFilter === 'submitted'
                              ? 'bg-blue-600 text-white'
                              : 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/30'
                          }`}
                        >
                          Rendus ({assignments.filter(a => a.status === 'Rendu').length})
                        </button>
                        <button
                          onClick={() => setAssignmentFilter('graded')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            assignmentFilter === 'graded'
                              ? 'bg-green-600 text-white'
                              : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/30'
                          }`}
                        >
                          Notés ({assignments.filter(a => a.status === 'Noté').length})
                        </button>
                      </div>
                    </div>

                    {/* Statistiques */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-slate-600">Total</p>
                            <p className="text-2xl font-bold text-slate-900">{assignments.length}</p>
                          </div>
                          <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-slate-600" />
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Liste des devoirs */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {getFilteredAssignments().map(assignment => (
                        <AssignmentCard key={assignment.id} assignment={assignment} />
                      ))}
                    </div>

                    {getFilteredAssignments().length === 0 && (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FileText className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 mb-2">Aucun devoir trouvé</h3>
                        <p className="text-slate-600">Aucun devoir ne correspond aux filtres sélectionnés.</p>
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'profile' && (
                  <ProfileSection />
                )}

                {activeTab === 'settings' && (
                  <SettingsSection />
                )}

                {activeTab !== 'courses' && activeTab !== 'assignments' && activeTab !== 'profile' && activeTab !== 'settings' && (
                  <div className="bg-white rounded-2xl p-8 border border-slate-200">
                    <p className="text-slate-600">Contenu de l'onglet "{activeTab}" à développer...</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Modal de soumission de devoir */}
        {isSubmissionModalOpen && selectedAssignment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Devoir - {selectedAssignment.course}</h2>
                <button
                  onClick={closeSubmissionModal}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Formulaire de soumission */}
              <div className="space-y-4">
                {/* Upload de fichier */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Fichier à soumettre *
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-slate-400 transition-colors">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                      className="hidden"
                      id="assignment-file"
                    />
                    <label htmlFor="assignment-file" className="cursor-pointer">
                      <div className="space-y-3">
                        <svg className="mx-auto h-10 w-10 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="text-slate-600">
                          <span className="font-medium">Cliquez pour sélectionner un fichier</span>
                          <p className="text-xs mt-1">PDF, Word, PowerPoint ou texte</p>
                        </div>
                      </div>
                    </label>
                  </div>
                  {submissionFile && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-700">
                        <span className="font-medium">✓</span> {submissionFile.name}
                      </p>
                    </div>
                  )}
                </div>

                {/* Titre du devoir */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Titre du devoir *
                  </label>
                  <input
                    type="text"
                    value={submissionTitle}
                    onChange={(e) => setSubmissionTitle(e.target.value)}
                    placeholder="Saisissez le titre de votre devoir..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Commentaires */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Commentaires (optionnel)
                  </label>
                  <textarea
                    value={submissionComments}
                    onChange={(e) => setSubmissionComments(e.target.value)}
                    placeholder="Ajoutez des commentaires sur votre travail..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                  />
                </div>

                {/* Messages d'erreur et de succès */}
                {submissionError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{submissionError}</p>
                  </div>
                )}

                {submissionSuccess && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">
                      ✅ Devoir soumis avec succès !
                    </p>
                  </div>
                )}

                {/* Boutons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={closeSubmissionModal}
                    className="flex-1 px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSubmissionSubmit}
                    disabled={!submissionFile || !submissionTitle.trim() || isSubmitting}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed font-medium"
                  >
                    {isSubmitting ? 'Soumission...' : 'Soumettre'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal des notifications */}
        {showNotifications && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                    <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Notifications</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{notifications.length} message(s)</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowNotifications(false)} 
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                  <p className="text-slate-500 dark:text-slate-400">Aucune notification pour le moment</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map(notification => (
                    <div 
                      key={notification.id} 
                      className={`p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md ${
                        notification.is_read 
                          ? 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600' 
                          : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-600'
                      }`}
                      onClick={() => handleViewNotification(notification)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold text-slate-900 dark:text-white">
                              {notification.teacher_messages.message_title}
                            </h4>
                            {!notification.is_read && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                                Nouveau
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                            Cours : {notification.teacher_messages.course_name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {new Date(notification.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal détail notification */}
        {showNotificationDetail && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Message de l'enseignant</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {new Date(showNotificationDetail.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowNotificationDetail(null)} 
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                    {showNotificationDetail.teacher_messages.message_title}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Cours : {showNotificationDetail.teacher_messages.course_name}
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                  <p className="text-slate-900 dark:text-white whitespace-pre-wrap">
                    {showNotificationDetail.teacher_messages.message_content}
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setShowNotificationDetail(null)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}