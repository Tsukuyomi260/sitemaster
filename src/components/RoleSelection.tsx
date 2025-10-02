import React from 'react';
import { User, GraduationCap, Shield } from 'lucide-react';

interface RoleSelectionProps {
  availableRoles: string[];
  onRoleSelect: (role: string) => void;
  onCancel: () => void;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({ availableRoles, onRoleSelect, onCancel }) => {
  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'student':
        return {
          title: 'Espace Étudiant',
          description: 'Accéder à vos cours, devoirs et notifications',
          icon: User,
          color: 'from-blue-500 to-blue-600',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          textColor: 'text-blue-700 dark:text-blue-400'
        };
      case 'teacher':
        return {
          title: 'Espace Enseignant',
          description: 'Gérer vos cours et communiquer avec vos étudiants',
          icon: GraduationCap,
          color: 'from-green-500 to-emerald-600',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          textColor: 'text-green-700 dark:text-green-400'
        };
      case 'admin':
        return {
          title: 'Espace Administrateur',
          description: 'Gérer la plateforme et tous les utilisateurs',
          icon: Shield,
          color: 'from-purple-500 to-blue-600',
          bgColor: 'bg-purple-50 dark:bg-purple-900/20',
          textColor: 'text-purple-700 dark:text-purple-400'
        };
      default:
        return {
          title: 'Espace Utilisateur',
          description: 'Accéder à votre espace personnel',
          icon: User,
          color: 'from-gray-500 to-gray-600',
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          textColor: 'text-gray-700 dark:text-gray-400'
        };
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Choisissez votre espace
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Vous avez accès à plusieurs espaces. Sélectionnez celui que vous souhaitez utiliser.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {availableRoles.map((role) => {
            const roleInfo = getRoleInfo(role);
            const IconComponent = roleInfo.icon;
            
            return (
              <button
                key={role}
                onClick={() => onRoleSelect(role)}
                className={`${roleInfo.bgColor} p-6 rounded-2xl border-2 border-transparent hover:border-current transition-all duration-200 group`}
              >
                <div className="text-center">
                  <div className={`w-16 h-16 bg-gradient-to-r ${roleInfo.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-200`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className={`text-lg font-semibold ${roleInfo.textColor} mb-2`}>
                    {roleInfo.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {roleInfo.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-center">
          <button
            onClick={onCancel}
            className="px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection; 