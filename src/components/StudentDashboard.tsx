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
}

interface Assignment {
  id: number;
  title: string;
  course: string;
  dueDate: string;
  status: string;
  priority: 'high' | 'medium' | 'low';
}

interface Result {
  id: number;
  title: string;
  score: number;
  maxScore: number;
  date: string;
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

export default function StudentDashboard({ studentName, onLogout }: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Données fictives
  const courses: Course[] = [
    {
      id: 1,
      title: "Psychologie de l'enfant et de l'adolescent",
      instructor: 'Dr. GNONLONFOUN Jean Marc',
      progress: 75,
      nextDeadline: '2025-07-20',
      status: 'En cours',
      color: 'bg-blue-500'
    },
    {
      id: 2,
      title: 'Chimie des aliments',
      instructor: 'Dr. Guevarra NONVIHO',
      progress: 90,
      nextDeadline: '2025-07-25',
      status: 'Presque terminé',
      color: 'bg-green-500'
    },
    {
      id: 3,
      title: 'Alimentation humaine',
      instructor: 'Dr. KLOTOE Jean Robert',
      progress: 45,
      nextDeadline: '2025-07-30',
      status: 'En cours',
      color: 'bg-orange-500'
    }
  ];

  const assignments: Assignment[] = [
    {
      id: 1,
      title: 'Projet Machine Learning',
      course: 'Intelligence Artificielle',
      dueDate: '2025-07-20',
      status: 'À rendre',
      priority: 'high'
    },
    {
      id: 2,
      title: 'Portfolio React',
      course: 'Développement Web',
      dueDate: '2025-07-25',
      status: 'En cours',
      priority: 'medium'
    },
    {
      id: 3,
      title: 'Analyse de risques',
      course: 'Gestion de Projet',
      dueDate: '2025-07-30',
      status: 'Pas commencé',
      priority: 'low'
    }
  ];

  const recentResults: Result[] = [
    {
      id: 1,
      title: 'Quiz IA - Réseaux de neurones',
      score: 18,
      maxScore: 20,
      date: '2025-07-15'
    },
    {
      id: 2,
      title: 'Devoir JavaScript',
      score: 16,
      maxScore: 20,
      date: '2025-07-12'
    },
    {
      id: 3,
      title: 'Quiz Gestion - Méthodes Agiles',
      score: 14,
      maxScore: 20,
      date: '2025-07-10'
    }
  ];

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: Home },
    { id: 'courses', label: 'Mes cours', icon: BookOpen },
    { id: 'assignments', label: 'Devoirs', icon: ClipboardCheck },
    { id: 'results', label: 'Résultats', icon: BarChart3 },
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
        <button className="text-sm text-slate-700 hover:text-slate-900 font-medium">
          Voir le cours
        </button>
      </div>
    </div>
  );

  const AssignmentItem: React.FC<AssignmentItemProps> = ({ assignment }) => (
    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:shadow-sm transition-all duration-200">
      <div className="flex items-center space-x-3">
        <div className={`w-2 h-2 rounded-full ${
          assignment.priority === 'high' ? 'bg-red-500' :
          assignment.priority === 'medium' ? 'bg-orange-500' : 'bg-green-500'
        }`}></div>
        <div>
          <h4 className="font-medium text-slate-900">{assignment.title}</h4>
          <p className="text-sm text-slate-600">{assignment.course}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm text-slate-900">{assignment.dueDate}</p>
        <span className={`text-xs px-2 py-1 rounded-full ${
          assignment.status === 'À rendre' ? 'bg-red-100 text-red-700' :
          assignment.status === 'En cours' ? 'bg-orange-100 text-orange-700' :
          'bg-slate-100 text-slate-700'
        }`}>
          {assignment.status}
        </span>
      </div>
    </div>
  );

  const ResultItem: React.FC<ResultItemProps> = ({ result }) => (
    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
      <div>
        <h4 className="font-medium text-slate-900">{result.title}</h4>
        <p className="text-sm text-slate-600">{result.date}</p>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold text-slate-900">{result.score}/{result.maxScore}</p>
        <p className="text-sm text-slate-600">{Math.round((result.score / result.maxScore) * 100)}%</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar desktop */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg border-r border-slate-200 z-10 hidden md:block">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900">Plateforme Master</h1>
              <p className="text-xs text-slate-600">Espace Étudiant</p>
            </div>
          </div>
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
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
        </div>
        <div className="absolute bottom-0 w-full p-6 border-t border-slate-200">
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
            onClick={onLogout}
            className="w-full flex items-center space-x-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-all duration-200"
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
        <span className="ml-4 font-bold text-lg text-slate-900">Plateforme Master</span>
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
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900">Plateforme Master</h1>
                <p className="text-xs text-slate-600">Espace Étudiant</p>
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {activeTab === 'dashboard' ? 'Tableau de bord' :
               activeTab === 'courses' ? 'Mes cours' :
               activeTab === 'assignments' ? 'Devoirs' :
               activeTab === 'results' ? 'Résultats' :
               activeTab === 'profile' ? 'Profil' : 'Paramètres'}
            </h1>
            <p className="text-slate-600 mt-1">Bienvenue, {studentName}</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl">
              <Bell className="w-5 h-5" />
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
          <div className="bg-white rounded-2xl p-8 border border-slate-200">
            <p className="text-slate-600">Contenu de l'onglet "{activeTab}" à développer...</p>
          </div>
        )}
      </div>
    </div>
  );
}