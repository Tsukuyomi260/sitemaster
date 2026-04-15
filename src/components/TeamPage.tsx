import React, { useState } from 'react';
import { ArrowLeft, Mail, Phone, ChevronDown, ChevronUp } from 'lucide-react';

interface TeamPageProps {
  onBack: () => void;
}

interface Member {
  name: string;
  role: string;
  email?: string;
  phone?: string;
  speciality?: string;
  avatar: string;
}

interface Department {
  name: string;
  color: string;
  bgColor: string;
  borderColor: string;
  members: Member[];
}

const direction: Member = {
  name: 'Dr. GNONLONFOUN Jean Marc',
  role: 'Directeur du programme',
  email: 'gnonlonfoun@ensetmasters.org',
  phone: '+229 01 97 56 58 71',
  speciality: 'Technopédagogie & EFTP',
  avatar: 'GJ',
};

const departments: Department[] = [
  {
    name: 'Coordination pédagogique',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    members: [
      { name: 'Prof. ADJAHOUINOU Dodji C.', role: 'Coordonnateur pédagogique', speciality: 'Didactique des sciences techniques', avatar: 'AD' },
      { name: 'Dr. HOUNGNIBO Alphonse', role: 'Responsable des stages', speciality: 'Formation professionnelle', avatar: 'HA' },
    ],
  },
  {
    name: 'Corps enseignant',
    color: 'text-violet-700',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    members: [
      { name: 'Prof. AZONHE Hilaire T.', role: 'Enseignant-chercheur', speciality: 'Technologies éducatives', avatar: 'AH' },
      { name: 'Dr. BALOGOUN Cossi', role: 'Enseignant-chercheur', speciality: 'Ingénierie de formation', avatar: 'BC' },
      { name: 'Dr. AGBANGLA Clément', role: 'Enseignant-chercheur', speciality: 'Sciences biologiques & EFTP', avatar: 'AC' },
      { name: 'Prof. DOSSOU-YOVO Ange', role: 'Enseignant-chercheur', speciality: 'Informatique pédagogique', avatar: 'DA' },
      { name: 'Dr. FAGNISSE Souléïmane', role: 'Enseignant-chercheur', speciality: 'Recherche en éducation', avatar: 'FS' },
      { name: 'Dr. KEKE Cossi Narcisse', role: 'Enseignant-chercheur', speciality: 'Sciences de l\'éducation', avatar: 'KC' },
    ],
  },
  {
    name: 'Administration & Scolarité',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    members: [
      { name: 'Mme ZANNOU Rosine', role: 'Responsable scolarité', speciality: 'Gestion administrative', avatar: 'ZR' },
      { name: 'M. AHOUNOU Brice', role: 'Secrétaire pédagogique', speciality: 'Suivi des étudiants', avatar: 'AB' },
    ],
  },
  {
    name: 'Support technique & Numérique',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    members: [
      { name: 'M. GBEDO Ulrich', role: 'Responsable informatique', speciality: 'Infrastructure & e-learning', avatar: 'GU' },
      { name: 'Mme ASSOGBA Nadia', role: 'Technicienne numérique', speciality: 'Plateforme & outils digitaux', avatar: 'AN' },
    ],
  },
];

const Avatar: React.FC<{ initials: string; bgClass: string }> = ({ initials, bgClass }) => (
  <div className={`w-10 h-10 rounded-full ${bgClass} flex items-center justify-center text-sm font-bold flex-shrink-0`}>
    {initials}
  </div>
);

