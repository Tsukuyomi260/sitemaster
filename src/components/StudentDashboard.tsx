import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Award,
  FileText,
  Play,
  Download,
  Bell,
  User,
  LogOut,
  Home,
  GraduationCap,
  ClipboardCheck,
  BarChart3,
  Settings
} from 'lucide-react';

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

// AJOUTER APRÈS LES IMPORTS
const coursParSemestre = [
  {
    semestre: 'Semestre 1',
    cours: [
      { nom: "PSYCHOPEDAGOGIE DE L'ENFANT ET DE L'ADOLESCENT", fichier: "01 S1 PSYCHOPEDAGOGIE DE L'ENFANT ET DE L'ADOLESCENT.pdf" },
      { nom: "PSYCHOLOGIE DE L'APPRENTISSAGE", fichier: "02 S1 PSYCHOLOGIE DE L'APPRENTISSAGE.pdf" },
      { nom: "Administration des etablissements eftp et gpec en eftp", fichier: "03 S1 Administration des etablissements eftp et gpec en eftp.pdf" },
      { nom: "Etude des Textes Fondamentaux de l'EFTP", fichier: "04 S1 Etude des Textes Fondamentaux de l'EFTP.pdf" },
      { nom: "GEOGRAPHIE DE L'EFTP", fichier: "05 S1 GEOGRAPHIE DE L'EFTP.pdf" },
      { nom: "Analyse, Conception et Réalisation de Manuels Pédagogiques pour l'EFTP", fichier: "06 S1 Analyse, Conception et Réalisation de Manuels Pédagogiques pour l'EFTP.pdf" },
      { nom: "Théorie didactique", fichier: "07 S1 Théorie didactique.pdf" },
      { nom: "Fondements de la Didactique des Disciplines de l'EFTP", fichier: "08 S1 Fondements de la Didactique des Disciplines de l'EFTP.pdf" },
      { nom: "Anglais Technique", fichier: "09 S1 Anglais Technique.pdf" },
      { nom: "Communication scientifique en anglais", fichier: "10 S1 Communication scientifique en anglais.pdf" },
      { nom: "Projet apprenant", fichier: "11 S1 Projet apprenant.pdf" },
    ]
  },
  {
    semestre: 'Semestre 2',
    cours: [
      { nom: "Délinquance Juvénile", fichier: "01 S2 Délinquance Juvénile.pdf" },
      { nom: "Epistomologie et science de l'education et de la formation", fichier: "02 S2 Epistomologie et science de l'education et de la formation.pdf" },
      { nom: "Gestion de classes en situation formelle dans l'EFTP", fichier: "03 S2 Gestion de classes en situation formelle dans l'EFTP.pdf" },
      { nom: "Gestion de classes de contexte de formation professionnelle", fichier: "04 S2 Gestion de classes de contexte de formation professionnelle.pdf" },
      { nom: "Didactique de la matière en EFTP", fichier: "05 S2 Didactique de la matière en EFTP.pdf" },
      { nom: "Docimologie", fichier: "06 S2 Docimologie.pdf" },
      { nom: "Pedagogie et Andragogie", fichier: "07 - 08 S2 Pedagogie et Andragogie.pdf" },
      { nom: "Sociologie de l'Education et Réalité de l'EFTP", fichier: "09 S2 Sociologie de l'Education et Réalité de l'EFTP.pdf" },
      { nom: "Education des apprenants à besoin spécifiques", fichier: "10 S2 Education des apprenants à besoin spécifiques.pdf" },
      { nom: "Ethique et déontologie de la profession enseignante", fichier: "11 S2 Ethique et déontologie de la profession enseignante.pdf" },
      { nom: "Enseignement et formation en entreprise", fichier: "12 S2 Enseignement et formation en entreprise.pdf" },
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

export default function StudentDashboard({ studentName, onLogout }: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [watchedVideos, setWatchedVideos] = useState<Set<string>>(new Set());
  const [assignmentFilter, setAssignmentFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

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

  // Données du profil étudiant
  const studentProfile: StudentProfile = {
    id: 'STU001',
    firstName: 'Elodie',
    lastName: 'AVOCE',
    email: 'elodie.avoce@student.university.edu',
    phone: '+229 90 12 34 56',
    matricule: '24654STI25',
    yearOfStudy: '2ème année',
    program: 'Master en Sciences et Technologies de l\'Information',
    department: 'Informatique et Télécommunications',
    advisor: 'Dr. GNONLONFOUN Jean Marc',
    enrollmentDate: '2023-09-15',
    address: '123 Rue de l\'Université, Cotonou, Bénin',
    emergencyContact: 'Marie AVOCE',
    emergencyPhone: '+229 90 98 76 54'
  };

  // Données fictives
  const courses: Course[] = [
    {
      id: 1,
      title: "Psychologie de l'enfant et de l'adolescent",
      instructor: 'Dr. GNONLONFOUN Jean Marc',
      progress: 75,
      nextDeadline: '2025-07-20',
      status: 'En cours',
      color: 'bg-blue-500',
      description: 'Étude du développement psychologique de l\'enfant et de l\'adolescent',
      credits: 6,
      semester: 'Semestre 1',
      lastActivity: 'Il y a 2 jours',
      assignmentsCount: 3,
      completedAssignments: 2
    },
    {
      id: 2,
      title: 'Chimie des aliments',
      instructor: 'Dr. Guevarra NONVIHO',
      progress: 90,
      nextDeadline: '2025-07-25',
      status: 'Presque terminé',
      color: 'bg-green-500',
      description: 'Analyse chimique et composition des aliments',
      credits: 4,
      semester: 'Semestre 1',
      lastActivity: 'Aujourd\'hui',
      assignmentsCount: 4,
      completedAssignments: 4
    },
    {
      id: 3,
      title: 'Alimentation humaine',
      instructor: 'Dr. KLOTOE Jean Robert',
      progress: 45,
      nextDeadline: '2025-07-30',
      status: 'En cours',
      color: 'bg-orange-500',
      description: 'Besoins nutritionnels et alimentation équilibrée',
      credits: 5,
      semester: 'Semestre 1',
      lastActivity: 'Il y a 1 semaine',
      assignmentsCount: 2,
      completedAssignments: 1
    }
  ];

  const assignments: Assignment[] = coursParSemestre.flatMap((semestre, semestreIdx) =>
    semestre.cours.map((cours, idx) =>
      createAssignment(
        semestreIdx * 100 + idx + 1,
        `Devoir à rendre - ${cours.nom}`,
        cours.nom,
        semestreIdx * 100 + idx + 1,
        `2025-09-${(idx+10).toString().padStart(2, '0')}`
      )
    )
  );

  const recentResults: Result[] = [
    {
      id: 1,
      title: 'Rapport d\'observation',
      course: 'Psychologie de l\'enfant et de l\'adolescent',
      courseId: 1,
      score: 17,
      maxScore: 20,
      date: '2025-07-28',
      type: 'TP',
      weight: 1,
      feedback: 'Excellent travail d\'observation. Analyse pertinente des comportements observés.'
    },
    {
      id: 2,
      title: 'Analyse d\'un aliment',
      course: 'Chimie des aliments',
      courseId: 2,
      score: 18,
      maxScore: 20,
      date: '2025-07-23',
      type: 'TP',
      weight: 1,
      feedback: 'Analyse très complète et méthodique. Bonne maîtrise des techniques.'
    },
    {
      id: 3,
      title: 'Quiz - Développement cognitif',
      course: 'Psychologie de l\'enfant et de l\'adolescent',
      courseId: 1,
      score: 16,
      maxScore: 20,
      date: '2025-07-15',
      type: 'Devoir',
      weight: 0.8,
      feedback: 'Bonne compréhension des concepts. Quelques imprécisions mineures.'
    },
    {
      id: 4,
      title: 'Examen partiel - Chimie',
      course: 'Chimie des aliments',
      courseId: 2,
      score: 19,
      maxScore: 20,
      date: '2025-07-10',
      type: 'Examen',
      weight: 1.5,
      feedback: 'Excellente performance. Maîtrise parfaite du programme.'
    },
    {
      id: 5,
      title: 'Projet - Plan nutritionnel',
      course: 'Alimentation humaine',
      courseId: 3,
      score: 15,
      maxScore: 20,
      date: '2025-07-05',
      type: 'Projet',
      weight: 1.2,
      feedback: 'Travail satisfaisant mais manque de précision dans certaines parties.'
    },
    {
      id: 6,
      title: 'TP - Analyse nutritionnelle',
      course: 'Alimentation humaine',
      courseId: 3,
      score: 14,
      maxScore: 20,
      date: '2025-06-28',
      type: 'TP',
      weight: 1,
      feedback: 'Bonne approche méthodologique. Résultats corrects.'
    }
  ];

  // Données fictives pour les supports de cours
  const courseSupports = {
    1: {
      videos: [
        { id: 1, title: 'Introduction à la psychologie de l\'enfant', duration: '45:30', url: '/videos/psychologie-enfant/intro.mp4', watched: false, isLocal: true },
        { id: 2, title: 'Développement cognitif', duration: '52:15', url: '#', watched: false, isLocal: false },
        { id: 3, title: 'Adolescence et identité', duration: '38:45', url: '#', watched: false, isLocal: false }
      ],
      documents: [
        { id: 1, title: 'Cours 1 - Introduction', type: 'PDF', size: '2.3 MB', url: '#' },
        { id: 2, title: 'Exercices pratiques', type: 'DOCX', size: '1.8 MB', url: '#' },
        { id: 3, title: 'Bibliographie', type: 'PDF', size: '856 KB', url: '#' }
      ],
      assignments: [
        { id: 1, title: 'Analyse d\'un cas clinique', dueDate: '2025-07-20', status: 'À rendre', type: 'Devoir' },
        { id: 2, title: 'Présentation orale', dueDate: '2025-07-25', status: 'En cours', type: 'Devoir' }
      ],
      practicalWorks: [
        { id: 1, title: 'Observation d\'un enfant', dueDate: '2025-07-30', status: 'Pas commencé', type: 'TP' },
        { id: 2, title: 'Rapport d\'observation', dueDate: '2025-08-05', status: 'Pas commencé', type: 'TP' }
      ]
    },
    2: {
      videos: [
        { id: 1, title: 'Composition chimique des aliments', duration: '40:20', url: '#', watched: true, isLocal: false },
        { id: 2, title: 'Analyse nutritionnelle', duration: '35:10', url: '#', watched: true, isLocal: false }
      ],
      documents: [
        { id: 1, title: 'Cours - Chimie des aliments', type: 'PDF', size: '3.1 MB', url: '#' },
        { id: 2, title: 'Protocoles de laboratoire', type: 'PDF', size: '2.5 MB', url: '#' }
      ],
      assignments: [
        { id: 1, title: 'Analyse d\'un aliment', dueDate: '2025-07-25', status: 'Terminé', type: 'Devoir' }
      ],
      practicalWorks: [
        { id: 1, title: 'Expérience en laboratoire', dueDate: '2025-07-28', status: 'Terminé', type: 'TP' }
      ]
    },
    3: {
      videos: [
        { id: 1, title: 'Besoins nutritionnels', duration: '48:15', url: '#', watched: false, isLocal: false },
        { id: 2, title: 'Alimentation équilibrée', duration: '42:30', url: '#', watched: false, isLocal: false }
      ],
      documents: [
        { id: 1, title: 'Cours - Alimentation humaine', type: 'PDF', size: '2.8 MB', url: '#' },
        { id: 2, title: 'Guide nutritionnel', type: 'PDF', size: '1.5 MB', url: '#' }
      ],
      assignments: [
        { id: 1, title: 'Plan alimentaire personnalisé', dueDate: '2025-07-30', status: 'En cours', type: 'Devoir' }
      ],
      practicalWorks: [
        { id: 1, title: 'Évaluation nutritionnelle', dueDate: '2025-08-02', status: 'Pas commencé', type: 'TP' }
      ]
    }
  };

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
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const CourseCard: React.FC<CourseCardProps> = ({ course }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 mb-1">{course.title}</h3>
          <p className="text-sm text-slate-600">Prof. {course.instructor}</p>
        </div>
        <span className={`w-3 h-3 rounded-full ${course.color}`}></span>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-600">Progression</span>
          <span className="text-sm font-medium text-slate-900">{course.progress}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${course.color}`}
            style={{ width: `${course.progress}%` }}
          ></div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">Échéance: {course.nextDeadline}</span>
        <div className="flex space-x-2">
          <button 
            onClick={() => handleViewCourse(course)}
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95"
          >
            Voir le cours
          </button>
          <button className="text-xs font-medium px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95">
            Télécharger
          </button>
        </div>
      </div>
    </div>
  );

  const DetailedCourseCard: React.FC<{ course: Course }> = ({ course }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200">
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
          <h3 className="font-semibold text-slate-900 mb-1 text-lg">{course.title}</h3>
          <p className="text-sm text-slate-600 mb-2">Prof. {course.instructor}</p>
          <p className="text-sm text-slate-500 mb-3">{course.description}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-slate-500">Crédits</p>
          <p className="font-medium text-slate-900">{course.credits} ECTS</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Semestre</p>
          <p className="font-medium text-slate-900">{course.semester}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Devoirs</p>
          <p className="font-medium text-slate-900">{course.completedAssignments}/{course.assignmentsCount}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Dernière activité</p>
          <p className="font-medium text-slate-900">{course.lastActivity}</p>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-600">Progression</span>
          <span className="text-sm font-medium text-slate-900">{course.progress}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full ${course.color}`}
            style={{ width: `${course.progress}%` }}
          ></div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">Prochaine échéance</p>
          <p className="text-sm font-medium text-slate-900">{course.nextDeadline}</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => handleViewCourse(course)}
            className="text-sm font-medium px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95"
          >
            Voir le cours
          </button>
          <button className="text-sm font-medium px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95">
            Télécharger
          </button>
        </div>
      </div>
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
              <p className="text-slate-600">Prof. {course.instructor}</p>
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
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Informations du cours</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Crédits:</span>
                  <span className="font-medium">{course.credits} ECTS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Semestre:</span>
                  <span className="font-medium">{course.semester}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Progression:</span>
                  <span className="font-medium">{course.progress}%</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Description</h3>
              <p className="text-slate-600 text-sm">{course.description}</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Prochaine échéance</h3>
              <p className="text-slate-600">{course.nextDeadline}</p>
            </div>
          </div>
        </div>

        {/* Videos */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4">Vidéos de cours</h3>
          
          {/* Video Player */}
          {selectedVideo && (
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
                <h4 className="font-medium text-slate-900">{supports.videos[selectedVideo - 1].title}</h4>
                <button 
                  onClick={() => setSelectedVideo(null)}
                  className="text-sm text-slate-600 hover:text-slate-900"
                >
                  Fermer
                </button>
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            {supports.videos.map((video, index) => {
              const isUnlocked = isVideoUnlocked(course.id, index);
              const isWatched = isVideoWatched(course.id, video.id);
              
              return (
                <div key={video.id} className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  isUnlocked 
                    ? 'border-slate-200 hover:bg-slate-50' 
                    : 'border-slate-100 bg-slate-50'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      isWatched ? 'bg-green-500' : 
                      isUnlocked ? 'bg-slate-300' : 'bg-slate-200'
                    }`}></div>
                    <div>
                      <p className={`font-medium ${
                        isUnlocked ? 'text-slate-900' : 'text-slate-500'
                      }`}>
                        {video.title}
                        {!isUnlocked && (
                          <span className="ml-2 text-xs text-slate-400">(Vidéo précédente requise)</span>
                        )}
                      </p>
                      <p className="text-sm text-slate-600">{video.duration}</p>
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
            {supports.documents.map((doc) => (
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
            {supports.assignments.map((assignment) => (
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
            {supports.practicalWorks.map((tp) => (
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
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${getPriorityColor(assignment.priority)}`}></div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
              {assignment.status}
            </span>
            <div className="flex items-center space-x-1 text-slate-500">
              {getTypeIcon(assignment.type)}
              <span className="text-xs">{assignment.type}</span>
            </div>
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">{assignment.title}</h3>
          <p className="text-sm text-slate-600 mb-2">{assignment.course}</p>
          <p className="text-sm text-slate-500 mb-3">{assignment.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-slate-500">Échéance</p>
          <p className="font-medium text-slate-900">{assignment.dueDate}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Points</p>
          <p className="font-medium text-slate-900">{assignment.points} pts</p>
        </div>
        {assignment.submittedAt && (
          <div>
            <p className="text-xs text-slate-500">Rendu le</p>
            <p className="font-medium text-slate-900">{assignment.submittedAt}</p>
          </div>
        )}
        {assignment.grade && (
          <div>
            <p className="text-xs text-slate-500">Note</p>
            <p className="font-medium text-slate-900">{assignment.grade}/{assignment.maxGrade}</p>
          </div>
        )}
      </div>

      {assignment.feedback && (
        <div className="mb-4 p-3 bg-slate-50 rounded-lg">
          <p className="text-xs text-slate-500 mb-1">Feedback</p>
          <p className="text-sm text-slate-700">{assignment.feedback}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          {assignment.status === 'À rendre' && (
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
              Rendre
            </button>
          )}
          {assignment.status === 'En cours' && (
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
              Continuer
            </button>
          )}
          <button className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm">
            Voir détails
          </button>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Priorité</p>
          <p className={`text-xs font-medium ${
            assignment.priority === 'high' ? 'text-red-600' :
            assignment.priority === 'medium' ? 'text-orange-600' :
            'text-green-600'
          }`}>
            {assignment.priority === 'high' ? 'Haute' :
             assignment.priority === 'medium' ? 'Moyenne' : 'Basse'}
          </p>
        </div>
      </div>
    </div>
  );

  const AssignmentItem: React.FC<AssignmentItemProps> = ({ assignment }) => (
    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:shadow-sm transition-all duration-200">
      <div className="flex items-center space-x-3">
        <div className={`w-2 h-2 rounded-full ${getPriorityColor(assignment.priority)}`}></div>
        <div>
          <h4 className="font-medium text-slate-900">{assignment.title}</h4>
          <p className="text-sm text-slate-600">{assignment.course}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm text-slate-900">{assignment.dueDate}</p>
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
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <div className="flex items-center space-x-1 text-slate-500">
              {getTypeIcon(result.type)}
              <span className="text-xs">{result.type}</span>
            </div>
            <span className="text-xs text-slate-500">{result.course}</span>
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">{result.title}</h3>
          <p className="text-sm text-slate-600 mb-2">Rendu le {result.date}</p>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${getGradeColor(result.score, result.maxScore)}`}>
            {result.score}/{result.maxScore}
          </div>
          <div className="text-sm text-slate-500">
            {Math.round((result.score / result.maxScore) * 100)}%
          </div>
          <div className="text-lg">{getGradeEmoji(result.score, result.maxScore)}</div>
        </div>
      </div>

      {result.feedback && (
        <div className="mb-4 p-3 bg-slate-50 rounded-lg">
          <p className="text-xs text-slate-500 mb-1">Feedback</p>
          <p className="text-sm text-slate-700">{result.feedback}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <span className="text-xs text-slate-500">Poids: {result.weight}x</span>
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
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-4">Photo de profil</h3>
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden mx-auto mb-4">
                    {profilePhoto ? (
                      <img 
                        src={profilePhoto} 
                        alt="Photo de profil" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-slate-400" />
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
                <p className="text-sm text-slate-600 mt-2">
                  {profilePhoto ? 'Photo personnalisée' : 'Aucune photo'}
                </p>
              </div>
            </div>
          </div>

          {/* Informations personnelles */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 mb-6">
              <h3 className="font-semibold text-slate-900 mb-4">Informations personnelles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Prénom</label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-slate-900">{formData.firstName}</p>
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
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Adresse</label>
                  {isEditingProfile ? (
                    <textarea
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-slate-900">{formData.address}</p>
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
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Programme</label>
                  <p className="text-slate-900">{formData.program}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Département</label>
                  <p className="text-slate-900">{formData.department}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Conseiller académique</label>
                  <p className="text-slate-900">{formData.advisor}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date d'inscription</label>
                  <p className="text-slate-900">{formData.enrollmentDate}</p>
                </div>
              </div>
            </div>

            {/* Contact d'urgence */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-4">Contact d'urgence</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nom du contact</label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      value={formData.emergencyContact}
                      onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-slate-900">{formData.emergencyContact}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone d'urgence</label>
                  {isEditingProfile ? (
                    <input
                      type="tel"
                      value={formData.emergencyPhone}
                      onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-slate-900">{formData.emergencyPhone}</p>
                  )}
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
            <h2 className="text-2xl font-bold text-slate-900">Paramètres</h2>
            <p className="text-slate-600">Personnalisez votre expérience utilisateur</p>
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
              Réinitialiser
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
              Sauvegarder
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Apparence */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
              </svg>
              Apparence
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Thème</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleThemeChange('light')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      settings.theme === 'light'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                      <span className="font-medium">Clair</span>
                    </div>
                  </button>
                  <button
                    onClick={() => handleThemeChange('dark')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      settings.theme === 'dark'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-slate-700 rounded-full"></div>
                      <span className="font-medium">Sombre</span>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Langue</label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value as 'fr' | 'en' }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Taille de police</label>
                <select
                  value={settings.accessibility.fontSize}
                  onChange={(e) => handleSettingChange('accessibility', 'fontSize', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="small">Petite</option>
                  <option value="medium">Moyenne</option>
                  <option value="large">Grande</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Notifications
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Notifications par email</p>
                  <p className="text-sm text-slate-600">Recevoir les notifications par email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.email}
                    onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Notifications push</p>
                  <p className="text-sm text-slate-600">Recevoir les notifications sur le navigateur</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.push}
                    onChange={(e) => handleSettingChange('notifications', 'push', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Notifications SMS</p>
                  <p className="text-sm text-slate-600">Recevoir les notifications par SMS</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.sms}
                    onChange={(e) => handleSettingChange('notifications', 'sms', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Confidentialité */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Confidentialité
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Profil public</p>
                  <p className="text-sm text-slate-600">Permettre aux autres de voir votre profil</p>
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
                  <p className="font-medium text-slate-900">Progression visible</p>
                  <p className="text-sm text-slate-600">Afficher votre progression aux autres</p>
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
                  <p className="font-medium text-slate-900">Autoriser les contacts</p>
                  <p className="text-sm text-slate-600">Permettre aux autres de vous contacter</p>
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

          {/* Accessibilité */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Accessibilité
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Contraste élevé</p>
                  <p className="text-sm text-slate-600">Améliorer la lisibilité</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.accessibility.highContrast}
                    onChange={(e) => handleSettingChange('accessibility', 'highContrast', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Réduire les animations</p>
                  <p className="text-sm text-slate-600">Désactiver les animations</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.accessibility.reduceMotion}
                    onChange={(e) => handleSettingChange('accessibility', 'reduceMotion', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

                 {/* Actions avancées */}
         <div className="mt-6 bg-white rounded-2xl p-6 border border-slate-200">
           <h3 className="font-semibold text-slate-900 mb-4">Actions avancées</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <button className="p-4 text-left border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
               <div className="flex items-center space-x-3">
                 <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                   <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                   </svg>
                 </div>
                 <div>
                   <p className="font-medium text-slate-900">Exporter mes données</p>
                   <p className="text-sm text-slate-600">Télécharger mes informations</p>
                 </div>
               </div>
             </button>

             <button className="p-4 text-left border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
               <div className="flex items-center space-x-3">
                 <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                   <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                   </svg>
                 </div>
                 <div>
                   <p className="font-medium text-slate-900">Signaler un problème</p>
                   <p className="text-sm text-slate-600">Nous aider à améliorer</p>
                 </div>
               </div>
             </button>
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
                <img src="/logo-enset.jpeg" alt="Logo ENSET-MRTDDEFTP" className="object-contain w-full h-full" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900 dark:text-white">ENSET-MRTDDEFTP</h1>
                <p className="text-xs text-slate-600 dark:text-slate-400">Espace Étudiant MRTDDEFTP</p>
              </div>
            </div>
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-slate-900 dark:bg-slate-700 text-white'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
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
              <p className="font-medium text-slate-900 dark:text-white">{studentName}</p>
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
        <span className="ml-4 font-bold text-lg text-slate-900">ENSET-MRTDDEFTP</span>
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
                <img src="/logo-enset.jpeg" alt="Logo ENSET-MRTDDEFTP" className="object-contain w-full h-full" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900">ENSET-MRTDDEFTP</h1>
                <p className="text-xs text-slate-600">Espace Étudiant MRTDDEFTP</p>
              </div>
            </div>
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
            <div className="mt-8 border-t pt-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{studentName}</p>
                  <p className="text-xs text-slate-600">Étudiant Master</p>
                </div>
              </div>
              <button
                onClick={() => { setIsMobileMenuOpen(false); onLogout(); }}
                className="w-full flex items-center space-x-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-all duration-200"
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
                <h1 className="text-3xl font-bold text-slate-900">
                  {activeTab === 'dashboard' ? 'Tableau de bord' :
                   activeTab === 'courses' ? 'Mes cours' :
                   activeTab === 'assignments' ? 'Devoirs' :
                   activeTab === 'profile' ? 'Profil' : 'Paramètres'}
                </h1>
                <p className="text-slate-600 mt-1">Bienvenue, {studentName}</p>
              </div>
              <div className="flex items-center space-x-4">
                <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl">
                  <Bell className="w-5 h-5" />
                </button>
                <button onClick={onLogout} className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Dashboard Content */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <StatCard
                    icon={BookOpen}
                    title="Cours actifs"
                    value="3"
                    subtitle="En progression"
                    color="bg-blue-500"
                  />
                  <StatCard
                    icon={ClipboardCheck}
                    title="Devoirs à rendre"
                    value="2"
                    subtitle="Cette semaine"
                    color="bg-orange-500"
                  />
                  <StatCard
                    icon={Award}
                    title="Moyenne générale"
                    value="16.2"
                    subtitle="Sur 20"
                    color="bg-green-500"
                  />
                  <StatCard
                    icon={Calendar}
                    title="Jours restants"
                    value="45"
                    subtitle="Fin de semestre"
                    color="bg-purple-500"
                  />
                </div>

                {/* Courses Overview */}
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 mb-4">Mes cours</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {courses.map(course => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">Prochains devoirs</h2>
                    <div className="space-y-3">
                      {assignments.slice(0, 3).map(assignment => (
                        <AssignmentItem key={assignment.id} assignment={assignment} />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">Résultats récents</h2>
                    <div className="space-y-3">
                      {recentResults.map(result => (
                        <ResultItem key={result.id} result={result} />
                      ))}
                    </div>
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
                        <h2 className="text-2xl font-bold text-slate-900">Mes cours</h2>
                        <p className="text-slate-600">Téléchargez vos cours par semestre</p>
                      </div>
                    </div>
                    <div className="space-y-8">
                      {coursParSemestre.map((semestre) => (
                        <div key={semestre.semestre}>
                          <h3 className="text-xl font-semibold text-slate-900 mb-4">{semestre.semestre}</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {semestre.cours.map((cours) => (
                              <div key={cours.fichier} className="bg-white rounded-xl p-4 border border-slate-200 flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-slate-900">{cours.nom}</p>
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
                        <h2 className="text-2xl font-bold text-slate-900">Mes devoirs</h2>
                        <p className="text-slate-600">Gérez vos devoirs et suivez vos rendus</p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                          Rechercher
                        </button>
                        <button className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors">
                          Nouveau devoir
                        </button>
                      </div>
                    </div>

                    {/* Filtres */}
                    <div className="bg-white rounded-2xl p-4 border border-slate-200 mb-6">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setAssignmentFilter('all')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            assignmentFilter === 'all'
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          Tous ({assignments.length})
                        </button>
                        <button
                          onClick={() => setAssignmentFilter('pending')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            assignmentFilter === 'pending'
                              ? 'bg-red-600 text-white'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          À rendre ({assignments.filter(a => a.status === 'À rendre').length})
                        </button>
                        <button
                          onClick={() => setAssignmentFilter('submitted')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            assignmentFilter === 'submitted'
                              ? 'bg-blue-600 text-white'
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          }`}
                        >
                          Rendus ({assignments.filter(a => a.status === 'Rendu').length})
                        </button>
                        <button
                          onClick={() => setAssignmentFilter('graded')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            assignmentFilter === 'graded'
                              ? 'bg-green-600 text-white'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          Notés ({assignments.filter(a => a.status === 'Noté').length})
                        </button>
                      </div>
                    </div>

                    {/* Statistiques */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-white rounded-2xl p-4 border border-slate-200">
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
                      <div className="bg-white rounded-2xl p-4 border border-slate-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-slate-600">À rendre</p>
                            <p className="text-2xl font-bold text-red-600">{assignments.filter(a => a.status === 'À rendre').length}</p>
                          </div>
                          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <Clock className="w-5 h-5 text-red-600" />
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-2xl p-4 border border-slate-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-slate-600">Rendus</p>
                            <p className="text-2xl font-bold text-blue-600">{assignments.filter(a => a.status === 'Rendu').length}</p>
                          </div>
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-blue-600" />
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-2xl p-4 border border-slate-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-slate-600">Notés</p>
                            <p className="text-2xl font-bold text-green-600">{assignments.filter(a => a.status === 'Noté').length}</p>
                          </div>
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Award className="w-5 h-5 text-green-600" />
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
      </div>
    </div>
  );
}