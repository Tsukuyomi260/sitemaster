import React, { useState, useEffect } from 'react';
import MasterSelection from './components/MasterSelection';
import LoginInterface from './components/LoginInterface';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import AdminDashboard from './components/AdminDashboard';
import { loginUser, getCurrentUser, signOut, getUserRole, getStudentInfo } from './api';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userType, setUserType] = useState<string>('');
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMaster, setSelectedMaster] = useState<string>('');

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
        // Récupérer le rôle depuis Supabase
        const role = await getUserRole(currentUser.id);
        setUserType(role);
        
        // Si c'est un étudiant, récupérer ses informations
        if (role === 'student' && currentUser.email) {
          const info = await getStudentInfo(currentUser.email);
          setStudentInfo(info);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'utilisateur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (username: string, password: string, selectedUserType: string) => {
    try {
      setLoading(true);
      const userData = await loginUser(username, password);
      setUser(userData);
      
      // Récupérer le rôle réel depuis Supabase
      const actualRole = await getUserRole(userData.id);
      
      // Vérifier si le rôle choisi correspond au rôle réel
      if (selectedUserType !== actualRole) {
        // Déconnexion automatique si le rôle ne correspond pas
        await signOut();
        return false; // Retourner false pour afficher le message d'erreur
      }
      
      // Si le rôle correspond, connecter l'utilisateur
      setIsLoggedIn(true);
      setUserType(actualRole);
      
      // Si c'est un étudiant, récupérer ses informations
      if (actualRole === 'student' && userData.email) {
        const info = await getStudentInfo(userData.email);
        console.log('Student info récupéré:', info); // Debug
        setStudentInfo(info);
      }
      
      return true;
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      return false; // Retourner false pour afficher le message d'erreur
    } finally {
      setLoading(false);
    }
  };

  const handleMasterSelect = (master: string) => {
    setSelectedMaster(master);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setIsLoggedIn(false);
      setUser(null);
      setUserType('');
      setStudentInfo(null);
      setSelectedMaster('');
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
          ) : userType === 'student' ? (
            <StudentDashboard 
              studentName={studentInfo?.nom || user?.email || 'Étudiant'} 
              studentInfo={studentInfo}
              onLogout={handleLogout} 
            />
          ) : (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
              <div className="text-center">
                <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md">
                  <h2 className="text-xl font-semibold text-red-800 mb-4">Accès non autorisé</h2>
                  <p className="text-red-700 mb-4">Votre compte n'a pas de rôle défini. Veuillez contacter l'administration.</p>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                  >
                    Se déconnecter
                  </button>
                </div>
              </div>
            </div>
          )
        ) : selectedMaster === 'mr-mrtddeftp' ? (
          <LoginInterface onLogin={handleLogin} />
        ) : (
          <MasterSelection onMasterSelect={handleMasterSelect} />
        )}
      </div>
      <footer className="bg-white text-slate-900 py-8 mt-12 border-t border-slate-200">
        <div className="container mx-auto px-4 flex flex-col items-center justify-center">
          <img src="/logo-enset.png" alt="Logo ENSET" className="w-16 h-16 rounded mb-2" />
          <div className="font-bold text-lg text-center">ENSET-MASTERS</div>
          <div className="text-xs text-slate-500 text-center mb-2">Ecole Normale Supérieure de l'Enseignement Technique</div>
          <div className="text-xs text-slate-400 text-center mb-1">Contact : gnonlonfoun@ensetmasters.org</div>
          <div className="text-xs text-slate-400 text-center">© {new Date().getFullYear()} ENSET-MASTERS. Tous droits réservés.</div>
        </div>
      </footer>
    </div>
  );
}

export default App;