import React, { useState, MouseEvent, ChangeEvent } from 'react';
import { Eye, EyeOff, User, Lock, BookOpen } from 'lucide-react';
import SplitText from './SplitText';
import ShinyText from './ShinyText';

interface LoginInterfaceProps {
  onLogin: (username: string, password: string, userType?: string) => boolean;
}

const LoginInterface: React.FC<LoginInterfaceProps> = ({ onLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState('student');
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: MouseEvent<HTMLButtonElement>) => {
    setError('');
    const success = onLogin(formData.username, formData.password, userType);
    if (!success) {
      setError('Identifiants incorrects.');
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <img src="/logo-enset.png" alt="Logo ENSET-MRTDDEFTP" className="object-contain w-20 h-20 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            <SplitText 
              text="ENSET-MRTDDEFTP"
              splitType="chars"
              delay={80}
              duration={0.8}
              from={{ opacity: 0, y: 50, rotationX: -90, scale: 0.8 }}
              to={{ opacity: 1, y: 0, rotationX: 0, scale: 1 }}
              ease="back.out(1.7)"
              threshold={0}
              rootMargin="0px"
              className="text-2xl font-bold text-slate-900"
            />
          </h1>
          <p className="text-slate-600">
            Accédez à votre espace d'apprentissage
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200">
          {/* User Type Toggle */}
          <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => setUserType('student')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                userType === 'student'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Étudiant
            </button>
            <button
              type="button"
              onClick={() => setUserType('teacher')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                userType === 'teacher'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Enseignant
            </button>
          </div>

          <div className="space-y-6">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-2">
                Nom d'utilisateur
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white"
                  placeholder="Entrez votre nom d'utilisateur"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-12 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white"
                  placeholder="Entrez votre mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <a href="#" className="text-sm text-slate-600 hover:text-slate-900 transition-colors duration-200">
                Mot de passe oublié ?
              </a>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-600 text-sm text-center font-medium">{error}</div>
            )}

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full bg-slate-900 text-white py-3 px-4 rounded-xl font-medium hover:bg-slate-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <ShinyText text="Se connecter" />
            </button>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-slate-500">
            Besoin d'aide ? Contactez l'administration
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center text-xs text-slate-500">
          © 2025 ENSET-MRTDDEFTP. Tous droits réservés.
        </div>
      </div>
    </div>
  );
};

export default LoginInterface;