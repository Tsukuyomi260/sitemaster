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

  const handleAddCourse = () => {
    if (newCourse.trim()) {
      setCourses([...courses, { id: Date.now(), name: newCourse }]);
      setNewCourse('');
    }
  };

  const handleDeleteCourse = (id: number) => {
    setCourses(courses.filter(c => c.id !== id));
  };

  const fakeStudentsM1 = [
    { id: 1, name: 'Elodie AVOCE', email: 'elodie.avoce@student.university.edu' },
  ];
  const fakeStudentsM2: Student[] = [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      {/* Sidebar navigation */}
      <div className="w-64 bg-white dark:bg-slate-800 shadow-lg border-r border-slate-200 dark:border-slate-700 flex flex-col justify-between">
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
      <div className="flex-1 p-8">
        {activeTab === 'students' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 mb-8">
            <h2 className="text-xl font-semibold mb-4">Liste des étudiants</h2>
            <div className="mb-4">
              <h3 className="font-bold text-slate-900 mb-2">Master 1</h3>
              <ul className="divide-y divide-slate-100">
                {fakeStudentsM1.map(student => (
                  <li key={student.id} className="py-2 flex flex-col">
                    <span className="font-medium text-slate-900">{student.name}</span>
                    <span className="text-xs text-slate-500">{student.email}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2">Master 2</h3>
              <ul className="divide-y divide-slate-100">
                {fakeStudentsM2.length === 0 && <li className="py-2 text-slate-400">Aucun étudiant Master 2 pour l'instant</li>}
                {fakeStudentsM2.map(student => (
                  <li key={student.id} className="py-2 flex flex-col">
                    <span className="font-medium text-slate-900">{student.name}</span>
                    <span className="text-xs text-slate-500">{student.email}</span>
                  </li>
                ))}
              </ul>
            </div>
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
                  <span>{course.name}</span>
                  <button onClick={() => handleDeleteCourse(course.id)} className="text-xs text-red-600 hover:underline">Supprimer</button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {activeTab === 'devoirs' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <h2 className="text-xl font-semibold mb-4">Devoirs rendus</h2>
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
                {fakeDevoirs.map(devoir => (
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
  );
} 