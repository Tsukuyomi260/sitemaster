import React, { useState } from 'react';
import { User, BookOpen, ClipboardCheck, LogOut } from 'lucide-react';

const fakeStudents = [
  { id: 1, name: 'Elodie AVOCE', email: 'elodie.avoce@student.university.edu' },
  { id: 2, name: 'Jean KLOTOE', email: 'jean.klotoe@student.university.edu' },
  { id: 3, name: 'Guevarra NONVIHO', email: 'guevarra.nonviho@student.university.edu' },
];

const fakeDevoirs = [
  { id: 1, student: 'Elodie AVOCE', course: "01 S1 PSYCHOPEDAGOGIE DE L'ENFANT ET DE L'ADOLESCENT", file: 'devoir1.pdf', date: '2024-05-01' },
  { id: 2, student: 'Jean KLOTOE', course: "02 S1 PSYCHOLOGIE DE L'APPRENTISSAGE", file: 'devoir2.pdf', date: '2024-05-02' },
];

const fakeCourses = [
  { id: 1, name: "01 S1 PSYCHOPEDAGOGIE DE L'ENFANT ET DE L'ADOLESCENT" },
  { id: 2, name: "02 S1 PSYCHOLOGIE DE L'APPRENTISSAGE" },
  { id: 3, name: "03 S1 Administration des Etablissements d’EFTP et GPEC en EFTP" },
];

interface TeacherDashboardProps {
  teacherName: string;
  onLogout: () => void;
}

interface Student {
  id: number;
  name: string;
  email: string;
}

