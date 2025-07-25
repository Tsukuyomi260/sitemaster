import React from 'react';

interface AdminDashboardProps {
  adminName: string;
  onLogout: () => void;
}

export default function AdminDashboard({ adminName, onLogout }: AdminDashboardProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Bienvenue, {adminName}</h1>
        <p className="text-slate-600 mb-6">Vous êtes connecté en tant qu'administrateur.</p>
        <button onClick={onLogout} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Déconnexion</button>
      </div>
    </div>
  );
} 