import React, { useState } from 'react';
import { useWedding } from '../contexts/WeddingContext';
import { Guest, RSVPStatus } from '../types';
import {
  Heart,
  Search,
  CheckCircle2,
  XCircle,
  Utensils,
  AlertCircle,
  MessageSquare,
  Sparkles,
  Calendar,
  MapPin,
} from 'lucide-react';

interface PublicRsvpProps {
  onExit: () => void;
}

export const PublicRsvp: React.FC<PublicRsvpProps> = ({ onExit }) => {
  const { wedding, guests, updateGuest, logActivity, mealOptions } = useWedding();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [rsvpStatus, setRsvpStatus] = useState<RSVPStatus>('confirmed');
  const [mealPreference, setMealPreference] = useState<Guest['mealPreference']>((mealOptions[0] as Guest['mealPreference']) || 'Standard (Beef)');
  const [allergies, setAllergies] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Filter guests by search query
  const matchingGuests = searchQuery.trim()
    ? guests.filter(
        (g) =>
          `${g.firstName} ${g.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (g.email && g.email.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  const handleSelectGuest = (guest: Guest) => {
    setSelectedGuest(guest);
    setRsvpStatus(guest.rsvpStatus === 'declined' ? 'declined' : 'confirmed');
    setMealPreference(guest.mealPreference || 'Standard (Beef)');
    setAllergies(guest.allergies || '');
    setNotes(guest.notes || '');
    setIsSubmitted(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuest) return;

    updateGuest(selectedGuest.id, {
      rsvpStatus,
      mealPreference: rsvpStatus === 'confirmed' ? mealPreference : undefined,
      allergies: rsvpStatus === 'confirmed' ? allergies : undefined,
      notes: notes || selectedGuest.notes,
    });

    logActivity(
      'guest',
      `${selectedGuest.firstName} ${selectedGuest.lastName} submitted their RSVP (${
        rsvpStatus === 'confirmed' ? 'Attending' : 'Declined'
      })`
    );

    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-500/10 via-pink-500/5 to-amber-500/10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col justify-between p-4 md:p-8">
      {/* Top Bar */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-center py-2">
        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-serif font-bold text-xl">
          <Heart className="w-6 h-6 fill-rose-500 animate-pulse" />
          <span>{wedding.partner1Name || 'Alex'} & {wedding.partner2Name || 'Sam'}</span>
        </div>
      </div>

      {/* Main Card */}
      <div className="max-w-2xl w-full mx-auto my-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 md:p-10 shadow-2xl border border-slate-200/80 dark:border-slate-800 space-y-8 animate-fade-in">
        {/* Header Section */}
        <div className="text-center space-y-3 border-b border-slate-100 dark:border-slate-800 pb-6">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Official RSVP Portal
          </span>
          <h1 className="font-serif font-bold text-3xl md:text-4xl text-slate-900 dark:text-slate-100">
            {wedding.partner1Name || 'Alex'} & {wedding.partner2Name || 'Sam'}'s Wedding
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600 dark:text-slate-400 pt-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-4 h-4 text-rose-500" />
              {new Date(wedding.weddingDate || Date.now()).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <MapPin className="w-4 h-4 text-rose-500" />
              {wedding.venueName || 'Grand Wedding Venue'}
            </span>
          </div>
        </div>

        {isSubmitted ? (
          /* Success Screen */
          <div className="text-center py-10 space-y-5 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="font-serif font-bold text-2xl text-slate-900 dark:text-slate-100">
                Thank You, {selectedGuest?.firstName}!
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm max-w-md mx-auto">
                Your RSVP response (<strong className="text-slate-800 dark:text-slate-200 capitalize">{rsvpStatus === 'confirmed' ? 'Will Attend 🎉' : 'Regretfully Decline 💌'}</strong>) has been instantly recorded in our wedding planner!
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedGuest(null);
                setSearchQuery('');
                setIsSubmitted(false);
              }}
              className="px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all"
            >
              RSVP for Another Guest
            </button>
          </div>
        ) : !selectedGuest ? (
          /* Search Invitation Section */
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h3 className="font-serif font-semibold text-lg text-slate-800 dark:text-slate-200">
                Find Your Invitation
              </h3>
              <p className="text-xs text-slate-500">
                Please enter your first or last name to locate your guest record.
              </p>
            </div>

            <div className="relative max-w-md mx-auto">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. Michael Smith or michael@example.com..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all font-medium shadow-sm"
              />
            </div>

            {searchQuery.trim() !== '' && (
              <div className="max-w-md mx-auto space-y-2">
                {matchingGuests.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-4">
                    No matching invitation found. Please check your spelling or contact the couple.
                  </p>
                ) : (
                  matchingGuests.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => handleSelectGuest(g)}
                      className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-slate-200/60 dark:border-slate-800 hover:border-rose-300 transition-all text-left group"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-rose-600">
                          {g.firstName} {g.lastName}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Group: {g.groupCategory || 'General'} • Current Status: <span className="capitalize font-medium">{g.rsvpStatus}</span>
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        Select →
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        ) : (
          /* RSVP Form Section */
          <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-slate-100">
                  Welcome, {selectedGuest.firstName} {selectedGuest.lastName}!
                </h3>
                <p className="text-xs text-slate-500">Please let us know if you will be celebrating with us.</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedGuest(null)}
                className="text-xs text-slate-400 hover:text-slate-600 underline"
              >
                Not you? Search again
              </button>
            </div>

            {/* RSVP Radio Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRsvpStatus('confirmed')}
                className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all gap-2 ${
                  rsvpStatus === 'confirmed'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 shadow-md'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400'
                }`}
              >
                <CheckCircle2 className="w-7 h-7" />
                <span className="font-semibold text-sm">Will Attend</span>
                <span className="text-[10px] opacity-75">Accept with pleasure</span>
              </button>

              <button
                type="button"
                onClick={() => setRsvpStatus('declined')}
                className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all gap-2 ${
                  rsvpStatus === 'declined'
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 shadow-md'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400'
                }`}
              >
                <XCircle className="w-7 h-7" />
                <span className="font-semibold text-sm">Cannot Attend</span>
                <span className="text-[10px] opacity-75">Decline with regret</span>
              </button>
            </div>

            {rsvpStatus === 'confirmed' && (
              <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800 animate-fade-in">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-rose-500" /> Meal Preference
                  </label>
                  <select
                    value={mealPreference}
                    onChange={(e) => setMealPreference(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                  >
                    {mealOptions.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> Dietary Restrictions / Allergies (Optional)
                  </label>
                  <input
                    type="text"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder="e.g. Gluten-free, nut allergy, lactose intolerant..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                  </input>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-500" /> Message or Wishes for the Couple (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write a sweet note or song request for the dance floor..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-sm shadow-xl shadow-rose-500/20 transition-all transform active:scale-[0.99]"
            >
              Submit RSVP Response ✨
            </button>
          </form>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-400 py-4">
        Powered by your automated Wedding Command Center
      </div>
    </div>
  );
};
