import React, { useState } from 'react';
import LoginInterface from './components/LoginInterface';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import AdminDashboard from './components/AdminDashboard'; // à créer

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [isTeacher, setIsTeacher] = useState(false);
  const [teacherName, setTeacherName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminName, setAdminName] = useState('');

  // Identifiants fictifs
  const fakeStudent = { username: 'etudiant', password: 'test123', name: 'AVOCE Elodie' };
  const teachers = [
    { username: 'enseignant1', password: 'enset2024a', name: 'Enseignant 1' },
    { username: 'enseignant2', password: 'enset2024b', name: 'Enseignant 2' },
    { username: 'enseignant3', password: 'enset2024c', name: 'Enseignant 3' },
  ];
  const admins = [
    { username: 'admin1', password: 'ensetadmin1', name: 'Administrateur 1' },
    { username: 'admin2', password: 'ensetadmin2', name: 'Administrateur 2' },
  ];

  const handleLogin = (username: string, password: string, userType?: string) => {
    if (userType === 'admin') {
      const found = admins.find(a => a.username === username && a.password === password);
      if (found) {
        setIsLoggedIn(true);
        setIsAdmin(true);
        setAdminName(found.name);
        return true;
      }
      return false;
    }
    if (userType === 'teacher') {
      const found = teachers.find(t => t.username === username && t.password === password);
      if (found) {
        setIsLoggedIn(true);
        setIsTeacher(true);
        setTeacherName(found.name);
        return true;
      }
      return false;
    }
    if (username === fakeStudent.username && password === fakeStudent.password) {
      setIsLoggedIn(true);
      setIsTeacher(false);
      setStudentName(fakeStudent.name);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsTeacher(false);
    setIsAdmin(false);
    setStudentName('');
    setTeacherName('');
    setAdminName('');
  };

  return (
    <div className="App min-h-screen flex flex-col">
      <div className="flex-1">
        {isLoggedIn ? (
          isAdmin ? (
            <AdminDashboard adminName={adminName} onLogout={handleLogout} />
          ) : isTeacher ? (
            <TeacherDashboard teacherName={teacherName} onLogout={handleLogout} />
          ) : (
            <StudentDashboard studentName={studentName} onLogout={handleLogout} />
          )
        ) : (
          <LoginInterface onLogin={(username, password, userType) => handleLogin(username, password, userType)} />
        )}
      </div>
      <footer className="bg-white text-slate-900 py-8 mt-12 border-t border-slate-200">
        <div className="container mx-auto px-4 flex flex-col items-center justify-center">
          <img src="/logo-enset.png" alt="Logo ENSET" className="w-16 h-16 rounded mb-2" />
          <div className="font-bold text-lg text-center">ENSET-MASTERS</div>
          <div className="text-xs text-slate-500 text-center mb-2">Ecole Normale Supérieure de l'Enseignement Technique</div>
          <div className="text-xs text-slate-400 text-center mb-1">Contact : master.mrtddeftp@enset.bj</div>
          <div className="text-xs text-slate-400 text-center">© {new Date().getFullYear()} ENSET-MASTERS. Tous droits réservés.</div>
        </div>
      </footer>
    </div>
  );
}

export default App;