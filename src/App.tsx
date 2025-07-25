import React, { useState, useEffect } from 'react';
import LoginInterface from './components/LoginInterface';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import AdminDashboard from './components/AdminDashboard';
import { loginUser, getCurrentUser, signOut } from './api';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userType, setUserType] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Vérifier si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setIsLoggedIn(true);
        // Déterminer le type d'utilisateur basé sur l'email ou les métadonnées
        determineUserType(currentUser);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'utilisateur:', error);
    } finally {
      setLoading(false);
    }
  };

  const determineUserType = (user: any) => {
    // Logique pour déterminer le type d'utilisateur
    // Tu peux adapter cette logique selon ta structure de données
    const email = user.email?.toLowerCase() || '';
    
    if (email.includes('admin') || email.includes('administrateur')) {
      setUserType('admin');
    } else if (email.includes('enseignant') || email.includes('teacher') || email.includes('prof')) {
      setUserType('teacher');
    } else {
      setUserType('student');
    }
  };

  const handleLogin = async (username: string, password: string, userType?: string) => {
    try {
      setLoading(true);
      const userData = await loginUser(username, password);
      setUser(userData);
      setIsLoggedIn(true);
      
      // Utiliser le type spécifié ou le déterminer automatiquement
      if (userType) {
        setUserType(userType);
      } else {
        determineUserType(userData);
      }
      
      return true;
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      // Retourner le message d'erreur pour l'afficher à l'utilisateur
      throw new Error(error.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setIsLoggedIn(false);
      setUser(null);
      setUserType('');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App min-h-screen flex flex-col">
      <div className="flex-1">
        {isLoggedIn ? (
          userType === 'admin' ? (
            <AdminDashboard adminName={user?.email || 'Administrateur'} onLogout={handleLogout} />
          ) : userType === 'teacher' ? (
            <TeacherDashboard teacherName={user?.email || 'Enseignant'} onLogout={handleLogout} />
          ) : (
            <StudentDashboard studentName={user?.email || 'Étudiant'} onLogout={handleLogout} />
          )
        ) : (
          <LoginInterface onLogin={handleLogin} />
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