import React, { useState, useEffect, useMemo } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { WeddingProvider, useWedding } from './contexts/WeddingContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './pages/Dashboard';
import { Timeline } from './pages/Timeline';
import { Guests } from './pages/Guests';
import { Seating } from './pages/Seating';
import { Vendors } from './pages/Vendors';
import { Budget } from './pages/Budget';
import { Automation } from './pages/Automation';
import { Analytics } from './pages/Analytics';
import { Files } from './pages/Files';
import { Settings } from './pages/Settings';
import { AdminPortal } from './pages/AdminPortal';
import { Onboarding, OnboardingData } from './pages/Onboarding';
import { PublicRsvp } from './pages/PublicRsvp';
import { getCurrencySymbol } from './utils/currency';
import { Search, Users, Calendar, Building2, DollarSign, ArrowRight, X } from 'lucide-react';

function AppContent() {
  const { wedding, isOnboarded, completeOnboarding, guests, tasks, vendors, budgetItems } = useWedding();
  const sym = getCurrencySymbol(wedding?.currency);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRsvpPortal, setIsRsvpPortal] = useState(() => window.location.hash.startsWith('#rsvp'));
  const [isAdminPortal, setIsAdminPortal] = useState(() =>
    window.location.hash.startsWith('#admin') ||
    window.location.search.includes('admin=true') ||
    window.location.pathname.startsWith('/admin')
  );

  useEffect(() => {
    const handleNavigationChange = () => {
      setIsRsvpPortal(window.location.hash.startsWith('#rsvp'));
      setIsAdminPortal(
        window.location.hash.startsWith('#admin') ||
        window.location.search.includes('admin=true') ||
        window.location.pathname.startsWith('/admin')
      );
    };
    window.addEventListener('hashchange', handleNavigationChange);
    window.addEventListener('popstate', handleNavigationChange);
    return () => {
      window.removeEventListener('hashchange', handleNavigationChange);
      window.removeEventListener('popstate', handleNavigationChange);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSearch(false);
        setSearchQuery('');
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { guests: [], tasks: [], vendors: [], budget: [] };
    const q = searchQuery.toLowerCase().trim();

    return {
      guests: (guests || []).filter(
        (g) =>
          (g.firstName && g.firstName.toLowerCase().includes(q)) ||
          (g.lastName && g.lastName.toLowerCase().includes(q)) ||
          (g.email && g.email.toLowerCase().includes(q)) ||
          (g.groupCategory && g.groupCategory.toLowerCase().includes(q))
      ).slice(0, 5),
      tasks: (tasks || []).filter(
        (t) =>
          (t.title && t.title.toLowerCase().includes(q)) ||
          (t.category && t.category.toLowerCase().includes(q)) ||
          (t.description && t.description.toLowerCase().includes(q))
      ).slice(0, 5),
      vendors: (vendors || []).filter(
        (v) =>
          (v.name && v.name.toLowerCase().includes(q)) ||
          (v.category && v.category.toLowerCase().includes(q)) ||
          (v.contactPerson && v.contactPerson.toLowerCase().includes(q))
      ).slice(0, 5),
      budget: (budgetItems || []).filter(
        (b) =>
          (b.description && b.description.toLowerCase().includes(q)) ||
          (b.category && b.category.toLowerCase().includes(q)) ||
          (b.notes && b.notes.toLowerCase().includes(q))
      ).slice(0, 5),
    };
  }, [searchQuery, guests, tasks, vendors, budgetItems]);

  const totalResults =
    searchResults.guests.length +
    searchResults.tasks.length +
    searchResults.vendors.length +
    searchResults.budget.length;

  const handleSelectResult = (tab: string) => {
    setActiveTab(tab);
    setShowSearch(false);
    setSearchQuery('');
  };

  const handleOnboardingComplete = (data: OnboardingData) => {
    completeOnboarding({
      partner1Name: data.partner1Name,
      partner2Name: data.partner2Name,
      email: data.email,
      weddingDate: new Date(data.weddingDate).toISOString(),
      venueName: data.venueName || 'TBD',
      venueAddress: data.venueAddress || '',
      totalBudget: data.totalBudget,
      weddingType: data.weddingType as any,
      weddingStyle: data.weddingStyle as any,
      venueType: data.venueType as any,
      season: data.season as any,
      estimatedGuests: data.estimatedGuests,
      budgetPriorities: data.budgetPriorities,
      budgetFlexibility: data.budgetFlexibility as any,
      collaborators: [
        { uid: 'user-owner', email: data.email, name: data.partner1Name, role: 'Owner', isOnline: true },
        ...data.collaborators.map((c, i) => ({
          uid: `user-collab-${i}`,
          email: c.email,
          name: c.name,
          role: c.role as any,
          isOnline: false,
        })),
      ],
      publicShareSlug: `${data.partner1Name.toLowerCase().replace(/\s+/g, '-')}-and-${data.partner2Name.toLowerCase().replace(/\s+/g, '-')}`,
    });
  };

  if (isRsvpPortal) {
    return (
      <PublicRsvp
        onExit={() => {
          window.location.hash = '';
          setIsRsvpPortal(false);
        }}
      />
    );
  }

  if (isAdminPortal) {
    return (
      <AdminPortal
        onExit={() => {
          window.location.hash = '';
          if (window.location.search.includes('admin=true')) {
            const url = new URL(window.location.href);
            url.searchParams.delete('admin');
            window.history.replaceState({}, '', url.pathname + url.search + url.hash);
          }
          if (window.location.pathname.startsWith('/admin')) {
            window.history.replaceState({}, '', '/');
          }
          setIsAdminPortal(false);
        }}
      />
    );
  }

  // Show onboarding wizard if not yet completed
  if (!isOnboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // Quick-add handlers navigate to the relevant page
  const handleQuickAction = (action: 'guest' | 'task' | 'vendor') => {
    if (action === 'guest') setActiveTab('guests');
    else if (action === 'task') setActiveTab('timeline');
    else if (action === 'vendor') setActiveTab('vendors');
  };

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} onQuickAdd={handleQuickAction} />;
      case 'timeline':
        return <Timeline />;
      case 'guests':
        return <Guests setActiveTab={setActiveTab} defaultTab="list" />;
      case 'meals':
        return <Guests setActiveTab={setActiveTab} defaultTab="meals" />;
      case 'seating':
        return <Seating />;
      case 'vendors':
        return <Vendors />;
      case 'budget':
        return <Budget />;
      case 'automation':
        return <Automation />;
      case 'analytics':
        return <Analytics />;
      case 'files':
        return <Files />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard setActiveTab={setActiveTab} onQuickAdd={handleQuickAction} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onOpenSearch={() => setShowSearch(true)}
          onQuickAction={handleQuickAction}
          onSecretAdmin={() => setActiveTab('admin')}
        />

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex items-center justify-around py-2 px-1 overflow-x-auto scrollbar-none">
          {[
            { id: 'dashboard', label: '🏠' },
            { id: 'guests', label: '👥' },
            { id: 'timeline', label: '📅' },
            { id: 'budget', label: '💰' },
            { id: 'vendors', label: '🏢' },
            { id: 'seating', label: '🪑' },
            { id: 'settings', label: '⚙️' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl text-[11px] font-medium transition-all min-w-[3.5rem] ${
                activeTab === item.id
                  ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 font-bold'
                  : 'text-slate-500'
              }`}
            >
              <span className="text-lg">{item.label}</span>
              <span className="capitalize">{item.id === 'dashboard' ? 'Home' : item.id}</span>
            </button>
          ))}
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          {renderPage()}
        </main>
      </div>

      {/* Global Search Modal */}
      {showSearch && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-start justify-center pt-6 sm:pt-20 px-4 animate-fade-in"
          onClick={() => {
            setShowSearch(false);
            setSearchQuery('');
          }}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl mx-3 sm:mx-auto w-full px-3 sm:px-5 py-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search guests, tasks, vendors, budget items..."
                className="w-full pl-12 pr-10 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {searchQuery.trim() !== '' && (
              <div className="overflow-y-auto flex-1 space-y-4 pr-1 divide-y divide-slate-100 dark:divide-slate-800/60">
                {totalResults === 0 ? (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400 space-y-2">
                    <p className="text-sm font-semibold">No results found for "{searchQuery}"</p>
                    <p className="text-xs text-slate-400">Try searching by name, email, category, or title.</p>
                  </div>
                ) : (
                  <>
                    {searchResults.guests.length > 0 && (
                      <div className="pt-2 first:pt-0 space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-rose-500" /> Guests ({searchResults.guests.length})
                        </span>
                        {searchResults.guests.map((g) => (
                          <button
                            key={g.id}
                            onClick={() => handleSelectResult('guests')}
                            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-all text-left group"
                          >
                            <div>
                              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-rose-600 dark:group-hover:text-rose-400">
                                {g.firstName} {g.lastName}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {g.groupCategory || 'General'} • {g.rsvpStatus} • {g.email || 'No email'}
                              </p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    )}

                    {searchResults.tasks.length > 0 && (
                      <div className="pt-2 first:pt-0 space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Tasks ({searchResults.tasks.length})
                        </span>
                        {searchResults.tasks.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => handleSelectResult('timeline')}
                            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-all text-left group"
                          >
                            <div>
                              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                {t.title}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {t.category} • Due: {t.dueDate || 'No date'}
                              </p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    )}

                    {searchResults.vendors.length > 0 && (
                      <div className="pt-2 first:pt-0 space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-amber-500" /> Vendors ({searchResults.vendors.length})
                        </span>
                        {searchResults.vendors.map((v) => (
                          <button
                            key={v.id}
                            onClick={() => handleSelectResult('vendors')}
                            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-all text-left group"
                          >
                            <div>
                              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                                {v.name}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {v.category} • {v.contactPerson || 'No contact'}
                              </p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    )}

                    {searchResults.budget.length > 0 && (
                      <div className="pt-2 first:pt-0 space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Budget ({searchResults.budget.length})
                        </span>
                        {searchResults.budget.map((b) => (
                          <button
                            key={b.id}
                            onClick={() => handleSelectResult('budget')}
                            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-all text-left group"
                          >
                            <div>
                              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                                {b.description || 'Budget Item'}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {b.category} • {sym}{(b.allocatedAmount || 0).toLocaleString()}
                              </p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Search across your entire wedding planner</span>
              <span>
                Press <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[10px]">Esc</kbd> to close
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <WeddingProvider>
        <AppContent />
      </WeddingProvider>
    </ThemeProvider>
  );
}

export default App;
