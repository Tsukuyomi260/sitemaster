# 🏦 ENSET-MASTERS

> **Plateforme de gestion pédagogique pour les Masters de l'ENSET — réunissant étudiants, enseignants et administrateurs dans une seule interface intuitive**

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=flat&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-06B6D4?style=flat&logo=tailwindcss)

## 🎯 Le problème

Les Masters de l'ENSET manquaient d'une plateforme centralisée pour gérer les cours, les devoirs et les évaluations. Les enseignants dispersaient les ressources par mail et SMS, les étudiants n'avaient pas de vue claire sur leurs progressions, et les administrateurs n'avaient aucune visibilité sur l'effectif pédagogique. **ENSET-MASTERS** unifie ces trois univers dans une application web moderne et sécurisée.

## ✨ Fonctionnalités clés

- 👥 **3 rôles distincts** — Student, Teacher, Admin avec dashboards et permissions spécifiques
- 📚 **Gestion des Masters** — Sélection de master et navigation par code d'accès
- 📊 **Dashboard temps réel** — Vue d'ensemble des cours, devoirs, notes et présences
- 🔐 **Authentification sécurisée** — Email/password via Supabase Auth + RLS PostgreSQL
- 📁 **Gestion de contenu** — Blog, articles, ressources pédagogiques
- ✨ **Animations fluides** — Framer Motion + GSAP pour UX premium
- 📱 **Responsive design** — Mobile, tablette, desktop
- 📦 **Export de données** — Téléchargement de devoirs et documents

## 🚀 Stack technique

**Frontend**
- React 19 · TypeScript · Tailwind CSS
- Framer Motion · GSAP · Lucide Icons
- React Scripts (CRA)

**Backend**
- Supabase (PostgreSQL + Auth + RLS)
- Row Level Security pour isolation par rôle

**Infra**
- Vercel (frontend)
- Supabase Hosting

## 🏗️ Architecture

```
ENSET-MASTERS/
├── src/
│   ├── components/
│   │   ├── MasterSelection.tsx          # Sélection du master
│   │   ├── LoginInterface.tsx           # Authentification
│   │   ├── RoleSelection.tsx            # Choix du rôle (si multi-rôle)
│   │   ├── StudentDashboard.tsx         # Tableau de bord étudiant
│   │   ├── TeacherDashboard.tsx         # Tableau de bord enseignant
│   │   └── AdminDashboard.tsx           # Tableau de bord administrateur
│   ├── App.tsx                          # Routeur principal
│   └── index.tsx
└── package.json
```

**Flux de navigation** : MasterSelection → LoginInterface → RoleSelection (optionnel) → Dashboard

## 💡 Décisions techniques notables

- **Supabase RLS** — Chaque rôle ne voit que ses données grâce à PostgreSQL policies, pas d'auth côté client
- **Master selection en amont** — Permet une isolation par école/programme ; extensible pour multi-site
- **Animations natives** — Framer Motion + GSAP pour une UX fluide sans impacter la performance
- **Create React App** — Simplicité de déploiement et intégration facile avec Vercel

## 📦 Installation locale

```bash
git clone https://github.com/modulororg/enset-masters.git
cd enset-masters

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Remplir : REACT_APP_SUPABASE_URL, REACT_APP_SUPABASE_ANON_KEY

# Démarrer en développement
npm start        # Frontend sur http://localhost:3000

# Build pour production
npm run build
```

## 🔐 Sécurité & Données

- **Row Level Security (RLS)** — Chaque utilisateur ne voit que ses données et celles accessibles par rôle
- **Authentification Supabase** — Tokens JWT, sessions sécurisées
- **.env sécurisé** — Variables sensibles jamais commitées (cf. `.gitignore`)

## 👥 Rôles & Permissions

| Rôle | Accès | Permissions |
|------|-------|-------------|
| **Student** | Mes cours, mes devoirs, mes notes | Consulter, soumettre travaux |
| **Teacher** | Classe(s), édition contenu, notations | Créer cours, noter, consulter présences |
| **Admin** | Toute la plateforme | Gestion users, stats, rapports |

## 📬 Contact

**Développé pour l'ENSET** — Bénin

Pour toute question : [modulororg@gmail.com](mailto:modulororg@gmail.com)
