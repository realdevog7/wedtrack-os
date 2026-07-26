import React from 'react';
import { useWedding } from '../contexts/WeddingContext';
import { getDeadlineDisplay } from '../utils/dateUtils';
import {
  PiggyBank,
  Users,
  CalendarDays,
  Briefcase,
  TrendingUp,
  Sparkles,
  Clock,
  Plus,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DashboardProps {
  setActiveTab: (tab: string) => void;
  onQuickAdd: (type: 'guest' | 'task' | 'vendor') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActiveTab, onQuickAdd }) => {
  const { wedding, guests, tasks, vendors, budgetItems, activities } = useWedding();

  // 1. Budget Calculations
  const totalBudget = wedding.totalBudget;
  const totalSpent = budgetItems.reduce((sum, item) => sum + item.actualAmount, 0);
  const totalProjected = budgetItems.reduce((sum, item) => sum + Math.max(item.allocatedAmount || 0, item.actualAmount || 0), 0);
  const remainingBudget = totalBudget - totalProjected;
  const budgetSpentPercent = totalBudget > 0 ? Math.min(100, Math.round((totalProjected / totalBudget) * 100)) : 0;

  // 2. RSVP Stats
  const confirmedGuests = guests.filter((g) => g.rsvpStatus === 'confirmed').length;
  const declinedGuests = guests.filter((g) => g.rsvpStatus === 'declined').length;
  const pendingGuests = guests.filter(
    (g) => g.rsvpStatus === 'invited' || g.rsvpStatus === 'opened' || g.rsvpStatus === 'responded'
  ).length;
  const rsvpConfirmedRate = Math.round((confirmedGuests / (guests.length || 1)) * 100);

  // 3. Task Stats
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const taskProgressPercent = Math.round((completedTasks / (tasks.length || 1)) * 100);

  // 4. Vendor Pipeline Stats
  const confirmedVendors = vendors.filter((v) => v.status === 'Confirmed').length;
  const pendingVendors = vendors.filter((v) => v.status !== 'Confirmed' && v.status !== 'Cancelled').length;

  // Recharts Donut data for RSVP
  const rsvpChartData = [
    { name: 'Confirmed', value: confirmedGuests, color: '#10B981' },
    { name: 'Pending', value: pendingGuests, color: '#F59E0B' },
    { name: 'Declined', value: declinedGuests, color: '#EF4444' },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 text-white p-5 sm:p-8 shadow-xl shadow-rose-500/10">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-rose-100">
            <Sparkles className="w-3.5 h-3.5" /> Real-time Wedding Command Center
          </div>
          <h1 className="font-serif font-bold text-xl sm:text-3xl md:text-4xl">
            Welcome, {wedding.partner1Name} & {wedding.partner2Name}!
          </h1>
          <p className="text-rose-100 text-sm md:text-base max-w-2xl">
            Your special day is set for{' '}
            <span className="font-semibold text-white">
              {new Date(wedding.weddingDate).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>{' '}
            at {wedding.venueName}. Here is your real-time planning overview.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onQuickAdd('guest')}
              className="px-4 py-2 rounded-xl bg-white text-rose-700 hover:bg-rose-50 font-semibold text-xs transition-all shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Guest
            </button>
            <button
              onClick={() => onQuickAdd('task')}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs transition-all flex items-center gap-1.5"
            >
              <Clock className="w-4 h-4" /> Add Task
            </button>
            <button
              onClick={() => setActiveTab('seating')}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" /> Seating Plan
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Budget Card */}
        <div
          onClick={() => setActiveTab('budget')}
          className="glass-card rounded-2xl p-5 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 flex items-center justify-center font-semibold">
              <PiggyBank className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2.5 py-1 rounded-full">
              {budgetSpentPercent}% Spent
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Budget
            </p>
            <h3 className="font-serif font-bold text-lg sm:text-2xl mt-1 text-slate-900 dark:text-slate-100">
              ${totalProjected.toLocaleString()} / ${totalBudget.toLocaleString()}
            </h3>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-rose-500 to-pink-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${budgetSpentPercent}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex justify-between">
              <span>Remaining: ${remainingBudget.toLocaleString()}</span>
              <span className="group-hover:translate-x-1 transition-transform flex items-center gap-0.5 text-rose-600 font-semibold">
                Details <ChevronRight className="w-3 h-3" />
              </span>
            </p>
          </div>
        </div>

        {/* Guest RSVP Card */}
        <div
          onClick={() => setActiveTab('guests')}
          className="glass-card rounded-2xl p-5 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full">
              {rsvpConfirmedRate}% Confirmed
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Guest RSVPs
            </p>
            <h3 className="font-serif font-bold text-lg sm:text-2xl mt-1 text-slate-900 dark:text-slate-100">
              {confirmedGuests} Attending
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex justify-between">
              <span>
                {pendingGuests} Pending • {declinedGuests} Declined
              </span>
              <span className="group-hover:translate-x-1 transition-transform flex items-center gap-0.5 text-emerald-600 font-semibold">
                Guestlist <ChevronRight className="w-3 h-3" />
              </span>
            </p>
          </div>
        </div>

        {/* Timeline Progress Card */}
        <div
          onClick={() => setActiveTab('timeline')}
          className="glass-card rounded-2xl p-5 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 flex items-center justify-center">
              <CalendarDays className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-full">
              {taskProgressPercent}% Done
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Timeline Progress
            </p>
            <h3 className="font-serif font-bold text-lg sm:text-2xl mt-1 text-slate-900 dark:text-slate-100">
              {completedTasks} / {tasks.length} Tasks Complete
            </h3>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${taskProgressPercent}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex justify-between">
              <span>{tasks.length - completedTasks} Tasks Pending</span>
              <span className="group-hover:translate-x-1 transition-transform flex items-center gap-0.5 text-amber-600 font-semibold">
                Timeline <ChevronRight className="w-3 h-3" />
              </span>
            </p>
          </div>
        </div>

        {/* Vendors Status Card */}
        <div
          onClick={() => setActiveTab('vendors')}
          className="glass-card rounded-2xl p-5 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded-full">
              {confirmedVendors} Confirmed
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Vendor Contracts
            </p>
            <h3 className="font-serif font-bold text-lg sm:text-2xl mt-1 text-slate-900 dark:text-slate-100">
              {vendors.length} Total Vendors
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex justify-between">
              <span>{pendingVendors} In Negotiations</span>
              <span className="group-hover:translate-x-1 transition-transform flex items-center gap-0.5 text-indigo-600 font-semibold">
                Vendors <ChevronRight className="w-3 h-3" />
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Charts & Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RSVP Donut & Demographics */}
        <div className="glass-panel rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-slate-100">
              RSVP Response Ratio
            </h3>
            <button
              onClick={() => setActiveTab('guests')}
              className="text-xs text-rose-600 dark:text-rose-400 font-medium hover:underline"
            >
              View All
            </button>
          </div>

          <div className="h-56 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rsvpChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {rsvpChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="font-serif font-bold text-2xl text-slate-900 dark:text-slate-100">
                {guests.length}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Invited</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm block">
                {confirmedGuests}
              </span>
              <span className="text-slate-500 text-[11px]">Confirmed</span>
            </div>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30">
              <span className="font-bold text-amber-600 dark:text-amber-400 text-sm block">
                {pendingGuests}
              </span>
              <span className="text-slate-500 text-[11px]">Pending</span>
            </div>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/30">
              <span className="font-bold text-rose-600 dark:text-rose-400 text-sm block">
                {declinedGuests}
              </span>
              <span className="text-slate-500 text-[11px]">Declined</span>
            </div>
          </div>
        </div>

        {/* Upcoming Tasks & Deadlines */}
        <div className="glass-panel rounded-3xl p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-slate-100">
                Upcoming Deadlines & Actions
              </h3>
              <p className="text-xs text-slate-500">Tasks requiring immediate attention</p>
            </div>
            <button
              onClick={() => setActiveTab('timeline')}
              className="text-xs text-rose-600 dark:text-rose-400 font-medium hover:underline flex items-center gap-1"
            >
              Calendar View <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {(() => {
              const pendingTasks = tasks.filter((t) => t.status !== 'done');
              if (pendingTasks.length === 0) {
                return (
                  <div className="flex flex-col items-center justify-center py-10 px-6 text-center rounded-3xl bg-gradient-to-br from-rose-500/5 via-pink-500/10 to-amber-500/5 dark:from-slate-800/30 dark:to-slate-900/30 border border-dashed border-rose-300 dark:border-slate-700/80 animate-fade-in space-y-4">
                    <div className="flex items-center justify-center gap-3 text-4xl py-2">
                      <span className="animate-bounce inline-block" style={{ animationDelay: '0ms', animationDuration: '1.5s' }}>🎉</span>
                      <span className="animate-bounce inline-block" style={{ animationDelay: '200ms', animationDuration: '1.5s' }}>💒</span>
                      <span className="animate-bounce inline-block" style={{ animationDelay: '400ms', animationDuration: '1.5s' }}>🥂</span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-serif font-bold text-lg text-slate-800 dark:text-slate-100">
                        All Caught Up! No Immediate Deadlines
                      </h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                        You're ahead of schedule! Take a breather, celebrate your progress, or plan your next wedding milestone.
                      </p>
                    </div>
                    <button
                      onClick={() => onQuickAdd ? onQuickAdd('task') : setActiveTab('timeline')}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-bold shadow-lg shadow-rose-500/20 transition-all flex items-center gap-2 transform active:scale-[0.98]"
                    >
                      <Plus className="w-4 h-4" /> Add Timeline Task
                    </button>
                  </div>
                );
              }

              return (
                <>
                  {pendingTasks.slice(0, 4).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-800 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            task.priority === 'urgent'
                              ? 'bg-rose-500 animate-ping'
                              : task.priority === 'high'
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                        />
                        <div>
                          <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100">
                            {task.title}
                          </h4>
                          <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                            <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                              {task.category}
                            </span>
                            {(() => {
                              const dl = getDeadlineDisplay(task.dueDate, task.status === 'done');
                              return dl.isCompleted ? (
                                <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 text-[11px]">
                                  {dl.text}
                                </span>
                              ) : dl.isUrgent ? (
                                <span className="font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 animate-pulse text-[11px]">
                                  {dl.text}
                                </span>
                              ) : dl.isOverdue ? (
                                <span className="font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20 text-[11px]">
                                  {dl.text}
                                </span>
                              ) : (
                                <span>{dl.text}</span>
                              );
                            })()}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveTab('timeline')}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-100 transition-colors"
                      >
                        View Task
                      </button>
                    </div>
                  ))}

                  {pendingTasks.length < 3 && (
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-pink-500/10 border border-rose-500/20 text-xs animate-fade-in mt-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl animate-bounce" style={{ animationDuration: '2s' }}>✨</span>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">Smooth Sailing Ahead!</p>
                          <p className="text-[11px] text-slate-500">Only {pendingTasks.length} immediate task{pendingTasks.length === 1 ? '' : 's'} on your radar. You're doing great!</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab('timeline')}
                        className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 shrink-0 ml-2"
                      >
                        Timeline →
                      </button>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="glass-panel rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-slate-100">
              Live Activity Stream
            </h3>
            <p className="text-xs text-slate-500">Real-time audit log of team changes</p>
          </div>
          <span className="text-xs text-slate-400">Auto-synced</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activities.slice(0, 6).map((act) => (
            <div
              key={act.id}
              className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800"
            >
              <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                {act.userName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                  {act.message}
                </p>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                  <span>{act.userName}</span>
                  <span>•</span>
                  <span>{act.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
