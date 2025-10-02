import React, { useState } from 'react';
import SplitText from './SplitText';
import { EmailIcon, WhatsAppIcon } from './ContactIcons';
import { Menu, X, Info, Phone, Mail, Globe, BookOpen, Users, Settings, Calendar, GraduationCap } from 'lucide-react';

interface MasterSelectionProps {
  onMasterSelect: (master: string) => void;
}

const MasterSelection: React.FC<MasterSelectionProps> = ({ onMasterSelect }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const masters = [
    {
      id: 'mr-fib',
      name: 'MR-FIB',
      description: 'Master de recherche en Teintures Fibres et Bois',
      color: 'from-blue-500 to-blue-600',
      icon: '🪵'
    },
    {
      id: 'mr-ip',
      name: 'MR-IP',
      description: 'Master de Recherche en Ingénierie Pédagogique',
      color: 'from-green-500 to-green-600',
      icon: '🧑‍🏫'
    },
    {
      id: 'mr-mhrt',
      name: 'MR-MHRT',
      description: "Master de Recherche en Management de l'Hôtellerie, de la Restauration et du Tourisme",
      color: 'from-purple-500 to-purple-600',
      icon: '🏨'
    },
    {
      id: 'mr-mrtddeftp',
      name: 'MR-MRTDDEFTP',
      description: 'Master de Recherche en Technopédagogie et Didactique des Disciplines de l\'Enseignementde de la Formation Technique et Professionnel',
      color: 'from-slate-700 to-slate-800',
      icon: '📖'
    }
  ];

  const menuItems = [
    {
      icon: <GraduationCap className="w-5 h-5" />,
      label: 'Formations spéciales',
      href: '#special-formations',
      description: 'Programmes de formation personnalisés'
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      label: 'Événements',
      href: '#events',
      description: 'Conférences, séminaires et rencontres'
    },
    {
      icon: <Info className="w-5 h-5" />,
      label: 'À propos',
      href: '#about',
      description: 'En savoir plus sur ENSET-MASTERS'
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      label: 'Programmes',
      href: '#programs',
      description: 'Découvrir nos formations'
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: 'Équipe',
      href: '#team',
      description: 'Notre équipe pédagogique'
    },
    {
      icon: <Globe className="w-5 h-5" />,
      label: 'Campus',
      href: '#campus',
      description: 'Visiter notre campus'
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: 'Services',
      href: '#services',
      description: 'Nos services étudiants'
    }
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 relative">
      {/* Burger Menu Button - Fixed Position */}
      <div className="fixed top-6 right-6 z-50">
        <button
          onClick={toggleMenu}
          className="relative w-12 h-12 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 flex items-center justify-center hover:bg-white hover:shadow-xl transition-all duration-300 group"
          aria-label="Menu principal"
        >
          <div className="relative w-6 h-6">
            <span 
              className={`absolute top-1/2 left-0 w-6 h-0.5 bg-slate-700 transform transition-all duration-300 ${
                isMenuOpen ? 'rotate-45 translate-y-0' : '-translate-y-1'
              }`}
            />
            <span 
              className={`absolute top-1/2 left-0 w-6 h-0.5 bg-slate-700 transform transition-all duration-300 ${
                isMenuOpen ? 'opacity-0' : 'opacity-100'
              }`}
            />
            <span 
              className={`absolute top-1/2 left-0 w-6 h-0.5 bg-slate-700 transform transition-all duration-300 ${
                isMenuOpen ? '-rotate-45 translate-y-0' : 'translate-y-1'
              }`}
            />
          </div>
        </button>
      </div>

      {/* Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={closeMenu}
        />
      )}

      {/* Menu Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-80 max-w-[90vw] bg-white/95 backdrop-blur-md shadow-2xl border-l border-slate-200 transform transition-transform duration-300 ease-out z-50 flex flex-col ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Menu Header */}
        <div className="flex-shrink-0 p-6 border-b border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <img src="/logo-enset.png" alt="Logo ENSET" className="w-10 h-10 rounded-lg" />
            <div>
              <h2 className="font-bold text-slate-900">ENSET-MASTERS</h2>
              <p className="text-xs text-slate-500">Menu principal</p>
            </div>
          </div>
          <button
            onClick={closeMenu}
            className="absolute top-6 right-6 p-2 rounded-xl hover:bg-slate-100 transition-colors duration-200"
            aria-label="Fermer le menu"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Menu Items - Scrollable Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-3">
            {menuItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                onClick={closeMenu}
                className="group flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-all duration-200 cursor-pointer border border-transparent hover:border-slate-200"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-slate-200 transition-colors duration-200">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 group-hover:text-slate-700 transition-colors duration-200 mb-1">
                    {item.label}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Contact Section - Fixed at Bottom */}
        <div className="flex-shrink-0 p-6 border-t border-slate-200 bg-slate-50/80 backdrop-blur-sm">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Mail className="w-4 h-4 text-slate-600" />
            Contact
          </h3>
          <div className="space-y-3">
            <a 
              href="mailto:gnonlonfoun@ensetmasters.org"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-white transition-colors duration-200 group border border-transparent hover:border-slate-200"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-200">
                <Mail className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 group-hover:text-slate-700">Email</p>
                <p className="text-xs text-slate-600 truncate">gnonlonfoun@ensetmasters.org</p>
              </div>
            </a>
            <a 
              href="https://wa.me/22996113246"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-white transition-colors duration-200 group border border-transparent hover:border-slate-200"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors duration-200">
                <Phone className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 group-hover:text-slate-700">Téléphone</p>
                <p className="text-xs text-slate-600">+229 96 11 32 46</p>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <img src="/logo-enset.png" alt="Logo ENSET-MASTERS" className="object-contain w-24 h-24 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-slate-900 mb-3">
              <SplitText 
                text="ENSET-MASTERS"
                splitType="chars"
                delay={80}
                duration={0.8}
                from={{ opacity: 0, y: 50, rotationX: -90, scale: 0.8 }}
                to={{ opacity: 1, y: 0, rotationX: 0, scale: 1 }}
                ease="back.out(1.7)"
                threshold={0}
                rootMargin="0px"
                className="text-3xl font-bold text-slate-900"
              />
            </h1>
            <p className="text-slate-600 text-lg">
              Sélectionnez votre programme Master
            </p>
          </div>

          {/* Masters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {masters.map((master) => (
              <div
                key={master.id}
                onClick={() => onMasterSelect(master.id)}
                className="group cursor-pointer transform transition-all duration-300 hover:scale-[1.03] h-full"
              >
                <div className="bg-white rounded-2xl shadow-md p-5 border border-slate-200 hover:shadow-xl transition-all duration-300 h-full flex flex-col min-h-[260px] max-h-[320px] min-w-[180px] max-w-[260px] mx-auto">
                  {/* Master Icon */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${master.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform duration-300 flex-shrink-0`}>
                    <span className="text-xl">{master.icon}</span>
                  </div>

                  {/* Master Name */}
                  <h3 className="text-lg font-semibold text-slate-900 text-center mb-2 group-hover:text-slate-700 transition-colors duration-300 flex-shrink-0">
                    {master.name}
                  </h3>

                  {/* Master Description */}
                  <p className="text-slate-500 text-center text-xs leading-snug flex-grow">
                    {master.description}
                  </p>

                  {/* Selection Indicator */}
                  <div className="mt-4 flex justify-center flex-shrink-0">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${master.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <footer className="bg-white text-slate-900 py-8 mt-12 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
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
          </footer>
        </div>
      </div>
    </div>
  );
};

export default MasterSelection;