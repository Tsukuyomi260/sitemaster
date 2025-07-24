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
      <footer className="bg-slate-900 text-white py-8 mt-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          {/* Logo et nom */}
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <img src="/logo-enset.jpg" alt="Logo ENSET" className="w-12 h-12 rounded" />
            <div>
              <div className="font-bold text-lg">ENSET-MRTDDEFTP</div>
              <div className="text-xs text-slate-300">Ecole Normale Supérieure de l'Enseignement Technique</div>
            </div>
          </div>
          {/* Liens utiles */}
          <div className="flex space-x-6 mb-4 md:mb-0">
            <a href="/" className="hover:underline">Accueil</a>
            <a href="/dashboard" className="hover:underline">Tableau de bord</a>
            <a href="/cours" className="hover:underline">Cours</a>
            <a href="/contact" className="hover:underline">Contact</a>
          </div>
          {/* Contact et copyright */}
          <div className="text-xs text-slate-400 text-center md:text-right">
            <div>Contact : master.mrtddeftp@enset.bj</div>
            <div>© {new Date().getFullYear()} ENSET-MRTDDEFTP. Tous droits réservés.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;