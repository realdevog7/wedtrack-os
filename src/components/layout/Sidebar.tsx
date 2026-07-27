import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useWedding } from '../../contexts/WeddingContext';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Grid2X2,
  Briefcase,
  PiggyBank,
  Send,
  BarChart3,
  FolderKanban,
  Settings,
  Heart,
  Moon,
  Sun,
  Sparkles,
  ShieldCheck,
  Utensils,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { isDark, setTheme, theme } = useTheme();
  const { wedding } = useWedding();
  const [heartClicks, setHeartClicks] = useState(0);

  const handleHeartClick = () => {
    const nextClicks = heartClicks + 1;
    if (nextClicks >= 5) {
      setHeartClicks(0);
      window.location.hash = '#admin';
    } else {
      setHeartClicks(nextClicks);
    }
  };

  // Calculate days remaining to wedding
  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(wedding.weddingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )
  );

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'timeline', label: 'Timeline & Calendar', icon: CalendarDays },
    { id: 'guests', label: 'Guest Management', icon: Users },
    { id: 'meals', label: 'Meal & Dietary Menu', icon: Utensils },
    { id: 'seating', label: 'Automated Seating', icon: Grid2X2 },
    { id: 'vendors', label: 'Vendor Hub', icon: Briefcase },
    { id: 'budget', label: 'Budget Tracker', icon: PiggyBank },
    { id: 'automation', label: 'Automation & Email', icon: Send },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 },
    { id: 'files', label: 'File Manager', icon: FolderKanban },
    { id: 'settings', label: 'Settings & Security', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex flex-col h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-3">
        <button
          onClick={handleHeartClick}
          className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title="WedTrack OS"
        >
          <Heart className="w-5 h-5 fill-current animate-pulse-subtle" />
        </button>
        <div>
          <h1 className="font-serif font-bold text-xl leading-tight bg-gradient-to-r from-rose-600 via-pink-600 to-rose-400 dark:from-rose-400 dark:to-pink-400 bg-clip-text text-transparent">
            WedTrack OS
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide uppercase">Planning Suite</p>
        </div>
      </div>

      {/* Countdown Card */}
      <div className="px-4 pt-4">
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/40 dark:to-pink-950/20 border border-rose-100 dark:border-rose-900/40 text-rose-900 dark:text-rose-200">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-1">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Countdown
            </span>
            <span>{daysLeft} Days</span>
          </div>
          <p className="text-sm font-serif font-semibold truncate">
            {wedding.partner1Name} & {wedding.partner2Name}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {new Date(wedding.weddingDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Theme Toggle */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>Appearance</span>
        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors"
        >
          {isDark ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" /> Light
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-slate-600" /> Dark
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
