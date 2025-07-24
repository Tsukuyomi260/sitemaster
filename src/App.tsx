import React, { useState } from 'react';
import LoginInterface from './components/LoginInterface';
import StudentDashboard from './components/StudentDashboard';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [studentName, setStudentName] = useState('');

  // Identifiants fictifs
  const fakeStudent = { username: 'etudiant', password: 'test123', name: 'AVOCE Elodie' };

  const handleLogin = (username: string, password: string) => {
    if (username === fakeStudent.username && password === fakeStudent.password) {
      setIsLoggedIn(true);
      setStudentName(fakeStudent.name);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setStudentName('');
  };

  return (
    <div className="App min-h-screen flex flex-col">
      <div className="flex-1">
        {isLoggedIn ? (
          <StudentDashboard studentName={studentName} onLogout={handleLogout} />
        ) : (
          <LoginInterface onLogin={handleLogin} />
        )}
      </div>
      <footer className="bg-white text-slate-900 py-8 mt-12 border-t border-slate-200">
        <div className="container mx-auto px-4 flex flex-col items-center justify-center">
          <img src="/logo-enset.png" alt="Logo ENSET" className="w-16 h-16 rounded mb-2" />
          <div className="font-bold text-lg text-center">ENSET-MRTDDEFTP</div>
          <div className="text-xs text-slate-500 text-center mb-2">Ecole Normale Supérieure de l'Enseignement Technique</div>
          <div className="text-xs text-slate-400 text-center mb-1">Contact : master.mrtddeftp@enset.bj</div>
          <div className="text-xs text-slate-400 text-center">© {new Date().getFullYear()} ENSET-MRTDDEFTP. Tous droits réservés.</div>
        </div>
      </footer>
    </div>
  );
}

export default App;