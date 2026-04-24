import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Search, RefreshCw, Calendar, Tag, Newspaper } from 'lucide-react';
import { getPublishedArticles, BlogArticle } from '../api';

interface BlogPageProps {
  onBack: () => void;
  onReadArticle: (slug: string) => void;
}

const categoryLabels: Record<string, string> = {
  tous: 'Tous', pedagogie: 'Pédagogie', didactique: 'Didactique',
  recherche: 'Recherche', technique: 'Technologies', autre: 'Autre',
};
const catBadge: Record<string, string> = {
  pedagogie: 'bg-blue-100 text-blue-700', didactique: 'bg-violet-100 text-violet-700',
  recherche: 'bg-amber-100 text-amber-700', technique: 'bg-cyan-100 text-cyan-700',
  autre: 'bg-slate-100 text-slate-700',
};
const catGrad: Record<string, string> = {
  pedagogie: 'from-blue-500 to-blue-700', didactique: 'from-violet-500 to-violet-700',
  recherche: 'from-amber-500 to-amber-700', technique: 'from-cyan-500 to-cyan-700',
  autre: 'from-slate-500 to-slate-700',
};

export default function BlogPage({ onBack, onReadArticle }: BlogPageProps) {
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('tous');

  useEffect(() => {
    getPublishedArticles().then(d => setArticles(d || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = articles.filter(a => {
    const mc = cat === 'tous' || a.category === cat;
    const ms = !search || a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.authors.some(au => au.name.toLowerCase().includes(search.toLowerCase()));
    return mc && ms;
  });

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#F8F7F4]/90 backdrop-blur-md border-b border-slate-200/60">
        <div className="h-14 px-5 flex items-center justify-between max-w-5xl mx-auto">
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4" /><span>Retour</span>
          </button>
          <div className="flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-slate-700" />
            <span className="font-bold text-slate-800 text-sm">EFTP/TVET Rev'</span>
          </div>
          <div className="w-16" />
        </div>
      </header>

      <main className="pt-14">
        <div className="max-w-5xl mx-auto px-5 pt-8 pb-16">
          <div className="mb-8">
            <p className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase mb-2">
              ENSET-MASTERS — Publications scientifiques
            </p>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">EFTP/TVET Rev'</h1>
            <p className="text-slate-500 text-sm">Revue pluridisciplinaire semestrielle des sciences, technologies, ingénierie et humanités</p>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-mono">ISSN 3093-4303</span>
              <span className="text-[11px] text-slate-400">Open access · Licence CC 4.0</span>
            </div>
          </div>

          <div className="relative mb-5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Rechercher par titre ou auteur..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
            {(['tous', 'pedagogie', 'didactique', 'recherche', 'technique', 'autre'] as const).map(c => (
              <button key={c} onClick={() => setCat(c)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${cat === c ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                {categoryLabels[c]}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24"><RefreshCw className="w-6 h-6 animate-spin text-slate-400" /></div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20 text-slate-400">
              <BookOpen className="w-10 h-10" />
              <p className="text-sm">{search ? 'Aucun résultat' : 'Aucun article publié pour le moment'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filtered.map(article => {
                const grad = catGrad[article.category] || 'from-slate-500 to-slate-700';
                const badge = catBadge[article.category] || 'bg-slate-100 text-slate-700';
                const date = article.published_at
                  ? new Date(article.published_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })
                  : '';
                return (
                  <article key={article.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-all flex flex-col group cursor-pointer"
                    onClick={() => onReadArticle(article.slug)}>
                    <div className="h-36 relative flex-shrink-0">
                      {article.cover_url
                        ? <img src={article.cover_url} alt={article.title} className="w-full h-full object-cover" />
                        : <div className={`w-full h-full bg-gradient-to-br ${grad} flex items-center justify-center`}><Newspaper className="w-10 h-10 text-white/30" /></div>
                      }
                      <span className={`absolute top-3 left-3 text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge}`}>
                        {categoryLabels[article.category] || article.category}
                      </span>
                      {(article.volume || article.issue_number) && (
                        <span className="absolute top-3 right-3 bg-black/50 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                          {[article.volume, article.issue_number].filter(Boolean).join(' · ')}
                        </span>
                      )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="text-sm font-bold text-slate-900 leading-snug mb-1.5 line-clamp-2 group-hover:text-blue-700 transition-colors">{article.title}</h3>
                      <p className="text-xs text-blue-600 font-medium mb-2">
                        {article.authors.map(a => a.name).join(' · ')}
                      </p>
                      {article.abstract_fr && (
                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 flex-1">{article.abstract_fr}</p>
                      )}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-3">
                          {date && (
                            <div className="flex items-center gap-1 text-[10px] text-slate-400">
                              <Calendar className="w-3 h-3" /><span>{date}</span>
                            </div>
                          )}
                          {article.keywords_fr && article.keywords_fr.length > 0 && (
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 hidden sm:flex">
                              <Tag className="w-3 h-3" />
                              <span className="line-clamp-1">{article.keywords_fr.slice(0, 2).join(', ')}</span>
                            </div>
                          )}
                        </div>
                        <span className="text-xs font-semibold text-slate-500 group-hover:text-blue-600 transition-colors">Lire →</span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
