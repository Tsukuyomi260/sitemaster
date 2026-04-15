import React, { useState } from 'react';
import { ArrowLeft, ShoppingCart, ShoppingBag, BookOpen, X, Plus, Minus, Check } from 'lucide-react';
import ClickSpark from './ClickSpark';

interface ShopPageProps {
  onBack: () => void;
}

interface Book {
  id: number;
  title: string;
  author: string;
  description: string;
  price: number;
  category: 'pedagogie' | 'didactique' | 'recherche' | 'technique';
  pages?: number;
  edition?: string;
  badge?: string;
  inStock: boolean;
  color: string;
}

const books: Book[] = [
  {
    id: 1,
    title: "Technopédagogie et formation à distance",
    author: "Gnonlonfoun J.M.",
    description: "Fondements théoriques et pratiques de l'intégration des technologies dans l'enseignement technique et professionnel.",
    price: 8500,
    category: 'pedagogie',
    pages: 320,
    edition: '2e éd. 2023',
    badge: 'Bestseller',
    inStock: true,
    color: 'from-blue-500 to-blue-700',
  },
  {
    id: 2,
    title: "Didactique des disciplines de l'EFTP",
    author: "Adjahouinou D.C.",
    description: "Méthodes et approches didactiques spécifiques à l'enseignement technique et professionnel en Afrique subsaharienne.",
    price: 7200,
    category: 'didactique',
    pages: 280,
    edition: '1re éd. 2022',
    inStock: true,
    color: 'from-violet-500 to-violet-700',
  },
  {
    id: 3,
    title: "Ingénierie de la formation professionnelle",
    author: "Houngnibo A.",
    description: "Concevoir, piloter et évaluer des dispositifs de formation professionnelle dans les contextes francophones.",
    price: 9000,
    category: 'pedagogie',
    pages: 360,
    edition: '1re éd. 2023',
    inStock: true,
    color: 'from-emerald-500 to-emerald-700',
  },
  {
    id: 4,
    title: "Méthodes de recherche en sciences de l'éducation",
    author: "Azonhe H.T., Keke C.N.",
    description: "Guide méthodologique pour la rédaction de mémoires et thèses en sciences de l'éducation et formation.",
    price: 6500,
    category: 'recherche',
    pages: 240,
    edition: '3e éd. 2024',
    badge: 'Nouveau',
    inStock: true,
    color: 'from-amber-500 to-amber-700',
  },
  {
    id: 5,
    title: "Évaluation des apprentissages en EFTP",
    author: "Balogoun C.",
    description: "Outils et stratégies d'évaluation adaptés aux formations techniques et professionnelles : évaluation formative, certificative et par compétences.",
    price: 7500,
    category: 'didactique',
    pages: 260,
    edition: '1re éd. 2022',
    inStock: true,
    color: 'from-rose-500 to-rose-700',
  },
  {
    id: 6,
    title: "Numérique éducatif et e-learning",
    author: "Dossou-Yovo A.",
    description: "Conception de contenus numériques pédagogiques, LMS, classes virtuelles et outils de collaboration pour l'enseignement supérieur.",
    price: 8000,
    category: 'technique',
    pages: 310,
    edition: '2e éd. 2024',
    badge: 'Nouveau',
    inStock: true,
    color: 'from-cyan-500 to-cyan-700',
  },
  {
    id: 7,
    title: "Curriculum et programmes de formation",
    author: "Fagnisse S.",
    description: "Élaboration et révision des curricula de formation professionnelle selon l'approche par compétences (APC).",
    price: 7000,
    category: 'pedagogie',
    pages: 295,
    edition: '1re éd. 2021',
    inStock: false,
    color: 'from-slate-500 to-slate-700',
  },
  {
    id: 8,
    title: "Sciences biologiques et enseignement technique",
    author: "Agbangla C.",
    description: "Transposition didactique des sciences biologiques dans les filières techniques et professionnelles.",
    price: 6800,
    category: 'didactique',
    pages: 220,
    edition: '1re éd. 2023',
    inStock: true,
    color: 'from-teal-500 to-teal-700',
  },
];

const categoryLabels: Record<string, string> = {
  tous: 'Tous',
  pedagogie: 'Pédagogie',
  didactique: 'Didactique',
  recherche: 'Recherche',
  technique: 'Numérique',
};