export default function TeacherDashboard({ teacherName, onLogout }: TeacherDashboardProps) {
  const [courses, setCourses] = useState(fakeCourses);
  const [newCourse, setNewCourse] = useState('');
  const [activeTab, setActiveTab] = useState('students');
  const [selectedCourse, setSelectedCourse] = useState<null | { id: number; name: string }>(null);
  const [showCoursePanel, setShowCoursePanel] = useState(false);
  const fakeFiles = [
    { id: 1, name: 'support_cours.pdf', size: '1.2 Mo' },
    { id: 2, name: 'exercices.docx', size: '800 Ko' },
  ];

  const handleAddCourse = () => {
    if (newCourse.trim()) {
      setCourses([...courses, { id: Date.now(), name: newCourse }]);
      setNewCourse('');
    }
  };

  const handleDeleteCourse = (id: number) => {
    setCourses(courses.filter(c => c.id !== id));
  };

  const fakeStudentsM1: Student[] = [
    { id: 1, name: 'Elodie AVOCE', email: 'elodie.avoce@student.university.edu' },
    { id: 2, name: 'Fatoumata DIARRA', email: 'fatoumata.diarra@student.university.edu' },
    { id: 3, name: 'Mohamed TRAORE', email: 'mohamed.traore@student.university.edu' },
    { id: 4, name: 'Aminata SOW', email: 'aminata.sow@student.university.edu' },
    { id: 5, name: 'Blaise KOUASSI', email: 'blaise.kouassi@student.university.edu' },
    { id: 6, name: 'Chantal NDIAYE', email: 'chantal.ndiaye@student.university.edu' },
    { id: 7, name: 'Issa OUEDRAOGO', email: 'issa.ouedraogo@student.university.edu' },
    { id: 8, name: 'Mariam KABORE', email: 'mariam.kabore@student.university.edu' },
  ];
  const fakeStudentsM2: Student[] = [
    { id: 9, name: 'Serge BAKAYOKO', email: 'serge.bakayoko@student.university.edu' },
    { id: 10, name: 'Awa CISSOKO', email: 'awa.cissoko@student.university.edu' },
    { id: 11, name: 'Koffi MENSAH', email: 'koffi.mensah@student.university.edu' },
    { id: 12, name: 'Nadia ZONGO', email: 'nadia.zongo@student.university.edu' },
    { id: 13, name: 'Oumar DIALLO', email: 'oumar.diallo@student.university.edu' },
    { id: 14, name: 'Patricia EBA', email: 'patricia.eba@student.university.edu' },
    { id: 15, name: 'Samuel TCHATCHOUA', email: 'samuel.tchatchoua@student.university.edu' },
    { id: 16, name: 'Yacouba COULIBALY', email: 'yacouba.coulibaly@student.university.edu' },
  ];

  // Ajout des valeurs fictives pour les filtres
  const fakeApprenants = [
    ...fakeStudentsM1,
    ...fakeStudentsM2,
  ];
  const fakeCours = [
    { id: 1, name: "01 S1 PSYCHOPEDAGOGIE DE L'ENFANT ET DE L'ADOLESCENT" },
    { id: 2, name: "02 S1 PSYCHOLOGIE DE L'APPRENTISSAGE" },
    { id: 3, name: "03 S1 Administration des Etablissements d’EFTP et GPEC en EFTP" },
  ];
  const fakeMasters = [
    { id: 1, name: 'Master 1' },
    { id: 2, name: 'Master 2' },
  ];

  const [selectedApprenant, setSelectedApprenant] = useState('');
  const [selectedCours, setSelectedCours] = useState('');
  const [selectedMaster, setSelectedMaster] = useState('');
  const [search, setSearch] = useState('');

  // Filtrage fictif (à brancher sur les vraies données plus tard)
  const filteredDevoirs = fakeDevoirs.filter(devoir => {
    const matchApprenant = selectedApprenant ? devoir.student === selectedApprenant : true;
    const matchCours = selectedCours ? devoir.course === selectedCours : true;
    const matchMaster = selectedMaster ? (selectedMaster === 'Master 1' ? devoir.student === 'Elodie AVOCE' : devoir.student !== 'Elodie AVOCE') : true;
    const matchSearch = search ? (
      devoir.student.toLowerCase().includes(search.toLowerCase()) ||
      devoir.course.toLowerCase().includes(search.toLowerCase()) ||
      devoir.file.toLowerCase().includes(search.toLowerCase())
    ) : true;
    return matchApprenant && matchCours && matchMaster && matchSearch;
  });

  // Valeurs fictives pour les filtres étudiants
  const fakeAnnees = [
    { id: 1, name: '2023-2024' },
    { id: 2, name: '2024-2025' },
  ];
  const [selectedStudentCourse, setSelectedStudentCourse] = useState('');
  const [selectedStudentAnnee, setSelectedStudentAnnee] = useState('');
  const [selectedStudentMaster, setSelectedStudentMaster] = useState('');
  const [studentSearch, setStudentSearch] = useState('');

  const filteredStudents = [...fakeStudentsM1, ...fakeStudentsM2].filter(student => {
    const matchCourse = selectedStudentCourse ? courses.some(c => c.name === selectedStudentCourse) : true;
    const matchAnnee = selectedStudentAnnee ? true : true; // À brancher sur les vraies données
    const matchMaster = selectedStudentMaster ? (selectedStudentMaster === 'Master 1' ? fakeStudentsM1.some(s => s.id === student.id) : fakeStudentsM2.some(s => s.id === student.id)) : true;
    const matchSearch = studentSearch ? (
      student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      student.email.toLowerCase().includes(studentSearch.toLowerCase())
    ) : true;
    return matchCourse && matchAnnee && matchMaster && matchSearch;
  });

  // Ajout d'un état pour les notes par cours
  const [courseNotes, setCourseNotes] = useState<{ [courseId: number]: string }>({});
  const [noteInput, setNoteInput] = useState<{ [courseId: number]: string }>({});

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      {/* Apple-style top nav */}
      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200 flex items-center justify-center gap-2 md:gap-6 px-2 md:px-8 py-2 shadow-sm">
        <button onClick={() => setActiveTab('students')} className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeTab === 'students' ? 'bg-slate-900 text-white shadow' : 'text-slate-700 hover:bg-slate-100'}`}>Étudiants</button>
        <button onClick={() => setActiveTab('courses')} className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeTab === 'courses' ? 'bg-slate-900 text-white shadow' : 'text-slate-700 hover:bg-slate-100'}`}>Cours</button>
        <button onClick={() => setActiveTab('devoirs')} className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeTab === 'devoirs' ? 'bg-slate-900 text-white shadow' : 'text-slate-700 hover:bg-slate-100'}`}>Devoirs</button>
      </nav>
      <div className="flex flex-1">
        {/* Sidebar navigation (inchangé) */}
        <div className="w-64 bg-white dark:bg-slate-800 shadow-lg border-r border-slate-200 dark:border-slate-700 flex flex-col justify-between hidden md:flex">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-white">
                <img src="/logo-enset.png" alt="Logo ENSET-MASTERS" className="object-contain w-full h-full" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900 dark:text-white">ENSET-MASTERS</h1>
                <p className="text-xs text-slate-600 dark:text-slate-400">Espace Master</p>
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
              <button onClick={() => setActiveTab('devoirs')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'devoirs' ? 'bg-slate-900 dark:bg-slate-700 text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                <ClipboardCheck className="w-5 h-5" />
                <span className="font-medium">Devoirs rendus</span>
              </button>
            </nav>
          </div>
          <div className="p-6 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-slate-200 dark:bg-slate-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">{teacherName}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Enseignant</p>
              </div>
            </div>
            <button onClick={onLogout} className="w-full flex items-center space-x-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200">
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
        {/* Main content */}
        <div className="flex-1 p-4 md:p-8">
          {activeTab === 'students' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 mb-8">
              <h2 className="text-xl font-semibold mb-4">Liste des étudiants</h2>
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
                  <option value="Master 1">Master 1</option>
                  <option value="Master 2">Master 2</option>
                </select>
              </div>
              <ul className="divide-y divide-slate-100">
                {filteredStudents.length === 0 && <li className="py-2 text-slate-400">Aucun étudiant trouvé</li>}
                {filteredStudents.map(student => (
                  <li key={student.id} className="py-2 flex flex-col md:flex-row md:items-center md:justify-between">
                    <span className="font-medium text-slate-900">{student.name}</span>
                    <span className="text-xs text-slate-500">{student.email}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {activeTab === 'courses' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 mb-8">
              <h2 className="text-xl font-semibold mb-4">Gestion des cours</h2>
              <ul className="divide-y divide-slate-100">
                {courses.map(course => (
                  <li key={course.id} className="py-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <span className="uppercase text-slate-900 font-normal">{course.name}</span>
                      {/* Note admin */}
                      <div className="mt-2">
                        {courseNotes[course.id] ? (
                          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-2 rounded text-sm text-yellow-800 flex items-center justify-between">
                            <span>{courseNotes[course.id]}</span>
                            <button onClick={() => setCourseNotes({ ...courseNotes, [course.id]: '' })} className="ml-2 text-xs text-blue-600 hover:underline">Modifier</button>
                          </div>
                        ) : (
                          <form
                            className="flex gap-2 mt-1"
                            onSubmit={e => {
                              e.preventDefault();
                              setCourseNotes({ ...courseNotes, [course.id]: noteInput[course.id] || '' });
                            }}
                          >
                            <input
                              type="text"
                              value={noteInput[course.id] || ''}
                              onChange={e => setNoteInput({ ...noteInput, [course.id]: e.target.value })}
                              placeholder="Ajouter une note pour ce cours..."
                              className="flex-1 px-2 py-1 border border-slate-300 rounded text-xs"
                            />
                            <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">Valider</button>
                          </form>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-2 md:mt-0">
                      <button className="text-xs text-slate-600 hover:underline">Masquer</button>
                      <button onClick={() => { setSelectedCourse(course); setShowCoursePanel(true); }} className="text-xs text-blue-600 hover:underline">Gérer</button>
                    </div>
                  </li>
                ))}
              </ul>
              {/* Panneau de gestion de fichiers pour le cours sélectionné */}
              {showCoursePanel && selectedCourse && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                  <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md relative">
                    <button onClick={() => setShowCoursePanel(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 text-xl">&times;</button>
                    <h3 className="text-lg font-bold mb-4">Fichiers du cours : <span className="text-blue-700">{selectedCourse.name}</span></h3>
                    <ul className="mb-4 divide-y divide-slate-100">
                      {fakeFiles.map(file => (
                        <li key={file.id} className="py-2 flex items-center justify-between">
                          <span className="truncate max-w-xs">{file.name}</span>
                          <span className="text-xs text-slate-400">{file.size}</span>
                          <button className="text-xs text-red-600 hover:underline ml-2">Supprimer</button>
                        </li>
                      ))}
                    </ul>
                    <form className="flex flex-col gap-2">
                      <label className="text-sm font-medium">Ajouter un fichier</label>
                      <input type="file" className="border border-slate-300 rounded px-2 py-1" />
                      <button type="button" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mt-2">Uploader</button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
          {activeTab === 'devoirs' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <h2 className="text-xl font-semibold mb-4">Devoirs rendus</h2>
              {/* Filtres */}
              <div className="flex flex-wrap gap-4 mb-6 items-center">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
                <select
                  value={selectedApprenant}
                  onChange={e => setSelectedApprenant(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="">Tous les apprenants</option>
                  {fakeApprenants.map(a => (
                    <option key={a.id} value={a.name}>{a.name}</option>
                  ))}
                </select>
                <select
                  value={selectedCours}
                  onChange={e => setSelectedCours(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="">Tous les cours</option>
                  {fakeCours.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
                <select
                  value={selectedMaster}
                  onChange={e => setSelectedMaster(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="">Tous les masters</option>
                  {fakeMasters.map(m => (
                    <option key={m.id} value={m.name}>{m.name}</option>
                  ))}
                </select>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-600">
                    <th>Étudiant</th>
                    <th>Cours</th>
                    <th>Fichier</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDevoirs.map(devoir => (
                    <tr key={devoir.id} className="border-t border-slate-100">
                      <td>{devoir.student}</td>
                      <td>{devoir.course}</td>
                      <td>{devoir.file}</td>
                      <td>{devoir.date}</td>
                      <td><button className="text-xs text-blue-600 hover:underline">Télécharger</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 