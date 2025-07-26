import React, { useState, useEffect } from 'react';
import { User, BookOpen, ClipboardCheck, LogOut, Bell, Settings, ChevronUp } from 'lucide-react';
import { getAllStudents, getAllAssignmentSubmissions } from '../api';

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
  blocked?: boolean;
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
const fakeCourses = [
  { id: 1, name: "01 S1 PSYCHOPEDAGOGIE DE L'ENFANT ET DE L'ADOLESCENT" },
  { id: 2, name: "02 S1 PSYCHOLOGIE DE L'APPRENTISSAGE" },
  { id: 3, name: "03 S1 ADMINISTRATION DES ETABLISSEMENTS D’EFTP ET GPEC EN EFTP" },
];
const fakeNotifications = [
  { id: 1, message: 'Réunion importante demain à 10h', target: 'all' },
  { id: 2, message: 'Merci de rendre vos devoirs à temps', target: 'students' },
];

export default function AdminDashboard({ adminName, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('students');
  const [students, setStudents] = useState<Student[]>([]);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [courses, setCourses] = useState(fakeCourses);
  const [notifications, setNotifications] = useState(fakeNotifications);
  const [newCourse, setNewCourse] = useState('');
  const [newNotification, setNewNotification] = useState('');
  const [notificationTarget, setNotificationTarget] = useState('all');

  // Filtres pour les étudiants
  const [selectedStudentAnnee, setSelectedStudentAnnee] = useState('');
  const [selectedStudentNiveau, setSelectedStudentNiveau] = useState('');
  const [studentSearch, setStudentSearch] = useState('');

  // Filtres pour les soumissions
  const [submissionSearch, setSubmissionSearch] = useState('');
  const [selectedSubmissionCourse, setSelectedSubmissionCourse] = useState('');

  // États pour les raccourcis et le scroll
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Charger les étudiants au montage du composant
  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoading(true);
        const studentsData = await getAllStudents();
        setStudents(studentsData || []);
      } catch (error) {
        console.error('Erreur lors du chargement des étudiants:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  // Obtenir les années académiques uniques
  const anneesAcademiques = Array.from(new Set(students.map(s => s.annee_academique))).filter(Boolean);
  
  // Obtenir les niveaux uniques
  const niveaux = Array.from(new Set(students.map(s => s.niveau))).filter(Boolean);

  // Obtenir les cours uniques pour les soumissions
  const submissionCourses = Array.from(new Set(submissions.map(s => s.assignments?.course))).filter(Boolean);

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

  const filteredSubmissions = submissions.filter(submission => {
    const matchCourse = selectedSubmissionCourse ? submission.assignments?.course === selectedSubmissionCourse : true;
    const matchSearch = submissionSearch ? (
      submission.students?.nom_complet.toLowerCase().includes(submissionSearch.toLowerCase()) ||
      submission.students?.email.toLowerCase().includes(submissionSearch.toLowerCase()) ||
      submission.assignments?.course.toLowerCase().includes(submissionSearch.toLowerCase())
    ) : true;
    return matchCourse && matchSearch;
  });

  const handleBlockStudent = (id: number) => {
    setStudents(students.map(s => s.id === id ? { ...s, blocked: !s.blocked } : s));
  };

  const loadSubmissions = async () => {
    try {
      setSubmissionsLoading(true);
      const submissionsData = await getAllAssignmentSubmissions();
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
    setCourses(courses.filter(c => c.id !== id));
  };
  const handleAddCourse = () => {
    if (newCourse.trim()) {
      setCourses([...courses, { id: Date.now(), name: newCourse.toUpperCase() }]);
      setNewCourse('');
    }
  };
  const handleAddNotification = () => {
    if (newNotification.trim()) {
      setNotifications([
        ...notifications,
        { id: Date.now(), message: newNotification, target: notificationTarget },
      ]);
      setNewNotification('');
      setNotificationTarget('all');
    }
  };
  const handleDeleteNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const [notificationStudentSearch, setNotificationStudentSearch] = useState('');
  const [showStudentSuggestions, setShowStudentSuggestions] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<null | Student>(null);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col md:flex-row">
      {/* Sidebar navigation (comme dashboard étudiant) */}
      <div className="w-64 bg-white dark:bg-slate-800 shadow-lg border-r border-slate-200 dark:border-slate-700 flex-col justify-between hidden md:flex">
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
                  Super Admin
                </span>
              </div>
            </div>
          </div>
          <nav className="space-y-2">
            <button onClick={() => setActiveTab('students')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 font-medium ${activeTab === 'students' ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:shadow-md'}`}>
              <User className="w-5 h-5" />
              <span>Étudiants</span>
            </button>
            <button onClick={() => setActiveTab('courses')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 font-medium ${activeTab === 'courses' ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:shadow-md'}`}>
              <BookOpen className="w-5 h-5" />
              <span>Cours</span>
            </button>
            <button onClick={() => setActiveTab('notifications')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 font-medium ${activeTab === 'notifications' ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:shadow-md'}`}>
              <Bell className="w-5 h-5" />
              <span>Notifications</span>
            </button>
            <button onClick={() => { setActiveTab('submissions'); loadSubmissions(); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 font-medium ${activeTab === 'submissions' ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:shadow-md'}`}>
              <ClipboardCheck className="w-5 h-5" />
              <span>Devoirs rendus</span>
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
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 md:px-8 py-3 shadow-sm md:hidden">
        <div className="flex items-center gap-2 md:gap-6">
          <button onClick={() => setActiveTab('students')} className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeTab === 'students' ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg' : 'text-slate-700 hover:bg-slate-100'}`}>Étudiants</button>
          <button onClick={() => setActiveTab('courses')} className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeTab === 'courses' ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg' : 'text-slate-700 hover:bg-slate-100'}`}>Cours</button>
          <button onClick={() => setActiveTab('notifications')} className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeTab === 'notifications' ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg' : 'text-slate-700 hover:bg-slate-100'}`}>Notifications</button>
          <button onClick={() => { setActiveTab('submissions'); loadSubmissions(); }} className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeTab === 'submissions' ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg' : 'text-slate-700 hover:bg-slate-100'}`}>Devoirs</button>
        </div>
        
        {/* Raccourcis en haut à droite */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowProfileModal(true)}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
            title="Mon profil"
          >
            <Settings className="w-4 h-4 text-slate-600" />
          </button>
          <button 
            onClick={onLogout}
            className="p-2 rounded-full bg-red-100 hover:bg-red-200 transition-colors"
            title="Se déconnecter"
          >
            <LogOut className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </nav>
      <div className="flex-1 p-4 md:p-8">
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
                                onClick={() => handleBlockStudent(student.id)} 
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
        {activeTab === 'courses' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 mb-8">
            <h2 className="text-xl font-semibold mb-4">Gestion des cours</h2>
            <div className="mb-4 flex">
              <input
                type="text"
                value={newCourse}
                onChange={e => setNewCourse(e.target.value)}
                placeholder="Nom du nouveau cours"
                className="flex-1 px-3 py-2 border border-slate-300 rounded-l-lg focus:outline-none"
              />
              <button onClick={handleAddCourse} className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700">Ajouter</button>
            </div>
            <ul className="divide-y divide-slate-100">
              {courses.map(course => (
                <li key={course.id} className="py-2 flex items-center justify-between">
                  <span className="uppercase text-slate-900 font-normal">{course.name}</span>
                  <div className="flex space-x-2">
                    <button onClick={() => handleDeleteCourse(course.id)} className="text-xs text-red-600 hover:underline">Supprimer</button>
                    <button className="text-xs text-slate-600 hover:underline">Masquer</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Bell className="w-5 h-5" /> Notifications</h2>
            <form className="flex flex-col md:flex-row gap-2 mb-4" onSubmit={e => { e.preventDefault(); handleAddNotification(); }}>
              <input
                type="text"
                value={newNotification}
                onChange={e => setNewNotification(e.target.value)}
                placeholder="Message de la notification"
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
              <select
                value={notificationTarget}
                onChange={e => setNotificationTarget(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
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
                          setNotificationTarget(`student-${s.id}`);
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
              {notifications.map(n => (
                <li key={n.id} className="py-2 flex items-center justify-between">
                  <span>{n.message} <span className="text-xs text-slate-400">({n.target})</span></span>
                  <button onClick={() => handleDeleteNotification(n.id)} className="text-xs text-red-600 hover:underline">Supprimer</button>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {activeTab === 'submissions' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 mb-8">
            <h2 className="text-xl font-semibold mb-4">Devoirs rendus ({filteredSubmissions.length})</h2>
            
            {submissionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                <span className="ml-2 text-slate-600">Chargement des devoirs...</span>
              </div>
            ) : (
              <>
                {/* Filtres et recherche */}
                <div className="flex flex-wrap gap-4 mb-6 items-center">
                  <input
                    type="text"
                    placeholder="Rechercher par étudiant ou cours..."
                    value={submissionSearch}
                    onChange={e => setSubmissionSearch(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm flex-1 min-w-[200px]"
                  />
                  <select
                    value={selectedSubmissionCourse}
                    onChange={e => setSelectedSubmissionCourse(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="">Tous les cours</option>
                    {submissionCourses.map(course => (
                      <option key={course} value={course}>{course}</option>
                    ))}
                  </select>
                </div>
                
                {/* Liste des soumissions */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Étudiant</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Cours</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Devoir</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Fichier</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Date de soumission</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubmissions.map(submission => (
                        <tr key={submission.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium text-slate-900">{submission.students?.nom_complet}</div>
                              <div className="text-xs text-slate-500">{submission.students?.matricule}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-600">{submission.assignments?.course}</td>
                          <td className="py-3 px-4 text-sm text-slate-600">{submission.assignments?.title}</td>
                          <td className="py-3 px-4 text-sm text-slate-600">{submission.file_name}</td>
                          <td className="py-3 px-4 text-sm text-slate-600">
                            {new Date(submission.submitted_at).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleDownloadSubmission(submission.file_url, submission.file_name)}
                                className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
                              >
                                Télécharger
                              </button>
                              {submission.comments && (
                                <button 
                                  onClick={() => alert(`Commentaires: ${submission.comments}`)}
                                  className="text-xs bg-slate-600 text-white px-2 py-1 rounded hover:bg-slate-700 transition-colors"
                                >
                                  Voir commentaires
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {filteredSubmissions.length === 0 && !submissionsLoading && (
                  <div className="text-center py-8 text-slate-500">
                    Aucun devoir rendu trouvé avec les critères sélectionnés.
                  </div>
                )}
              </>
            )}
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