const ShopPage: React.FC<ShopPageProps> = ({ onBack }) => {
  const [activeCategory, setActiveCategory] = useState<'tous' | 'pedagogie' | 'didactique' | 'recherche' | 'technique'>('tous');
  const [cart, setCart] = useState<Record<number, number>>({});
  const [showCart, setShowCart] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const filtered = activeCategory === 'tous'
    ? books
    : books.filter(b => b.category === activeCategory);

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const b = books.find(b => b.id === Number(id));
    return sum + (b?.price || 0) * qty;
  }, 0);

  const addToCart = (id: number) => setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  const removeFromCart = (id: number) => setCart(prev => {
    const next = { ...prev };
    if (next[id] > 1) next[id]--;
    else delete next[id];
    return next;
  });

  const handleOrder = () => {
    setOrderPlaced(true);
    setCart({});
    setTimeout(() => { setOrderPlaced(false); setShowCart(false); }, 3500);
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#F8F7F4]/90 backdrop-blur-md border-b border-slate-200/60">
        <div className="h-14 px-5 flex items-center justify-between max-w-5xl mx-auto">
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </button>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-slate-700" />
            <span className="font-bold text-slate-800 text-sm">Notre e-boutique</span>
          </div>
          <ClickSpark sparkColor="#3b82f6" sparkSize={5} sparkRadius={14} sparkCount={7}>
            <button
              onClick={() => setShowCart(true)}
              className="relative flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-slate-700 transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Panier</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-blue-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </ClickSpark>
        </div>
      </header>

      {/* Cart Drawer */}
      {showCart && (
        <>
          <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-50" onClick={() => setShowCart(false)} />
          <div className="fixed top-0 right-0 h-full w-80 bg-white border-l border-slate-200 shadow-xl z-50 flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-800">Mon panier</h2>
              <button onClick={() => setShowCart(false)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {orderPlaced ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="w-7 h-7 text-green-600" />
                </div>
                <p className="font-semibold text-slate-800">Commande enregistrée !</p>
                <p className="text-sm text-slate-500">L'administration vous contactera sous 24h pour organiser la remise des ouvrages.</p>
              </div>
            ) : cartCount === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400 p-6">
                <BookOpen className="w-10 h-10" />
                <p className="text-sm">Votre panier est vide</p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {Object.entries(cart).map(([id, qty]) => {
                    const b = books.find(b => b.id === Number(id))!;
                    return (
                      <div key={id} className="flex items-center gap-3">
                        <div className={`w-9 h-12 rounded bg-gradient-to-b ${b.color} flex-shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-800 leading-tight line-clamp-2">{b.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{b.price.toLocaleString('fr-FR')} FCFA</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => removeFromCart(b.id)} className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                            <Minus className="w-3 h-3 text-slate-600" />
                          </button>
                          <span className="w-5 text-center text-sm font-medium">{qty}</span>
                          <button onClick={() => addToCart(b.id)} className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                            <Plus className="w-3 h-3 text-slate-600" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="p-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Total</span>
                    <span className="font-bold text-slate-900">{cartTotal.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <ClickSpark sparkColor="#ffffff" sparkSize={5} sparkRadius={14} sparkCount={8}>
                    <button onClick={handleOrder} className="w-full bg-slate-900 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors">
                      Commander
                    </button>
                  </ClickSpark>
                  <p className="text-[10px] text-slate-400 text-center">Remise en main propre ou livraison — paiement à la réception</p>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* Content */}
      <main className="pt-14">
        <div className="max-w-5xl mx-auto px-5 pt-8 pb-16">
          <div className="mb-8">
            <p className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase mb-2">
              ENSET-MASTERS — Librairie pédagogique
            </p>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Notre e-boutique</h1>
            <p className="text-slate-500 text-sm">Ouvrages de référence rédigés par les enseignants-chercheurs du programme</p>
          </div>

          {/* Category pills */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
            {(['tous', 'pedagogie', 'didactique', 'recherche', 'technique'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {categoryLabels[cat]}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(book => (
              <div
                key={book.id}
                className={`bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col transition-shadow hover:shadow-md ${!book.inStock ? 'opacity-60' : ''}`}
              >
                {/* Couverture */}
                <div className="relative h-36 flex items-center justify-center bg-slate-50 px-6">
                  {/* Livre stylisé */}
                  <div className="relative flex items-center justify-center">
                    {/* Tranche */}
                    <div className="absolute left-0 top-0 bottom-0 w-3 bg-black/20 rounded-l" style={{transform: 'translateX(-2px)'}} />
                    {/* Couverture */}
                    <div className={`w-24 h-32 rounded-r-md bg-gradient-to-br ${book.color} shadow-lg flex flex-col items-center justify-center p-2`}>
                      <BookOpen className="w-6 h-6 text-white/80 mb-1" />
                      <span className="text-white text-[8px] font-bold text-center leading-tight line-clamp-3 opacity-90">
                        {book.title}
                      </span>
                    </div>
                  </div>
                  {book.badge && (
                    <span className="absolute top-3 right-3 bg-blue-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      {book.badge}
                    </span>
                  )}
                  {!book.inStock && (
                    <span className="absolute top-3 left-3 bg-slate-400 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      Épuisé
                    </span>
                  )}
                </div>

                {/* Infos */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-sm font-semibold text-slate-800 leading-tight mb-1">{book.title}</h3>
                  <p className="text-xs text-blue-600 font-medium mb-1">{book.author}</p>
                  <div className="flex items-center gap-2 mb-2">
                    {book.edition && <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{book.edition}</span>}
                    {book.pages && <span className="text-[10px] text-slate-400">{book.pages} pages</span>}
                  </div>
                  <p className="text-xs text-slate-400 mb-4 flex-1 leading-relaxed">{book.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">
                      {book.price.toLocaleString('fr-FR')} <span className="font-normal text-slate-400 text-xs">FCFA</span>
                    </span>
                    <ClickSpark sparkColor="#ffffff" sparkSize={4} sparkRadius={12} sparkCount={6}>
                      <button
                        onClick={() => book.inStock && addToCart(book.id)}
                        disabled={!book.inStock}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          book.inStock
                            ? 'bg-slate-900 text-white hover:bg-slate-700'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <ShoppingCart className="w-3 h-3" />
                        {cart[book.id] ? `${cart[book.id]} ajouté${cart[book.id] > 1 ? 's' : ''}` : 'Ajouter'}
                      </button>
                    </ClickSpark>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Info banner */}
          <div className="mt-10 bg-amber-50 border border-amber-100 rounded-2xl p-5 flex gap-4 items-start">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <BookOpen className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-800 mb-1">Commande & remise des ouvrages</p>
              <p className="text-xs text-amber-700 leading-relaxed">
                Passez votre commande en ligne. L'administration ENSET-MASTERS vous contactera sous 24h
                pour organiser la remise en main propre ou la livraison. Paiement à la réception — espèces ou Mobile Money.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ShopPage;
