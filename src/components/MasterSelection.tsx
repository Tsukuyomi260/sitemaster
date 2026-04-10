import React, { useState } from 'react';
import SplitText from './SplitText';
import ClickSpark from './ClickSpark';
import RollingGallery from './RollingGallery';
import {
  X, Mail, Phone, BookOpen, Users, Globe,
  Settings, Calendar, GraduationCap, ArrowRight,
  Clock, Layers, Hotel, FlaskConical
} from 'lucide-react';

interface MasterSelectionProps {
  onMasterSelect: (master: string) => void;
}

const MasterSelection: React.FC<MasterSelectionProps> = ({ onMasterSelect }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const masters = [
    {
      id: 'mr-mrtddeftp',
      name: 'MR-MRTDDEFTP',
      fullName: 'Technopédagogie & Formation Technique',
      description: "Master en Technopédagogie et Didactique des Disciplines de l'Enseignement Technique et Professionnel",
      Icon: BookOpen,
      available: true,
    },
    {
      id: 'mr-ip',
      name: 'MR-IP',
      fullName: 'Ingénierie Pédagogique',
      description: 'Master de recherche en Ingénierie Pédagogique',
      Icon: Layers,
      available: false,
    },
    {
      id: 'mr-fib',
      name: 'MR-FIB',
      fullName: 'Teintures, Fibres & Bois',
      description: 'Master de recherche en Teintures, Fibres et Bois',
      Icon: FlaskConical,
      available: false,
    },
    {
      id: 'mr-mhrt',
      name: 'MR-MHRT',
      fullName: 'Hôtellerie, Restauration & Tourisme',
      description: "Master en Management de l'Hôtellerie, de la Restauration et du Tourisme",
      Icon: Hotel,
      available: false,
    },
  ];

  const menuItems = [
    { icon: <GraduationCap className="w-4 h-4" />, label: 'Formations spéciales', description: 'Programmes personnalisés' },
    { icon: <Calendar className="w-4 h-4" />, label: 'Événements', description: 'Conférences et séminaires' },
    { icon: <BookOpen className="w-4 h-4" />, label: 'Programmes', description: 'Découvrir nos formations' },
    { icon: <Users className="w-4 h-4" />, label: 'Équipe', description: 'Notre corps enseignant' },
    { icon: <Globe className="w-4 h-4" />, label: 'Campus', description: 'Visiter notre campus' },
    { icon: <Settings className="w-4 h-4" />, label: 'Services', description: 'Nos services étudiants' },
  ];

  return (
    <div className="min-h-screen bg-[#F8F7F4] relative overflow-x-hidden">

      {/* ── Top Nav ── */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#F8F7F4]/90 backdrop-blur-md border-b border-slate-200/60">
        <div className="h-14 px-5 flex items-center">
          {/* Logo — extrême gauche */}
          <div className="flex items-center gap-2.5">
            <img
              src="/logo-enset.png"
              alt="ENSET"
              className="w-8 h-8 rounded-lg object-contain flex-shrink-0"
            />
            <div className="flex flex-col leading-none">
              <span className="font-bold text-slate-900 text-sm tracking-tight whitespace-nowrap">ENSET-MASTERS</span>
              <span className="text-[10px] text-slate-400 whitespace-nowrap hidden sm:block">Plateforme d'apprentissage</span>
            </div>
          </div>
        </div>
      </header>

      {/* Burger — fixé au coin supérieur droit */}
      <div className="fixed top-[11px] right-5 z-50">
        <ClickSpark sparkColor="#64748b" sparkSize={5} sparkRadius={12} sparkCount={7}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col items-center justify-center gap-[4px] hover:shadow-md transition-all duration-200"
            aria-label="Menu"
          >
            <span className={`w-4 h-[1.5px] bg-slate-600 rounded-full transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-[5.5px]' : ''}`} />
            <span className={`w-4 h-[1.5px] bg-slate-600 rounded-full transition-all duration-200 ${isMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`w-4 h-[1.5px] bg-slate-600 rounded-full transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-[5.5px]' : ''}`} />
          </button>
        </ClickSpark>
      </div>

      {/* ── Menu Overlay ── */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* ── Menu Drawer — depuis la droite ── */}
      <div className={`fixed top-0 right-0 h-full w-72 bg-white border-l border-slate-200 shadow-xl z-50 flex flex-col transition-transform duration-300 ease-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <button onClick={() => setIsMenuOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors flex-shrink-0">
            <X className="w-4 h-4 text-slate-500" />
          </button>
          <div className="flex items-center gap-2">
            <img src="/logo-enset.png" alt="ENSET" className="w-7 h-7 rounded-md object-contain flex-shrink-0" />
            <div className="flex flex-col leading-none">
              <span className="font-bold text-slate-800 text-sm whitespace-nowrap">ENSET-MASTERS</span>
              <span className="text-[10px] text-slate-400">Plateforme d'apprentissage</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.map((item, i) => (
            <a
              key={i}
              href={`#${item.label.toLowerCase()}`}
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-slate-200 transition-colors flex-shrink-0">
                {item.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">{item.label}</p>
                <p className="text-xs text-slate-400">{item.description}</p>
              </div>
            </a>
          ))}
        </div>

        <div className="p-4 border-t border-slate-100 space-y-2">
          <a href="mailto:gnonlonfoun@ensetmasters.org" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Mail className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-700">Email</p>
              <p className="text-xs text-slate-400 truncate">gnonlonfoun@ensetmasters.org</p>
            </div>
          </a>
          <a href="https://wa.me/22901097565871" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
              <Phone className="w-4 h-4 text-green-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-700">WhatsApp</p>
              <p className="text-xs text-slate-400">+229 01 97 56 58 71</p>
            </div>
          </a>
        </div>
      </div>

      {/* ── Main Content ── */}
      <main className="pt-14">
        <div className="max-w-5xl mx-auto px-5 pt-5 pb-14">

          {/* Hero */}
          <div className="mb-8">
            <p className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase mb-3">
              Plateforme d'apprentissage — ENSET Bénin
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight mb-2 tracking-tight">
              <SplitText
                text="Choisissez votre"
                splitType="chars"
                delay={40}
                duration={0.6}
                from={{ opacity: 0, y: 20 }}
                to={{ opacity: 1, y: 0 }}
                ease="power2.out"
                threshold={0}
                rootMargin="0px"
                className="text-3xl sm:text-4xl font-bold text-slate-900"
              />
              <br />
              <SplitText
                text="programme Master"
                splitType="chars"
                delay={40}
                duration={0.6}
                from={{ opacity: 0, y: 20 }}
                to={{ opacity: 1, y: 0 }}
                ease="power2.out"
                threshold={0}
                rootMargin="0px"
                className="text-3xl sm:text-4xl font-bold text-blue-600"
              />
            </h1>
            <p className="text-slate-500 text-sm max-w-md">
              Accédez à vos cours, devoirs et ressources pédagogiques en un clic.
            </p>
          </div>

          {/* Masters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
            {masters.map((master) => {
              const { Icon } = master;
              const isHovered = hoveredId === master.id;

              return (
                <div
                  key={master.id}
                  onClick={() => master.available && onMasterSelect(master.id)}
                  onMouseEnter={() => setHoveredId(master.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`relative group rounded-2xl bg-white border transition-all duration-200 p-6 flex flex-col gap-4
                    ${master.available
                      ? 'border-slate-200 hover:border-blue-200 hover:shadow-lg cursor-pointer'
                      : 'border-slate-100 opacity-60 cursor-default'
                    }
                    ${isHovered && master.available ? 'shadow-lg shadow-blue-50' : 'shadow-sm'}
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-200
                      ${master.available
                        ? isHovered ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                        : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    {master.available ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        Disponible
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                        <Clock className="w-3 h-3" />
                        Bientôt
                      </span>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-1">{master.name}</p>
                    <h3 className={`font-semibold text-base leading-snug mb-2 transition-colors duration-200
                      ${master.available && isHovered ? 'text-blue-700' : 'text-slate-800'}`}
                    >
                      {master.fullName}
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{master.description}</p>
                  </div>

                  {master.available && (
                    <div className={`flex items-center gap-1 text-sm font-medium transition-all duration-200
                      ${isHovered ? 'text-blue-600 translate-x-1' : 'text-slate-300'}`}
                    >
                      <span>Accéder à la plateforme</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}

                  {master.available && (
                    <div className={`absolute left-0 top-6 bottom-6 w-[3px] rounded-full transition-all duration-200
                      ${isHovered ? 'bg-blue-500' : 'bg-blue-200'}`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Gallery */}
          <div>
            <p className="text-[11px] font-semibold tracking-widest text-slate-300 uppercase mb-4">
              Vie sur le campus
            </p>
            <RollingGallery autoplay={true} pauseOnHover={true} />
          </div>

        </div>
      </main>
    </div>
  );
};

export default MasterSelection;