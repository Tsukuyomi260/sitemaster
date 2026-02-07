import React, { useState, useEffect } from 'react';
import { User, BookOpen, Users, Download, Upload, Settings, LogOut, ChevronUp, MessageSquare, Send, Search, X } from 'lucide-react';
import { getTeacherCourses, getStudentsByCourse, sendMessageToStudents, sendMessageToAllStudents, getSubmissionsByCourse, getSubmissionsForTeacher } from '../api';

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
  student?: {
    id: string;
    nom_complet: string;
    matricule: string;
    email: string;
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
  const [studentSearchTerm, setStudentSearchTerm] = useState<string>('');
  const [submissionSearchTerm, setSubmissionSearchTerm] = useState<string>('');

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
        
        // Charger les soumissions des cours assignés à cet enseignant
        console.log('TeacherDashboard - Chargement des soumissions pour:', teacherName);
        const submissionsData = await getSubmissionsForTeacher(teacherName);
        console.log('TeacherDashboard - Soumissions récupérées:', submissionsData);
        setSubmissions(submissionsData || []);
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

  const loadAllSubmissions = async () => {
    try {
      setSubmissionsLoading(true);
      const submissionsData = await getSubmissionsForTeacher(teacherName);
      setSubmissions(submissionsData || []);
    } catch (error) {
      console.error('Erreur lors du chargement des soumissions de l\'enseignant:', error);
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

  const truncateFileName = (fileName: string, maxLength: number = 30) => {
    if (fileName.length <= maxLength) return fileName;
    
    const extension = fileName.split('.').pop();
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
    const truncatedName = nameWithoutExt.substring(0, maxLength - 3) + '...';
    
    return extension ? `${truncatedName}.${extension}` : truncatedName;
  };

  // Filtrer les étudiants selon le terme de recherche
  const filteredStudents = students.filter(student => {
    const searchTerm = studentSearchTerm.toLowerCase();
    return (
      student.nom_complet.toLowerCase().includes(searchTerm) ||
      student.matricule.toLowerCase().includes(searchTerm) ||
      student.email.toLowerCase().includes(searchTerm)
    );
  });

  // Filtrer les soumissions selon le terme de recherche
  const filteredSubmissions = submissions.filter(submission => {
    const searchTerm = submissionSearchTerm.toLowerCase();
    return (
      (submission.student?.nom_complet || '').toLowerCase().includes(searchTerm) ||
      (submission.student?.matricule || '').toLowerCase().includes(searchTerm) ||
      (submission.student?.email || '').toLowerCase().includes(searchTerm) ||
      (submission.submission_title || '').toLowerCase().includes(searchTerm) ||
      (submission.assignments?.title || '').toLowerCase().includes(searchTerm) ||
      (submission.assignments?.course || '').toLowerCase().includes(searchTerm) ||
      (submission.file_name || '').toLowerCase().includes(searchTerm)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col md:flex-row">
      {/* Sidebar navigation - Fixed */}
      <div className="w-64 bg-white dark:bg-slate-800 shadow-lg border-r border-slate-200 dark:border-slate-700 flex-col justify-between hidden md:flex fixed left-0 top-0 h-full z-30">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center bg-white shadow-lg border border-slate-200">
              <img src="/logo-enset.png" alt="Logo ENSET-MASTERS" className="object-contain w-full h-full" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 dark:text-white text-lg">MR-MRTDDEFTP</h1>
              <div className="flex items-center space-x-2">
                <p className="text-xs text-slate-600 dark:text-slate-400">Espace</p>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  Enseignant
                </span>
              </div>
            </div>
          </div>
          
          <nav className="space-y-3">
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
          <div className="mt-3 space-y-3">
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

      {/* Main content - Adjusted for fixed sidebar */}
      <div className="flex-1 md:ml-64 min-h-screen">
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

        <div className="p-4 md:p-8">
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
                    <span className="text-lg font-bold text-blue-600">{filteredStudents.length}</span>
                  </div>
                </div>

                {/* Barre de recherche */}
                <div className="mb-6">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Rechercher par nom, matricule ou email..."
                      value={studentSearchTerm}
                      onChange={(e) => setStudentSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 hover:bg-white transition-colors"
                    />
                    {studentSearchTerm && (
                      <button
                        onClick={() => setStudentSearchTerm('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        <X className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                      </button>
                    )}
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
                        {filteredStudents.map((student, index) => (
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
                
                {!loading && filteredStudents.length === 0 && (
                  <div className="text-center py-12 text-slate-500">
                    <Users className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <p>
                      {studentSearchTerm 
                        ? `Aucun étudiant trouvé pour "${studentSearchTerm}"` 
                        : 'Aucun étudiant Master 2 trouvé.'
                      }
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'submissions' && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 mb-8 shadow-sm max-w-full overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Devoirs rendus par mes étudiants</h2>
                    <p className="text-sm text-slate-600 mt-1">Consultez et téléchargez les devoirs soumis</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Upload className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-lg font-bold text-blue-600">{filteredSubmissions.length}</span>
                  </div>
                </div>

                {/* Barre de recherche pour les soumissions */}
                <div className="mb-6">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Rechercher par nom d'étudiant, titre du devoir, cours ou nom de fichier..."
                      value={submissionSearchTerm}
                      onChange={(e) => setSubmissionSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 hover:bg-white transition-colors"
                    />
                    {submissionSearchTerm && (
                      <button
                        onClick={() => setSubmissionSearchTerm('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        <X className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                      </button>
                    )}
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
                        loadAllSubmissions();
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
                  <div className="space-y-4">
                    {filteredSubmissions.map((submission, index) => (
                      <div 
                        key={submission.id} 
                        className={`bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-all duration-200 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                        }`}
                      >
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
                                                     {/* Informations de l'étudiant */}
                           <div className="space-y-2 min-w-0">
                             <div className="flex items-center space-x-3 min-w-0">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-semibold text-slate-900 truncate" title={submission.student?.nom_complet || submission.student_id}>
                                  {submission.student?.nom_complet || submission.student_id}
                                </div>
                                <div className="text-sm text-slate-500 truncate" title={`Matricule: ${submission.student?.matricule || submission.student_id}`}>
                                  Matricule: {submission.student?.matricule || submission.student_id}
                                </div>
                                {submission.student?.email && (
                                  <div className="text-xs text-slate-400 truncate" title={submission.student.email}>
                                    {submission.student.email}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                                                     {/* Informations du devoir */}
                           <div className="space-y-2 min-w-0">
                             <div className="min-w-0 flex-1">
                               <div className="font-semibold text-slate-900 text-lg truncate" title={submission.submission_title}>
                                 {submission.submission_title}
                               </div>
                               <div className="text-sm text-slate-600 truncate" title={submission.assignments?.title}>
                                 {submission.assignments?.title}
                               </div>
                             </div>
                                                         <div className="text-sm text-slate-500 truncate" title={submission.assignments?.course}>
                               Cours: {submission.assignments?.course}
                             </div>
                          </div>

                                                     {/* Informations du fichier et date */}
                           <div className="space-y-2 min-w-0">
                             <div className="flex items-center space-x-2 min-w-0">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <Download className="w-4 h-4 text-green-600" />
                              </div>
                                                             <div className="min-w-0 flex-1">
                                 <div className="font-medium text-slate-900 text-sm truncate" title={submission.file_name}>
                                   {truncateFileName(submission.file_name)}
                                 </div>
                                <div className="text-xs text-slate-500">
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
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-4 pt-4 border-t border-slate-200 flex flex-wrap gap-2">
                          <button 
                            onClick={() => handleDownloadSubmission(submission.file_url, submission.file_name)}
                            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            <Download className="w-4 h-4" />
                            <span>Télécharger</span>
                          </button>
                          
                          {submission.comments && (
                            <button 
                              onClick={() => {
                                const modal = document.createElement('div');
                                modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
                                modal.innerHTML = `
                                  <div class="bg-white rounded-2xl p-6 max-w-md w-full">
                                    <h3 class="text-lg font-semibold mb-4">Commentaires de l'étudiant</h3>
                                    <p class="text-slate-700 mb-4">${submission.comments}</p>
                                    <button onclick="this.parentElement.parentElement.remove()" class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                      Fermer
                                    </button>
                                  </div>
                                `;
                                document.body.appendChild(modal);
                              }}
                              className="inline-flex items-center space-x-2 bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
                            >
                              <MessageSquare className="w-4 h-4" />
                              <span>Voir commentaires</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!submissionsLoading && filteredSubmissions.length === 0 && (
                  <div className="text-center py-12 text-slate-500">
                    <Upload className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <p>
                      {submissionSearchTerm 
                        ? `Aucun devoir trouvé pour "${submissionSearchTerm}"` 
                        : 'Aucun devoir rendu trouvé pour ce cours.'
                      }
                    </p>
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
    </div>
  );
}

export default TeacherDashboard; 