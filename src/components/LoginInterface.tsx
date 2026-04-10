import React, { useState, MouseEvent, ChangeEvent, KeyboardEvent } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, GraduationCap, BookOpen, ShieldCheck } from 'lucide-react';
import ClickSpark from './ClickSpark';
import SplitText from './SplitText';

interface LoginInterfaceProps {
  onLogin: (username: string, password: string, userType: string) => Promise<boolean>;
}

const userTypes = [
  { id: 'student',  label: 'Étudiant',       Icon: GraduationCap },
  { id: 'teacher',  label: 'Enseignant',      Icon: BookOpen },
  { id: 'admin',    label: 'Administrateur',  Icon: ShieldCheck },
];

const LoginInterface: React.FC<LoginInterfaceProps> = ({ onLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState('student');
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e?: MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    if (!formData.username || !formData.password) return;
    setError('');
    setLoading(true);
    try {
      const success = await onLogin(formData.username, formData.password, userType);
      if (!success) setError('Email ou mot de passe incorrect.');
    } catch {
      setError('Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col">

      {/* ── Top bar ── */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#F8F7F4]/90 backdrop-blur-md border-b border-slate-200/60">
        <div className="h-14 px-5 flex items-center justify-between">
          <a
            href="/"
            onClick={(e) => { e.preventDefault(); window.history.back(); }}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Retour</span>
          </a>
          <div className="flex items-center gap-2.5">
            <img src="/logo-enset.png" alt="ENSET" className="w-8 h-8 rounded-lg object-contain flex-shrink-0" />
            <div className="flex flex-col leading-none">
              <span className="font-bold text-slate-900 text-sm tracking-tight whitespace-nowrap">ENSET-MASTERS</span>
              <span className="text-[10px] text-slate-400 hidden sm:block">Plateforme d'apprentissage</span>
            </div>
          </div>
          {/* spacer pour centrer le logo */}
          <div className="w-16" />
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 flex items-center justify-center px-5 pt-14">
        <div className="w-full max-w-sm py-10">

          {/* Hero */}
          <div className="mb-8">
            <p className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase mb-3">
              Connexion — MR-MRTDDEFTP
            </p>
            <h1 className="text-3xl font-bold text-slate-900 leading-tight tracking-tight mb-2">
              <SplitText
                text="Accédez à votre"
                splitType="chars"
                delay={30}
                duration={0.5}
                from={{ opacity: 0, y: 15 }}
                to={{ opacity: 1, y: 0 }}
                ease="power2.out"
                threshold={0}
                rootMargin="0px"
                className="text-3xl font-bold text-slate-900"
              />
              <br />
              <SplitText
                text="espace Master"
                splitType="chars"
                delay={30}
                duration={0.5}
                from={{ opacity: 0, y: 15 }}
                to={{ opacity: 1, y: 0 }}
                ease="power2.out"
                threshold={0}
                rootMargin="0px"
                className="text-3xl font-bold text-blue-600"
              />
            </h1>
            <p className="text-sm text-slate-400">Sélectionnez votre profil et renseignez vos identifiants.</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

            {/* User type pills */}
            <div className="flex gap-2 mb-6">
              {userTypes.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => { setUserType(id); setError(''); }}
                  className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-medium transition-all duration-200
                    ${userType === id
                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="username" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="username"
                    name="username"
                    type="email"
                    required
                    autoComplete="email"
                    value={formData.username}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                    placeholder="votre@email.com"
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 placeholder:text-slate-300 transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 placeholder:text-slate-300 transition-all disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                  <p className="text-red-600 text-xs mb-2">{error}</p>
                  <div className="flex flex-wrap gap-2">
                    <a href="mailto:gnonlonfoun@ensetmasters.org" className="text-[11px] text-blue-600 hover:underline">
                      gnonlonfoun@ensetmasters.org
                    </a>
                    <a href="https://wa.me/22901097565871" target="_blank" rel="noopener noreferrer" className="text-[11px] text-green-600 hover:underline">
                      +229 01 97 56 58 71
                    </a>
                  </div>
                </div>
              )}

              {/* Submit */}
              <ClickSpark sparkColor="#ffffff" sparkSize={7} sparkRadius={18} sparkCount={10}>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={loading || !formData.username || !formData.password}
                  className="w-full bg-blue-600 text-white py-2.5 px-6 rounded-xl text-sm font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Connexion…
                    </span>
                  ) : (
                    'Se connecter'
                  )}
                </button>
              </ClickSpark>
            </div>
          </div>

          {/* Session note */}
          <p className="text-center text-[11px] text-slate-400 mt-4">
            Session sécurisée — expiration automatique après <span className="font-medium text-slate-500">1 heure</span>.
          </p>
        </div>
      </main>
    </div>
  );
};

export default LoginInterface;