const TeamPage: React.FC<TeamPageProps> = ({ onBack }) => {
  const [expandedDepts, setExpandedDepts] = useState<Set<number>>(new Set([0, 1, 2, 3]));

  const toggle = (i: number) => {
    setExpandedDepts(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#F8F7F4]/90 backdrop-blur-md border-b border-slate-200/60">
        <div className="h-14 px-5 flex items-center justify-between max-w-4xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </button>
          <span className="font-bold text-slate-800 text-sm">Notre équipe</span>
          <div className="w-16" />
        </div>
      </header>

      <main className="pt-14">
        <div className="max-w-4xl mx-auto px-5 pt-8 pb-16">

          {/* Hero */}
          <div className="mb-10">
            <p className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase mb-2">
              ENSET-MASTERS — Corps enseignant & administration
            </p>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Notre équipe</h1>
            <p className="text-slate-500 text-sm">Les personnes qui font vivre le programme MR-MRTDDEFTP</p>
          </div>

          {/* Direction — nœud racine */}
          <div className="flex flex-col items-center mb-10">
            <div className="bg-slate-900 text-white rounded-2xl p-5 w-full max-w-sm shadow-lg">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-base font-bold flex-shrink-0">
                  GJ
                </div>
                <div>
                  <p className="font-bold text-sm leading-tight">{direction.name}</p>
                  <p className="text-slate-300 text-xs mt-0.5">{direction.role}</p>
                </div>
              </div>
              {direction.speciality && (
                <p className="text-slate-400 text-xs mb-3">{direction.speciality}</p>
              )}
              <div className="flex flex-col gap-1.5">
                {direction.email && (
                  <a href={`mailto:${direction.email}`} className="flex items-center gap-2 text-xs text-slate-300 hover:text-white transition-colors">
                    <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                    {direction.email}
                  </a>
                )}
                {direction.phone && (
                  <a href={`tel:${direction.phone}`} className="flex items-center gap-2 text-xs text-slate-300 hover:text-white transition-colors">
                    <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                    {direction.phone}
                  </a>
                )}
              </div>
            </div>

            {/* Ligne verticale */}
            <div className="w-px h-8 bg-slate-300" />
            <div className="w-3 h-3 rounded-full bg-slate-300" />
          </div>

          {/* Branches horizontales */}
          <div className="relative">
            {/* Ligne horizontale reliant les départements */}
            <div className="hidden md:block absolute top-0 left-[12.5%] right-[12.5%] h-px bg-slate-200" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {departments.map((dept, i) => (
                <div key={i} className="relative">
                  {/* Ligne verticale vers le haut (desktop) */}
                  <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-px h-4 bg-slate-200" />

                  <div className={`mt-0 md:mt-4 border ${dept.borderColor} rounded-2xl overflow-hidden`}>
                    {/* Header département */}
                    <button
                      onClick={() => toggle(i)}
                      className={`w-full flex items-center justify-between px-4 py-3 ${dept.bgColor} transition-colors`}
                    >
                      <span className={`text-sm font-semibold ${dept.color}`}>{dept.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium ${dept.color} opacity-60`}>{dept.members.length} membre{dept.members.length > 1 ? 's' : ''}</span>
                        {expandedDepts.has(i)
                          ? <ChevronUp className={`w-4 h-4 ${dept.color} opacity-60`} />
                          : <ChevronDown className={`w-4 h-4 ${dept.color} opacity-60`} />
                        }
                      </div>
                    </button>

                    {/* Membres */}
                    {expandedDepts.has(i) && (
                      <div className="bg-white divide-y divide-slate-50">
                        {dept.members.map((member, j) => (
                          <div key={j} className="flex items-start gap-3 px-4 py-3">
                            <Avatar
                              initials={member.avatar}
                              bgClass={`${dept.bgColor} ${dept.color}`}
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-800 leading-tight">{member.name}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{member.role}</p>
                              {member.speciality && (
                                <p className="text-xs text-slate-400 mt-0.5 italic">{member.speciality}</p>
                              )}
                              {member.email && (
                                <a href={`mailto:${member.email}`} className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 mt-1 transition-colors">
                                  <Mail className="w-3 h-3" />
                                  {member.email}
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Note */}
          <p className="mt-10 text-center text-xs text-slate-400">
            Les noms indiqués sont des exemples — remplacez-les avec les vrais membres de l'équipe.
          </p>
        </div>
      </main>
    </div>
  );
};

export default TeamPage;
