import React, { useState, useEffect } from 'react';
import { User, BookOpen, Users, Download, Upload, Settings, LogOut, ChevronUp, MessageSquare, Send } from 'lucide-react';
import { getTeacherCourses, getStudentsByCourse, sendMessageToStudents, sendMessageToAllStudents, getSubmissionsByCourse } from '../api';

interface TeacherDashboardProps {
  teacherName: string;
  onLogout: () => void;
}

interface CourseAssignment {
  id: number;
  teacher_email: string;
  course_name: string;
  course_file: string;
  assigned_at: string;
  is_active: boolean;
}

interface Student {
  id: number;
  matricule: string;
  nom_complet: string;
  email: string;
  sexe: string;
  niveau: string;
  annee_academique: string;
}

interface Submission {
  id: number;
  assignment_id: number;
  student_id: string;
  file_url: string;
  file_name: string;
  submission_title: string;
  submitted_at: string;
  comments: string;
  status: string;
  assignments: {
    title: string;
    course: string;
    due_date: string;
    points: number;
  };
}

function TeacherDashboard({ teacherName, onLogout }: TeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState('courses');
  const [courses, setCourses] = useState<CourseAssignment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseAssignment | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showGeneralMessageModal, setShowGeneralMessageModal] = useState(false);
  const [messageTitle, setMessageTitle] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageSuccess, setMessageSuccess] = useState(false);
  const [courseStudents, setCourseStudents] = useState<Student[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [showStudentProfileModal, setShowStudentProfileModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedCourseForSubmissions, setSelectedCourseForSubmissions] = useState<string>('');
  const [submissionsLoading, setSubmissionsLoading] = useState(false);

  // Charger les cours assignés au montage du composant
  useEffect(() => {
    const loadTeacherData = async () => {
      try {
        setLoading(true);
        
        const coursesData = await getTeacherCourses(teacherName);
        setCourses(coursesData || []);
        
        // Charger tous les étudiants Master 2 par défaut
        const studentsData = await getStudentsByCourse('01 S3 Collaboration interdisciplinaire dans l\'EFTP');
        setStudents(studentsData || []);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTeacherData();
  }, [teacherName]);

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



  const handleDownloadCourse = (courseFile: string, courseName: string) => {
    // Créer un lien de téléchargement
    const link = document.createElement('a');
    link.href = courseFile;
    link.download = courseName + '.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleManageCourse = async (course: CourseAssignment) => {
    setSelectedCourse(course);
    try {
      // Récupérer tous les étudiants Master 2
      const studentsData = await getStudentsByCourse(course.course_name);
      setCourseStudents(studentsData || []);
      setShowMessageModal(true);
    } catch (error) {
      console.error('Erreur lors du chargement des étudiants:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedCourse || !messageTitle.trim() || !messageContent.trim()) {
      return;
    }

    try {
      setSendingMessage(true);
      const result = await sendMessageToStudents(
        teacherName,
        selectedCourse.course_name,
        messageTitle,
        messageContent
      );

      if (result.success) {
        setMessageSuccess(true);
        setMessageTitle('');
        setMessageContent('');
        
        // Fermer le modal après 2 secondes
        setTimeout(() => {
          setShowMessageModal(false);
          setMessageSuccess(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleSendGeneralMessage = async () => {
    if (!messageTitle.trim() || !messageContent.trim()) {
      return;
    }

    try {
      setSendingMessage(true);
      const result = await sendMessageToAllStudents(
        teacherName,
        messageTitle,
        messageContent
      );

      if (result.success) {
        setMessageSuccess(true);
        setMessageTitle('');
        setMessageContent('');
        
        // Fermer le modal après 2 secondes
        setTimeout(() => {
          setShowGeneralMessageModal(false);
          setMessageSuccess(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message général:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleOpenGeneralMessageModal = async () => {
    try {
      // Récupérer tous les étudiants Master 2
      const studentsData = await getStudentsByCourse('01 S3 Collaboration interdisciplinaire dans l\'EFTP');
      setAllStudents(studentsData || []);
      setShowGeneralMessageModal(true);
    } catch (error) {
      console.error('Erreur lors du chargement des étudiants:', error);
    }
  };

  const handleViewStudentProfile = (student: Student) => {
    setSelectedStudent(student);
    setShowStudentProfileModal(true);
  };

  const loadSubmissionsForCourse = async (courseName: string) => {
    try {
      setSubmissionsLoading(true);
      const submissionsData = await getSubmissionsByCourse(courseName);
      setSubmissions(submissionsData || []);
    } catch (error) {
      console.error('Erreur lors du chargement des soumissions:', error);
      setSubmissions([]);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const handleDownloadSubmission = (fileUrl: string, fileName: string) => {
    // Créer un lien de téléchargement
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col md:flex-row">
      {/* Sidebar navigation */}
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
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  Enseignant
                </span>
              </div>
            </div>
          </div>
          
          <nav className="space-y-2">
            <button onClick={() => setActiveTab('courses')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 font-medium ${activeTab === 'courses' ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:shadow-md'}`}>
              <BookOpen className="w-5 h-5" />
              <span>Mes cours</span>
            </button>
            <button onClick={() => setActiveTab('students')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 font-medium ${activeTab === 'students' ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:shadow-md'}`}>
              <Users className="w-5 h-5" />
              <span>Mes étudiants</span>
            </button>
            
            <button onClick={() => setActiveTab('submissions')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 font-medium ${activeTab === 'submissions' ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:shadow-md'}`}>
              <Upload className="w-5 h-5" />
              <span>Devoirs rendus</span>
            </button>
          </nav>
          
          {/* Raccourcis rapides */}
          <div className="mt-6 space-y-2">
            <button 
              onClick={handleOpenGeneralMessageModal}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 font-medium"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Message général</span>
            </button>
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
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <p className="font-semibold text-slate-900 dark:text-white truncate">{teacherName}</p>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm">
                  Enseignant
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">Professeur</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200 font-medium">
            <LogOut className="w-4 h-4" />
            <span>Se déconnecter</span>
          </button>
        </div>
      </div>

      {/* Top nav mobile */}
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 md:px-8 py-3 shadow-sm md:hidden">
        <div className="flex items-center gap-2 md:gap-6">
          <button onClick={() => setActiveTab('courses')} className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeTab === 'courses' ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' : 'text-slate-700 hover:bg-slate-100'}`}>Cours</button>
          <button onClick={() => setActiveTab('students')} className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeTab === 'students' ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' : 'text-slate-700 hover:bg-slate-100'}`}>Étudiants</button>
          <button onClick={() => setActiveTab('submissions')} className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeTab === 'submissions' ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' : 'text-slate-700 hover:bg-slate-100'}`}>Devoirs</button>
        </div>
        
        {/* Raccourcis en haut à droite */}
        <div className="flex items-center gap-2">
          <button 
            onClick={handleOpenGeneralMessageModal}
            className="p-2 rounded-full bg-green-100 hover:bg-green-200 transition-colors"
            title="Message général"
          >
            <MessageSquare className="w-4 h-4 text-green-600" />
          </button>
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
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-slate-600">Chargement...</span>
          </div>
        ) : (
          <>
            {activeTab === 'courses' && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 mb-8">
                <h2 className="text-xl font-semibold mb-6">Mes cours assignés ({courses.length})</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map(course => (
                    <div key={course.id} className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:shadow-md transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xs text-slate-500">Assigné le {new Date(course.assigned_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                      
                      <h3 className="font-semibold text-slate-900 mb-2">{course.course_name}</h3>
                      
                      <div className="space-y-3">
                        <button 
                          onClick={() => handleManageCourse(course)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium"
                        >
                          Gérer ce cours
                        </button>
                        
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleDownloadCourse(course.course_file, course.course_name)}
                            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-3 rounded-lg transition-colors text-sm"
                          >
                            <Download className="w-4 h-4 inline mr-1" />
                            Télécharger
                          </button>
                          <button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-3 rounded-lg transition-colors text-sm">
                            <Upload className="w-4 h-4 inline mr-1" />
                            Modifier
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {courses.length === 0 && (
                  <div className="text-center py-12 text-slate-500">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <p>Aucun cours assigné pour le moment.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'students' && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 mb-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Tous les étudiants Master 2</h2>
                    <p className="text-sm text-slate-600 mt-1">Liste complète des étudiants inscrits</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-lg font-bold text-blue-600">{students.length}</span>
                  </div>
                </div>
                
                {loading && (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-slate-600">Chargement des étudiants...</p>
                  </div>
                )}
                
                {!loading && (
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-slate-200 bg-slate-50 rounded-t-xl">
                          <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm uppercase tracking-wide">Matricule</th>
                          <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm uppercase tracking-wide">Nom complet</th>
                          <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm uppercase tracking-wide">Email</th>
                          <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm uppercase tracking-wide">Niveau</th>
                          <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm uppercase tracking-wide">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {students.map((student, index) => (
                          <tr 
                            key={student.id} 
                            className={`hover:bg-slate-50 transition-colors duration-200 ${
                              index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                            }`}
                          >
                            <td className="py-4 px-6 text-sm font-mono text-slate-600">{student.matricule}</td>
                            <td className="py-4 px-6 font-medium text-slate-900">{student.nom_complet}</td>
                            <td className="py-4 px-6 text-sm text-slate-600">{student.email}</td>
                            <td className="py-4 px-6 text-sm text-slate-600">{student.niveau}</td>
                            <td className="py-4 px-6">
                              <button 
                                onClick={() => handleViewStudentProfile(student)}
                                className="text-xs bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                              >
                                Voir profil
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                {!loading && students.length === 0 && (
                  <div className="text-center py-12 text-slate-500">
                    <Users className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <p>Aucun étudiant Master 2 trouvé.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'submissions' && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 mb-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Devoirs rendus par mes étudiants</h2>
                    <p className="text-sm text-slate-600 mt-1">Consultez et téléchargez les devoirs soumis</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Upload className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-lg font-bold text-blue-600">{submissions.length}</span>
                  </div>
                </div>

                {/* Sélecteur de cours */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Filtrer par cours
                  </label>
                  <select
                    value={selectedCourseForSubmissions}
                    onChange={(e) => {
                      setSelectedCourseForSubmissions(e.target.value);
                      if (e.target.value) {
                        loadSubmissionsForCourse(e.target.value);
                      } else {
                        setSubmissions([]);
                      }
                    }}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Tous les cours</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.course_name}>
                        {course.course_name}
                      </option>
                    ))}
                  </select>
                </div>

                {submissionsLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-slate-600">Chargement des soumissions...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-slate-200 bg-slate-50 rounded-t-xl">
                          <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm uppercase tracking-wide">Étudiant</th>
                          <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm uppercase tracking-wide">Devoir</th>
                          <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm uppercase tracking-wide">Cours</th>
                          <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm uppercase tracking-wide">Fichier</th>
                          <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm uppercase tracking-wide">Date de soumission</th>
                          <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm uppercase tracking-wide">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {submissions.map((submission, index) => (
                          <tr 
                            key={submission.id} 
                            className={`hover:bg-slate-50 transition-colors duration-200 ${
                              index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                            }`}
                          >
                            <td className="py-4 px-6">
                              <div>
                                <div className="font-medium text-slate-900">{submission.student_id}</div>
                                <div className="text-xs text-slate-500">ID: {submission.student_id}</div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div>
                                <div className="font-medium text-slate-900">{submission.submission_title}</div>
                                <div className="text-xs text-slate-500">{submission.assignments?.title}</div>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-sm text-slate-600">{submission.assignments?.course}</td>
                            <td className="py-4 px-6 text-sm text-slate-600">{submission.file_name}</td>
                            <td className="py-4 px-6 text-sm text-slate-600">
                              {new Date(submission.submitted_at).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleDownloadSubmission(submission.file_url, submission.file_name)}
                                  className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                                >
                                  Télécharger
                                </button>
                                {submission.comments && (
                                  <button 
                                    onClick={() => alert(`Commentaires: ${submission.comments}`)}
                                    className="text-xs bg-slate-600 text-white px-3 py-1 rounded hover:bg-slate-700 transition-colors"
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
                )}

                {!submissionsLoading && submissions.length === 0 && (
                  <div className="text-center py-12 text-slate-500">
                    <Upload className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <p>Aucun devoir rendu trouvé pour ce cours.</p>
                  </div>
                )}
              </div>
            )}

          </>
        )}
        
        {/* Bouton retour en haut */}
        {showScrollToTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 p-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
            title="Retour en haut"
          >
            <ChevronUp className="w-6 h-6" />
          </button>
        )}
        
        {/* Modal profil enseignant */}
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
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Profil Enseignant</h3>
                <p className="text-slate-600 mt-1">Professeur</p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700">Email</span>
                    <span className="text-slate-900 font-mono text-sm">{teacherName}</span>
                  </div>
                </div>
                
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700">Rôle</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                      Enseignant
                    </span>
                  </div>
                </div>
                
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700">Cours assignés</span>
                    <span className="text-slate-900 font-semibold">{courses.length}</span>
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

        {/* Modal d'envoi de message général */}
        {showGeneralMessageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
              <button 
                onClick={() => setShowGeneralMessageModal(false)} 
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 text-xl font-bold"
              >
                ×
              </button>
              
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Message général</h3>
                    <p className="text-slate-600">Envoyer un message à tous les étudiants Master 2</p>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-xl p-4 mb-6">
                  <p className="text-sm text-green-800">
                    <strong>Destinataires :</strong> {allStudents.length} étudiant(s) Master 2
                  </p>
                </div>
              </div>
              
              {messageSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-green-800 mb-2">Message envoyé !</h4>
                  <p className="text-green-600">Le message a été envoyé à {allStudents.length} étudiant(s)</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Titre du message *
                    </label>
                    <input
                      type="text"
                      value={messageTitle}
                      onChange={(e) => setMessageTitle(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Ex: Information importante pour tous les étudiants"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Contenu du message *
                    </label>
                    <textarea
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      rows={6}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      placeholder="Tapez votre message ici..."
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowGeneralMessageModal(false)}
                      className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleSendGeneralMessage}
                      disabled={sendingMessage || !messageTitle.trim() || !messageContent.trim()}
                      className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {sendingMessage ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Envoi...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Envoyer à tous</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal d'envoi de message */}
        {showMessageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
              <button 
                onClick={() => setShowMessageModal(false)} 
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 text-xl font-bold"
              >
                ×
              </button>
              
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Envoyer un message</h3>
                    <p className="text-slate-600">Cours : {selectedCourse?.course_name}</p>
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-xl p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    <strong>Destinataires :</strong> {courseStudents.length} étudiant(s) Master 2
                  </p>
                </div>
              </div>
              
              {messageSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-green-800 mb-2">Message envoyé !</h4>
                  <p className="text-green-600">Le message a été envoyé à {courseStudents.length} étudiant(s)</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Titre du message *
                    </label>
                    <input
                      type="text"
                      value={messageTitle}
                      onChange={(e) => setMessageTitle(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: Rappel pour le devoir de la semaine prochaine"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Contenu du message *
                    </label>
                    <textarea
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      rows={6}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Tapez votre message ici..."
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowMessageModal(false)}
                      className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleSendMessage}
                      disabled={sendingMessage || !messageTitle.trim() || !messageContent.trim()}
                      className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {sendingMessage ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Envoi...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Envoyer le message</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal profil étudiant */}
        {showStudentProfileModal && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
              <button 
                onClick={() => setShowStudentProfileModal(false)} 
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 text-xl font-bold"
              >
                ×
              </button>
              
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Profil Étudiant</h3>
                    <p className="text-slate-600">Informations détaillées</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Informations personnelles */}
                <div className="bg-slate-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
                    <User className="w-5 h-5 text-blue-600" />
                    <span>Informations personnelles</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Nom complet</label>
                      <p className="text-slate-900 font-medium">{selectedStudent.nom_complet}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Matricule</label>
                      <p className="text-slate-900 font-mono">{selectedStudent.matricule}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
                      <p className="text-slate-900">{selectedStudent.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Sexe</label>
                      <p className="text-slate-900">{selectedStudent.sexe === 'M' ? 'Masculin' : 'Féminin'}</p>
                    </div>
                  </div>
                </div>

                {/* Informations académiques */}
                <div className="bg-blue-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <span>Informations académiques</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Niveau</label>
                      <p className="text-slate-900 font-medium">{selectedStudent.niveau}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Année académique</label>
                      <p className="text-slate-900">{selectedStudent.annee_academique}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowStudentProfileModal(false)}
                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium"
                  >
                    Fermer
                  </button>
                  <button
                    onClick={() => {
                      // Ici on pourrait ajouter une fonction pour envoyer un message privé à cet étudiant
                      setShowStudentProfileModal(false);
                    }}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Envoyer un message</span>
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

export default TeacherDashboard; 