import React, { useState, useEffect } from 'react';
import MasterSelection from './components/MasterSelection';
import LoginInterface from './components/LoginInterface';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import AdminDashboard from './components/AdminDashboard';
import RoleSelection from './components/RoleSelection';
import ClickSpark from './components/ClickSpark';
import { EmailIcon, WhatsAppIcon } from './components/ContactIcons';
import { loginUser, getCurrentUser, signOut, getUserRole, getUserRoles, getStudentInfo } from './api';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userType, setUserType] = useState<string>('');
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMaster, setSelectedMaster] = useState<string>('');
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [showRoleSelection, setShowRoleSelection] = useState(false);

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
        // Récupérer le premier rôle depuis Supabase (compatibilité)
        const role = await getUserRole(currentUser.id);
        setUserType(role);
        
        // Si c'est un étudiant, récupérer ses informations
        if (role === 'student' && currentUser.email) {
          const info = await getStudentInfo(currentUser.email);
          setStudentInfo(info);
        }
      }
    } catch (error: any) {
      console.error('Erreur lors de la vérification de l\'utilisateur:', error);
      
      // Si l'utilisateur est bloqué, afficher un message spécifique
      if (error.message && error.message.includes('bloqué')) {
        alert('Votre compte a été bloqué par un administrateur. Veuillez contacter l\'administration.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (username: string, password: string, selectedUserType: string) => {
    try {
      setLoading(true);
      console.log('Tentative de connexion pour:', username, 'avec type:', selectedUserType);
      
      const userData = await loginUser(username, password);
      console.log('UserData reçu:', userData);
      setUser(userData);
      
      // Récupérer tous les rôles disponibles depuis Supabase
      const availableRoles = await getUserRoles(userData.id);
      console.log('Rôles disponibles trouvés:', availableRoles, 'Rôle sélectionné:', selectedUserType);
      
      // Si l'utilisateur a plusieurs rôles, afficher la sélection
      if (availableRoles.length > 1) {
        setAvailableRoles(availableRoles);
        setShowRoleSelection(true);
        return true; // Retourner true pour ne pas afficher d'erreur
      }
      
      // Si l'utilisateur n'a qu'un seul rôle, vérifier s'il correspond
      if (!availableRoles.includes(selectedUserType)) {
        console.log('Rôle sélectionné non autorisé! Déconnexion...');
        await signOut();
        return false;
      }
      
      // Connexion réussie avec un seul rôle
      await completeLogin(selectedUserType, userData);
      return true;
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      
      // Si l'utilisateur est bloqué, afficher un message spécifique
      if (error.message && error.message.includes('bloqué')) {
        alert('Votre compte a été bloqué par un administrateur. Veuillez contacter l\'administration.');
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  const completeLogin = async (selectedRole: string, userData: any) => {
    console.log('Finalisation de la connexion avec le rôle:', selectedRole);
      setIsLoggedIn(true);
    setUserType(selectedRole);
    
    // Si c'est un étudiant, récupérer ses informations
    if (selectedRole === 'student' && userData.email) {
      const info = await getStudentInfo(userData.email);
      console.log('Student info récupéré:', info);
      setStudentInfo(info);
    }
  };

  const handleRoleSelect = async (role: string) => {
    setShowRoleSelection(false);
    await completeLogin(role, user);
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
          <p className="text-slate-600 mb-6">Chargement...</p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <span className="text-xs text-slate-500">Besoin d'aide ? Contactez-nous :</span>
            <a 
              href="mailto:gnonlonfoun@ensetmasters.org" 
              className="text-xs text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center gap-1"
            >
              <EmailIcon />
              gnonlonfoun@ensetmasters.org
            </a>
            <a 
              href="https://wa.me/22996113246" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-green-600 hover:text-green-800 transition-colors duration-200 flex items-center gap-1"
            >
              <WhatsAppIcon />
              +229 01 96 11 32 46
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App min-h-screen flex flex-col">
      {showRoleSelection && (
        <RoleSelection
          availableRoles={availableRoles}
          onRoleSelect={handleRoleSelect}
          onCancel={() => {
            setShowRoleSelection(false);
            handleLogout();
          }}
        />
      )}
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
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
                    <a 
                      href="mailto:gnonlonfoun@ensetmasters.org" 
                      className="text-xs text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center gap-1"
                    >
                      <EmailIcon />
                      gnonlonfoun@ensetmasters.org
                    </a>
                    <a 
                      href="https://wa.me/22996113246" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-green-600 hover:text-green-800 transition-colors duration-200 flex items-center gap-1"
                    >
                      <WhatsAppIcon />
                      +229 01 96 11 32 46
                    </a>
                  </div>
                  
                  <ClickSpark sparkColor="#ffffff" sparkSize={8} sparkRadius={20} sparkCount={12}>
                    <button
                      onClick={handleLogout}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                    >
                      Se déconnecter
                    </button>
                  </ClickSpark>
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
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-2">
            <a 
              href="mailto:gnonlonfoun@ensetmasters.org" 
              className="text-xs text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center gap-1"
            >
              <EmailIcon />
              gnonlonfoun@ensetmasters.org
            </a>
            <a 
              href="https://wa.me/22996113246" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-green-600 hover:text-green-800 transition-colors duration-200 flex items-center gap-1"
            >
              <WhatsAppIcon />
              +229 01 96 11 32 46
            </a>
          </div>
          <div className="text-xs text-slate-400 text-center">© {new Date().getFullYear()} ENSET-MASTERS. Tous droits réservés.</div>
        </div>
      </footer>
    </div>
  );
}

export default App;