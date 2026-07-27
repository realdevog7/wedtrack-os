import React, { useState } from 'react';
import { useWedding } from '../../contexts/WeddingContext';
import {
  Bell,
  Search,
  Users,
  Plus,
  Heart,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  onOpenSearch: () => void;
  onQuickAction: (action: 'guest' | 'task' | 'vendor') => void;
  onSecretAdmin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch, onQuickAction, onSecretAdmin }) => {
  const { wedding, activities } = useWedding();
  const [showNotifications, setShowNotifications] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [heartClicks, setHeartClicks] = useState(0);

  const handleHeartClick = () => {
    const nextClicks = heartClicks + 1;
    if (nextClicks >= 5) {
      setHeartClicks(0);
      window.location.hash = '#admin';
      onSecretAdmin?.();
    } else {
      setHeartClicks(nextClicks);
    }
  };

  const handleCopyShareLink = () => {
    const link = `${window.location.origin}/#rsvp-${wedding.publicShareSlug || wedding.id}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20 px-3 sm:px-6 flex items-center justify-between">
      {/* Search trigger & mobile logo */}
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={handleHeartClick}
          className="lg:hidden w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20 active:scale-95 transition-all shrink-0 cursor-pointer"
          title="WedTrack OS"
        >
          <Heart className="w-4 h-4 fill-current animate-pulse-subtle" />
        </button>
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-xs font-medium transition-all w-auto sm:w-64 border border-transparent hover:border-slate-300 dark:hover:border-slate-600"
        >
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="hidden md:inline">Search guests, tasks, vendors...</span>
          <span className="md:hidden">Search...</span>
          <kbd className="hidden sm:inline-block ml-auto text-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded font-mono text-slate-400">
            ⌘K
          </kbd>
        </button>

      </div>

      {/* Action buttons & notification center */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Quick Action dropdown */}
        <div className="relative group">
          <button className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-md shadow-rose-500/20 transition-all">
            <Plus className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Quick Add</span>
          </button>
          <div className="absolute right-0 sm:right-0 mt-1 w-48 sm:w-44 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 z-50 py-1.5 text-xs font-medium">
            <button
              onClick={() => onQuickAction('guest')}
              className="w-full text-left px-3.5 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 flex items-center gap-2"
            >
              <Users className="w-3.5 h-3.5 text-rose-500" /> Add New Guest
            </button>
            <button
              onClick={() => onQuickAction('task')}
              className="w-full text-left px-3.5 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 flex items-center gap-2"
            >
              <Clock className="w-3.5 h-3.5 text-amber-500" /> Add Timeline Task
            </button>
            <button
              onClick={() => onQuickAction('vendor')}
              className="w-full text-left px-3.5 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Add Vendor Quote
            </button>
          </div>
        </div>

        {/* Share Public Link */}
        <button
          onClick={handleCopyShareLink}
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors shrink-0"
          title="Share RSVP Portal Link"
        >
          {copiedLink ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> <span className="hidden sm:inline">Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-slate-500" /> <span className="hidden sm:inline">Share RSVP</span>
            </>
          )}
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
          </button>

          {/* Notifications Drawer */}
          {showNotifications && (
            <div className="absolute right-0 sm:right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                <h3 className="font-serif font-semibold text-sm">Activity Feed & Alerts</h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                  {activities.length} Recent
                </span>
              </div>
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1 text-xs">
                {activities.slice(0, 8).map((act) => (
                  <div key={act.id} className="flex gap-2.5 items-start">
                    <div className="w-6 h-6 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center shrink-0 mt-0.5">
                      <Heart className="w-3 h-3" />
                    </div>
                    <div>
                      <p className="text-slate-800 dark:text-slate-200 font-medium leading-snug">
                        {act.message}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                        {act.userName} • {act.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
