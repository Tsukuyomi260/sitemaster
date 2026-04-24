import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Tag, Newspaper, User, Globe, RefreshCw, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { getArticleBySlug, BlogArticle } from '../api';

interface ArticlePageProps {
  slug: string;
  onBack: () => void;
}

function renderContent(content: string): React.ReactNode[] {
  const lines = content.split('\n');
  const nodes: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (/^\d+\.\s+\S/.test(line) && !/^\d+\.\d+/.test(line)) {
      nodes.push(
        <h2 key={i} className="text-lg font-bold text-slate-900 mt-8 mb-3">
          {inlineFormat(line)}
        </h2>
      );
    } else if (/^\d+\.\d+\s+\S/.test(line)) {
      nodes.push(
        <h3 key={i} className="text-base font-semibold text-slate-800 mt-5 mb-2">
          {inlineFormat(line)}
        </h3>
      );
    } else if (line.trim() === '') {
      // skip blank lines
    } else {
      nodes.push(
        <p key={i} className="text-sm text-slate-700 leading-relaxed mb-3">
          {inlineFormat(line)}
        </p>
      );
    }
    i++;
  }

  return nodes;
}

function inlineFormat(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={idx}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={idx}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

const catGrad: Record<string, string> = {
  pedagogie: 'from-blue-500 to-blue-700',
  didactique: 'from-violet-500 to-violet-700',
  recherche: 'from-amber-500 to-amber-700',
  technique: 'from-cyan-500 to-cyan-700',
  autre: 'from-slate-500 to-slate-700',
};
const catBadge: Record<string, string> = {
  pedagogie: 'bg-blue-100 text-blue-700',
  didactique: 'bg-violet-100 text-violet-700',
  recherche: 'bg-amber-100 text-amber-700',
  technique: 'bg-cyan-100 text-cyan-700',
  autre: 'bg-slate-100 text-slate-700',
};
const categoryLabels: Record<string, string> = {
  pedagogie: 'Pédagogie', didactique: 'Didactique',
  recherche: 'Recherche', technique: 'Technologies', autre: 'Autre',
};

export default function ArticlePage({ slug, onBack }: ArticlePageProps) {
  const [article, setArticle] = useState<BlogArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const [showAbstractFull, setShowAbstractFull] = useState(false);

  useEffect(() => {
    setLoading(true);
    getArticleBySlug(slug)
      .then(a => setArticle(a))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex flex-col items-center justify-center gap-4 text-slate-400">
        <BookOpen className="w-10 h-10" />
        <p className="text-sm">Article introuvable</p>
        <button onClick={onBack} className="text-xs text-blue-600 hover:underline">Retour au blog</button>
      </div>
    );
  }

  const grad = catGrad[article.category] || 'from-slate-500 to-slate-700';
  const badge = catBadge[article.category] || 'bg-slate-100 text-slate-700';
  const pubDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;
  const subDate = article.submitted_at
    ? new Date(article.submitted_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;
  const modDate = article.updated_at
    ? new Date(article.updated_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  const abstract = lang === 'fr' ? article.abstract_fr : article.abstract_en;
  const keywords = lang === 'fr' ? article.keywords_fr : article.keywords_en;

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#F8F7F4]/90 backdrop-blur-md border-b border-slate-200/60">
        <div className="h-14 px-5 flex items-center justify-between max-w-4xl mx-auto">
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4" /><span>EFTP/TVET Rev'</span>
          </button>
          <div className="flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-400 font-mono">ISSN 3093-4303</span>
          </div>
          <div className="w-28" />
        </div>
      </header>

      <main className="pt-14">
        {/* Cover banner */}
        <div className="w-full h-52 relative">
          {article.cover_url
            ? <img src={article.cover_url} alt={article.title} className="w-full h-full object-cover" />
            : <div className={`w-full h-full bg-gradient-to-br ${grad} flex items-center justify-center`}>
                <Newspaper className="w-16 h-16 text-white/20" />
              </div>
          }
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-5 right-5 flex items-end gap-3">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge}`}>
              {categoryLabels[article.category] || article.category}
            </span>
            {(article.volume || article.issue_number) && (
              <span className="text-[10px] text-white/80 font-medium bg-black/30 px-2 py-0.5 rounded-full">
                {[article.volume, article.issue_number].filter(Boolean).join(' · ')}
              </span>
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-5 py-8">
          {/* Title */}
          <h1 className="text-2xl font-bold text-slate-900 leading-snug mb-4">{article.title}</h1>

          {/* Dates row */}
          <div className="flex flex-wrap gap-4 mb-6 text-[11px] text-slate-400">
            {subDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Soumis le {subDate}</span>
              </div>
            )}
            {pubDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Publié le {pubDate}</span>
              </div>
            )}
            {modDate && modDate !== pubDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Modifié le {modDate}</span>
              </div>
            )}
            <span>Open access · CC 4.0</span>
          </div>

          {/* Authors */}
          <div className="mb-6 space-y-2">
            {article.authors.map((author, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{author.name}</p>
                  {author.affiliation && <p className="text-xs text-slate-400">{author.affiliation}</p>}
                  {author.email && <p className="text-xs text-blue-500">{author.email}</p>}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 pt-6">
            {/* Abstract tabs */}
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Résumé / Abstract</span>
              <div className="ml-auto flex rounded-lg border border-slate-200 overflow-hidden">
                <button onClick={() => setLang('fr')}
                  className={`px-3 py-1 text-xs font-medium transition-colors ${lang === 'fr' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
                  FR
                </button>
                <button onClick={() => setLang('en')}
                  className={`px-3 py-1 text-xs font-medium transition-colors ${lang === 'en' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
                  EN
                </button>
              </div>
            </div>

            {abstract && (
              <div className="bg-slate-50 rounded-xl p-4 mb-4">
                <p className={`text-sm text-slate-600 leading-relaxed ${!showAbstractFull ? 'line-clamp-4' : ''}`}>
                  {abstract}
                </p>
                {abstract.length > 300 && (
                  <button onClick={() => setShowAbstractFull(v => !v)}
                    className="mt-2 flex items-center gap-1 text-xs text-blue-600 hover:underline">
                    {showAbstractFull ? <><ChevronUp className="w-3 h-3" />Réduire</> : <><ChevronDown className="w-3 h-3" />Lire la suite</>}
                  </button>
                )}
              </div>
            )}

            {keywords && keywords.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <Tag className="w-3 h-3 text-slate-400" />
                {keywords.map((kw, i) => (
                  <span key={i} className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{kw}</span>
                ))}
              </div>
            )}
          </div>

          {/* Article content */}
          {article.content && (
            <div className="border-t border-slate-200 pt-6 mt-2">
              <div className="prose-custom">
                {renderContent(article.content)}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-slate-200">
            <p className="text-[11px] text-slate-400 text-center">
              EFTP/TVET Rev' — ISSN 3093-4303 — Revue pluridisciplinaire de l'ENSET-MASTERS — Open access CC 4.0
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
