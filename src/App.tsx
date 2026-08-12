import React, { useState, useEffect, useMemo } from 'react';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
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
import { checkEmailWhitelist } from './utils/whitelist';
import { Search, Users, Calendar, Building2, DollarSign, ArrowRight, X, LayoutDashboard, LayoutGrid, Utensils, Send, BarChart2, Folder, Settings as SettingsIcon, Sparkles, ChevronRight, Sun, Moon, Eye } from 'lucide-react';

function AppContent() {
  const { isDark, setTheme } = useTheme();
  const { wedding, isOnboarded, completeOnboarding, logout, guests, tasks, vendors, budgetItems } = useWedding();
  const sym = getCurrencySymbol(wedding?.currency);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showMobileMore, setShowMobileMore] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRsvpPortal, setIsRsvpPortal] = useState(() => window.location.hash.startsWith('#rsvp'));
  const [isAdminPortal, setIsAdminPortal] = useState(() => {
    if (window.__ADMIN_PREVIEW_MODE__) return false;
    return window.location.hash.startsWith('#admin') ||
      window.location.search.includes('admin=true') ||
      window.location.pathname.startsWith('/admin');
  });

  useEffect(() => {
    const handleNavigationChange = () => {
      setIsRsvpPortal(window.location.hash.startsWith('#rsvp'));
      setIsAdminPortal(() => {
        if (window.__ADMIN_PREVIEW_MODE__) return false;
        return window.location.hash.startsWith('#admin') ||
          window.location.search.includes('admin=true') ||
          window.location.pathname.startsWith('/admin');
      });
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

  // Enforce whitelist check constantly, kicking user out if their access is revoked by Admin
  useEffect(() => {
    const verifyAccess = async () => {
      if (isOnboarded && wedding?.email) {
        const { allowed } = await checkEmailWhitelist(wedding.email);
        if (!allowed) {
          logout();
        }
      }
    };
    verifyAccess();
  }, [isOnboarded, wedding?.email, logout]);

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
    const validDate = data.weddingDate && !isNaN(new Date(data.weddingDate).getTime())
      ? new Date(data.weddingDate).toISOString()
      : wedding.weddingDate || new Date('2027-06-18').toISOString();

    completeOnboarding({
      partner1Name: data.partner1Name || wedding.partner1Name || 'Partner 1',
      partner2Name: data.partner2Name || wedding.partner2Name || 'Partner 2',
      email: data.email || wedding.email,
      weddingDate: validDate,
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
    <>
      {/* ADMIN PREVIEW MODE OVERLAY & BANNER */}
      {window.__ADMIN_PREVIEW_MODE__ && (
        <div className="fixed top-0 left-0 right-0 z-[99999] pointer-events-auto">
          {/* Top Warning Banner */}
          <div className="bg-amber-500 text-amber-950 font-bold text-xs md:text-sm py-2.5 px-4 shadow-lg border-b border-amber-600 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
            <span className="flex items-center gap-2">
              <Eye className="w-4 h-4 shrink-0" />
              <span>
                <strong>ADMIN PREVIEW MODE:</strong> Viewing dashboard as <span className="underline decoration-amber-600/50">{window.__ADMIN_PREVIEW_EMAIL__}</span>. Changes will not be saved.
              </span>
            </span>
            <button
              onClick={() => {
                sessionStorage.removeItem('wedtrack_admin_preview');
                window.location.hash = '#admin';
                window.location.reload();
              }}
              className="bg-amber-950 hover:bg-amber-900 text-amber-400 px-4 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shadow-sm border border-amber-800"
            >
              Exit Preview Mode
            </button>
          </div>
          {/* This invisible div covers the whole screen below the banner and blocks ALL clicks, effectively freezing the UI while allowing mouse-wheel scroll. */}
          <div className="fixed top-10 left-0 right-0 bottom-0 z-[99998] cursor-not-allowed" title="UI is frozen in Admin Preview Mode" />
        </div>
      )}

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

        {/* Mobile Art-Style Floating Glass Dock */}
        <div className="lg:hidden fixed bottom-3 left-3 right-3 z-40 bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl border border-white/60 dark:border-slate-800/80 rounded-2xl shadow-2xl shadow-slate-900/10 dark:shadow-black/50 flex items-center justify-around py-2 px-1.5 transition-all duration-300">
          {[
            { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
            { id: 'guests', label: 'Guests', icon: Users },
            { id: 'timeline', label: 'Timeline', icon: Calendar },
            { id: 'budget', label: 'Budget', icon: DollarSign },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id && !showMobileMore;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setShowMobileMore(false);
                }}
                className={`relative flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'text-white bg-gradient-to-r from-rose-500 to-pink-500 shadow-lg shadow-rose-500/30 scale-105 font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
          <button
            onClick={() => setShowMobileMore(!showMobileMore)}
            className={`relative flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all duration-300 cursor-pointer ${
              showMobileMore || !['dashboard', 'guests', 'timeline', 'budget'].includes(activeTab)
                ? 'text-white bg-gradient-to-r from-rose-500 to-pink-500 shadow-lg shadow-rose-500/30 scale-105 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/50'
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
            <span>More</span>
          </button>
        </div>

        {/* Mobile "More" Bottom Sheet Drawer */}
        {showMobileMore && (
          <div
            className="lg:hidden fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm animate-fade-in flex flex-col justify-end pb-24"
            onClick={() => setShowMobileMore(false)}
          >
            <div
              className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-t border-slate-200/80 dark:border-slate-800/80 rounded-t-3xl shadow-2xl p-5 space-y-4 max-h-[70vh] overflow-y-auto animate-slide-up"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-rose-500" />
                  <h3 className="font-serif font-bold text-base text-slate-900 dark:text-slate-100">All Planning Modules</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTheme(isDark ? 'light' : 'dark')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => setShowMobileMore(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { id: 'vendors', label: 'Vendor Hub', desc: 'Quotes & Contacts', icon: Building2, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200/50' },
                  { id: 'seating', label: 'Table Seating', desc: 'Floor Planner', icon: LayoutGrid, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/50' },
                  { id: 'meals', label: 'Meal Menus', desc: 'Dietary Tracker', icon: Utensils, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200/50' },
                  { id: 'automation', label: 'Email Blasts', desc: 'RSVP Reminders', icon: Send, color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/40 border-sky-200/50' },
                  { id: 'analytics', label: 'Analytics', desc: 'Reports & Charts', icon: BarChart2, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40 border-purple-200/50' },
                  { id: 'files', label: 'File Vault', desc: 'Contracts & Docs', icon: Folder, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200/50' },
                  { id: 'settings', label: 'Settings', desc: 'Security & Currency', icon: SettingsIcon, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-200/50' },
                ].map((mod) => {
                  const ModIcon = mod.icon;
                  const isModActive = activeTab === mod.id;
                  return (
                    <button
                      key={mod.id}
                      onClick={() => {
                        setActiveTab(mod.id);
                        setShowMobileMore(false);
                      }}
                      className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                        isModActive
                          ? 'border-rose-500 bg-rose-500/10 dark:bg-rose-500/20 shadow-md ring-2 ring-rose-500/20'
                          : 'border-slate-200/70 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${mod.color}`}>
                        <ModIcon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">{mod.label}</div>
                        <div className="text-[10px] text-slate-400 truncate">{mod.desc}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto pb-28 lg:pb-0">
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
    </>
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
