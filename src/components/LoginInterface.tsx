import React, { useState, MouseEvent, ChangeEvent } from 'react';
import { Eye, EyeOff, User, Lock } from 'lucide-react';
import { EmailIcon, WhatsAppIcon } from './ContactIcons';
import SplitText from './SplitText';

interface LoginInterfaceProps {
  onLogin: (username: string, password: string, userType: string) => Promise<boolean>;
}

const LoginInterface: React.FC<LoginInterfaceProps> = ({ onLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState('student');
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const success = await onLogin(formData.username, formData.password, userType);
    if (!success) {
        setError('Identifiants invalides');
      }
    } catch (err: any) {
      setError('Identifiants invalides');
    } finally {
      setLoading(false);
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
          <img src="/logo-enset.png" alt="Logo ENSET-MASTERS" className="object-contain w-20 h-20 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            <SplitText 
              text="MR-MRTDDEFTP"
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
            Accéder à votre espace Master
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200">
          {/* User Type Toggle */}
          <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => setUserType('student')}
              className={`flex-1 py-2 px-2 md:px-4 rounded-lg text-xs md:text-sm font-medium whitespace-normal transition-all duration-200 ${userType === 'student' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Étudiant
            </button>
            <button
              type="button"
              onClick={() => setUserType('teacher')}
              className={`flex-1 py-2 px-2 md:px-4 rounded-lg text-xs md:text-sm font-medium whitespace-normal transition-all duration-200 ${userType === 'teacher' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Enseignant
            </button>
            <button
              type="button"
              onClick={() => setUserType('admin')}
              className={`flex-1 py-2 px-2 md:px-4 rounded-lg text-xs md:text-sm font-medium whitespace-normal transition-all duration-200 ${userType === 'admin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Administrateur
            </button>
          </div>

          <div className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="username"
                  name="username"
                  type="email"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all duration-200"
                  placeholder="votre@email.com"
                  disabled={loading}
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
                  className="w-full pl-12 pr-12 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all duration-200"
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-700 text-sm mb-3">{error}</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <span className="text-xs text-red-600">Besoin d'aide ? Contactez-nous :</span>
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
                    +229 96 11 32 46
                  </a>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading || !formData.username || !formData.password}
              className="w-full bg-slate-900 text-white py-3 px-6 rounded-xl font-medium hover:bg-slate-800 focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Connexion en cours...
                </div>
              ) : (
                'Se connecter'
              )}
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Sélectionnez votre type d'utilisateur pour accéder à votre espace
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginInterface;