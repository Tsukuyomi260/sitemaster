import React, { useState } from 'react';
import { User, BookOpen, ClipboardCheck, LogOut, Bell } from 'lucide-react';

interface AdminDashboardProps {
  adminName: string;
  onLogout: () => void;
}

const fakeStudents = [
  { id: 1, name: 'Elodie AVOCE', email: 'elodie.avoce@student.university.edu', blocked: false },
  { id: 2, name: 'Fatoumata DIARRA', email: 'fatoumata.diarra@student.university.edu', blocked: false },
  { id: 3, name: 'Mohamed TRAORE', email: 'mohamed.traore@student.university.edu', blocked: false },
  { id: 4, name: 'Aminata SOW', email: 'aminata.sow@student.university.edu', blocked: false },
  { id: 5, name: 'Blaise KOUASSI', email: 'blaise.kouassi@student.university.edu', blocked: false },
  { id: 6, name: 'Chantal NDIAYE', email: 'chantal.ndiaye@student.university.edu', blocked: false },
  { id: 7, name: 'Issa OUEDRAOGO', email: 'issa.ouedraogo@student.university.edu', blocked: false },
  { id: 8, name: 'Mariam KABORE', email: 'mariam.kabore@student.university.edu', blocked: false },
  { id: 9, name: 'Serge BAKAYOKO', email: 'serge.bakayoko@student.university.edu', blocked: false },
  { id: 10, name: 'Awa CISSOKO', email: 'awa.cissoko@student.university.edu', blocked: false },
  { id: 11, name: 'Koffi MENSAH', email: 'koffi.mensah@student.university.edu', blocked: false },
  { id: 12, name: 'Nadia ZONGO', email: 'nadia.zongo@student.university.edu', blocked: false },
  { id: 13, name: 'Oumar DIALLO', email: 'oumar.diallo@student.university.edu', blocked: false },
  { id: 14, name: 'Patricia EBA', email: 'patricia.eba@student.university.edu', blocked: false },
  { id: 15, name: 'Samuel TCHATCHOUA', email: 'samuel.tchatchoua@student.university.edu', blocked: false },
  { id: 16, name: 'Yacouba COULIBALY', email: 'yacouba.coulibaly@student.university.edu', blocked: false },
];
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
  const [students, setStudents] = useState(fakeStudents);
  const [courses, setCourses] = useState(fakeCourses);
  const [notifications, setNotifications] = useState(fakeNotifications);
  const [newCourse, setNewCourse] = useState('');
  const [newNotification, setNewNotification] = useState('');
  const [notificationTarget, setNotificationTarget] = useState('all');

  // Valeurs fictives pour les filtres étudiants (admin)
  const fakeAnnees = [
    { id: 1, name: '2023-2024' },
    { id: 2, name: '2024-2025' },
  ];
  const fakeMasters = [
    { id: 1, name: 'Master 1' },
    { id: 2, name: 'Master 2' },
  ];
  const [selectedStudentCourse, setSelectedStudentCourse] = useState('');
  const [selectedStudentAnnee, setSelectedStudentAnnee] = useState('');
  const [selectedStudentMaster, setSelectedStudentMaster] = useState('');
  const [studentSearch, setStudentSearch] = useState('');

  const filteredStudents = students.filter(student => {
    const matchCourse = selectedStudentCourse ? courses.some(c => c.name === selectedStudentCourse) : true;
    const matchAnnee = selectedStudentAnnee ? true : true; // À brancher sur les vraies données
    const matchMaster = selectedStudentMaster ? (selectedStudentMaster === 'Master 1' ? student.id <= 8 : student.id > 8) : true;
    const matchSearch = studentSearch ? (
      student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      student.email.toLowerCase().includes(studentSearch.toLowerCase())
    ) : true;
    return matchCourse && matchAnnee && matchMaster && matchSearch;
  });

  const handleBlockStudent = (id: number) => {
    setStudents(students.map(s => s.id === id ? { ...s, blocked: !s.blocked } : s));
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
  const [selectedProfile, setSelectedProfile] = useState<null | typeof students[0]>(null);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col md:flex-row">
      {/* Sidebar navigation (comme dashboard étudiant) */}
      <div className="w-64 bg-white dark:bg-slate-800 shadow-lg border-r border-slate-200 dark:border-slate-700 flex-col justify-between hidden md:flex">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-white">
              <img src="/logo-enset.png" alt="Logo ENSET-MASTERS" className="object-contain w-full h-full" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 dark:text-white">ENSET-MASTERS</h1>
              <p className="text-xs text-slate-600 dark:text-slate-400">Espace Admin</p>
            </div>
          </div>
          <nav className="space-y-2">
            <button onClick={() => setActiveTab('students')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'students' ? 'bg-slate-900 dark:bg-slate-700 text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
              <User className="w-5 h-5" />
              <span className="font-medium">Étudiants</span>
            </button>
            <button onClick={() => setActiveTab('courses')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'courses' ? 'bg-slate-900 dark:bg-slate-700 text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
              <BookOpen className="w-5 h-5" />
              <span className="font-medium">Cours</span>
            </button>
            <button onClick={() => setActiveTab('notifications')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'notifications' ? 'bg-slate-900 dark:bg-slate-700 text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
              <Bell className="w-5 h-5" />
              <span className="font-medium">Notifications</span>
            </button>
          </nav>
        </div>
        <div className="p-6 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </div>
            <div>
              <p className="font-medium text-slate-900 dark:text-white">{adminName}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">Administrateur</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center space-x-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200">
            <LogOut className="w-4 h-4" />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>
      {/* Top nav Apple-style (visible sur mobile) */}
      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200 flex items-center justify-center gap-2 md:gap-6 px-2 md:px-8 py-2 shadow-sm md:hidden">
        <button onClick={() => setActiveTab('students')} className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeTab === 'students' ? 'bg-slate-900 text-white shadow' : 'text-slate-700 hover:bg-slate-100'}`}>Étudiants</button>
        <button onClick={() => setActiveTab('courses')} className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeTab === 'courses' ? 'bg-slate-900 text-white shadow' : 'text-slate-700 hover:bg-slate-100'}`}>Cours</button>
        <button onClick={() => setActiveTab('notifications')} className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeTab === 'notifications' ? 'bg-slate-900 text-white shadow' : 'text-slate-700 hover:bg-slate-100'}`}>Notifications</button>
      </nav>
      <div className="flex-1 p-4 md:p-8">
        {activeTab === 'students' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 mb-8">
            <h2 className="text-xl font-semibold mb-4">Liste de tous les étudiants</h2>
            {/* Filtres et recherche */}
            <div className="flex flex-wrap gap-4 mb-6 items-center">
              <input
                type="text"
                placeholder="Rechercher..."
                value={studentSearch}
                onChange={e => setStudentSearch(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
              <select
                value={selectedStudentCourse}
                onChange={e => setSelectedStudentCourse(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="">Tous les cours</option>
                {courses.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
              <select
                value={selectedStudentAnnee}
                onChange={e => setSelectedStudentAnnee(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="">Toutes les années</option>
                {fakeAnnees.map(a => (
                  <option key={a.id} value={a.name}>{a.name}</option>
                ))}
              </select>
              <select
                value={selectedStudentMaster}
                onChange={e => setSelectedStudentMaster(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="">Tous les masters</option>
                {fakeMasters.map(m => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>
            <ul className="divide-y divide-slate-100">
              {filteredStudents.map(student => (
                <li key={student.id} className="py-2 flex flex-col md:flex-row md:items-center md:justify-between">
                  <span className="font-medium text-slate-900">{student.name}</span>
                  <span className="text-xs text-slate-500">{student.email}</span>
                  <div className="flex gap-2 mt-2 md:mt-0">
                    <button onClick={() => setSelectedProfile(student)} className="text-xs text-blue-600 hover:underline">Voir profil</button>
                    <button onClick={() => handleBlockStudent(student.id)} className={`text-xs rounded px-2 py-1 ${student.blocked ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'} hover:bg-red-200 transition-all`}>{student.blocked ? 'Débloquer' : 'Bloquer'}</button>
                  </div>
                </li>
              ))}
            </ul>
            {/* Modal profil étudiant */}
            {selectedProfile && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md relative">
                  <button onClick={() => setSelectedProfile(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 text-xl">&times;</button>
                  <h3 className="text-lg font-bold mb-4">Profil de l'étudiant</h3>
                  <div className="mb-2"><span className="font-semibold">Nom :</span> {selectedProfile.name}</div>
                  <div className="mb-2"><span className="font-semibold">Email :</span> {selectedProfile.email}</div>
                  <div className="mb-2"><span className="font-semibold">ID :</span> {selectedProfile.id}</div>
                  {/* Ajoute d'autres infos ici si besoin */}
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
                      s.name.toLowerCase().includes(notificationStudentSearch.toLowerCase()) ||
                      s.email.toLowerCase().includes(notificationStudentSearch.toLowerCase())
                    ).map(s => (
                      <div
                        key={s.id}
                        className="px-3 py-2 hover:bg-slate-100 cursor-pointer text-sm"
                        onClick={() => {
                          setNotificationTarget(`student-${s.id}`);
                          setNotificationStudentSearch(s.name);
                          setShowStudentSuggestions(false);
                        }}
                      >
                        {s.name} <span className="text-xs text-slate-400">({s.email})</span>
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
      </div>
    </div>
  );
} 