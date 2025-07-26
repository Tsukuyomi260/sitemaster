import React from 'react';
import SplitText from './SplitText';

interface MasterSelectionProps {
  onMasterSelect: (master: string) => void;
}

const MasterSelection: React.FC<MasterSelectionProps> = ({ onMasterSelect }) => {
  const masters = [
    {
      id: 'master-a',
      name: 'Master A',
      description: 'Description du Master A',
      color: 'from-blue-500 to-blue-600',
      icon: '🎓'
    },
    {
      id: 'master-b', 
      name: 'Master B',
      description: 'Description du Master B',
      color: 'from-green-500 to-green-600',
      icon: '📚'
    },
    {
      id: 'master-c',
      name: 'Master C', 
      description: 'Description du Master C',
      color: 'from-purple-500 to-purple-600',
      icon: '🔬'
    },
    {
      id: 'mrtddeftp',
      name: 'MRTDDEFTP',
      description: 'Master de Recherche en Didactique',
      color: 'from-slate-700 to-slate-800',
      icon: '📖'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
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
              className="group cursor-pointer transform transition-all duration-300 hover:scale-105 h-full"
            >
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200 hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                {/* Master Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${master.color} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                  <span className="text-2xl">{master.icon}</span>
                </div>

                {/* Master Name */}
                <h3 className="text-xl font-bold text-slate-900 text-center mb-3 group-hover:text-slate-700 transition-colors duration-300 flex-shrink-0">
                  {master.name}
                </h3>

                {/* Master Description */}
                <p className="text-slate-600 text-center text-sm leading-relaxed flex-grow">
                  {master.description}
                </p>

                {/* Selection Indicator */}
                <div className="mt-6 flex justify-center flex-shrink-0">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${master.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-slate-500">
            Cliquez sur un programme pour accéder à votre espace
          </p>
        </div>
      </div>
    </div>
  );
};

export default MasterSelection; 