import React, { useState } from 'react';
import { useWedding } from '../contexts/WeddingContext';
import { Guest, RSVPStatus, GuestGroup } from '../types';
import Papa from 'papaparse';
import {
  Users,
  Plus,
  Upload,
  Download,
  Search,
  Filter,
  Trash2,
  Edit2,
  Mail,
  UserPlus,
  CheckCircle2,
  Clock,
  XCircle,
  X,
  Sparkles,
  Utensils,
} from 'lucide-react';

export interface GuestsProps {
  setActiveTab?: (tab: string) => void;
  defaultTab?: 'list' | 'meals';
}

export const Guests: React.FC<GuestsProps> = ({ setActiveTab, defaultTab = 'list' }) => {
  const {
    guests,
    addGuest,
    updateGuest,
    deleteGuest,
    importGuestsCSV,
    sendRSVPReminders,
    addEmailCampaign,
    mealOptions,
    dietaryOptions,
    addMealOption,
    updateMealOption,
    deleteMealOption,
    addDietaryOption,
    updateDietaryOption,
    deleteDietaryOption,
  } = useWedding();

  const [activeSubTab, setActiveSubTab] = useState<'list' | 'meals'>(defaultTab);

  React.useEffect(() => {
    if (defaultTab) setActiveSubTab(defaultTab);
  }, [defaultTab]);

  const [newMealName, setNewMealName] = useState('');
  const [editingMeal, setEditingMeal] = useState<{ old: string; current: string } | null>(null);

  const [newDietaryName, setNewDietaryName] = useState('');
  const [editingDietary, setEditingDietary] = useState<{ old: string; current: string } | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRsvp, setFilterRsvp] = useState<string>('all');
  const [filterGroup, setFilterGroup] = useState<string>('all');

  const [showModal, setShowModal] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [selectedGuestIds, setSelectedGuestIds] = useState<string[]>([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkRsvp, setBulkRsvp] = useState<string>('no_change');
  const [bulkGroup, setBulkGroup] = useState<string>('no_change');
  const [bulkMeal, setBulkMeal] = useState<string>('no_change');
  const [bulkPlusOne, setBulkPlusOne] = useState<string>('no_change');

  // Guest Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [rsvpStatus, setRsvpStatus] = useState<RSVPStatus>('invited');
  const [groupCategory, setGroupCategory] = useState<GuestGroup>('Friends');
  const [dietary, setDietary] = useState<string>('');
  const [allergies, setAllergies] = useState<string>('');
  const [mealPreference, setMealPreference] = useState<Guest['mealPreference']>('Standard (Beef)');
  const [hasPlusOne, setHasPlusOne] = useState(false);
  const [plusOneName, setPlusOneName] = useState('');
  const [notes, setNotes] = useState('');

  const groups: GuestGroup[] = [
    'Family Partner 1',
    'Family Partner 2',
    'Friends',
    'Work',
    'VIP',
    'Other',
  ];

  const handleOpenModal = (guest?: Guest) => {
    if (guest) {
      setEditingGuest(guest);
      setFirstName(guest.firstName);
      setLastName(guest.lastName);
      setEmail(guest.email);
      setPhone(guest.phone || '');
      setRsvpStatus(guest.rsvpStatus);
      setGroupCategory(guest.groupCategory);
      setDietary(guest.dietaryRestrictions?.join(', ') || '');
      setAllergies(guest.allergies || '');
      setMealPreference(guest.mealPreference);
      setHasPlusOne(guest.hasPlusOne);
      setPlusOneName(guest.plusOneName || '');
      setNotes(guest.notes || '');
    } else {
      setEditingGuest(null);
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setRsvpStatus('invited');
      setGroupCategory('Friends');
      setDietary('');
      setAllergies('');
      setMealPreference('Standard (Beef)');
      setHasPlusOne(false);
      setPlusOneName('');
      setNotes('');
    }
    setShowModal(true);
  };

  const handleSaveGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;

    const dietaryArray = dietary
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingGuest) {
      updateGuest(editingGuest.id, {
        firstName,
        lastName,
        email,
        phone,
        rsvpStatus,
        groupCategory,
        dietaryRestrictions: dietaryArray,
        allergies,
        mealPreference,
        hasPlusOne,
        plusOneName: hasPlusOne ? plusOneName : undefined,
        notes,
      });
    } else {
      addGuest({
        firstName,
        lastName,
        email,
        phone,
        rsvpStatus,
        groupCategory,
        dietaryRestrictions: dietaryArray,
        allergies,
        mealPreference,
        hasPlusOne,
        plusOneName: hasPlusOne ? plusOneName : undefined,
        ageGroup: 'Adult',
        notes,
      });
    }
    setShowModal(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const imported = (results.data as Record<string, string>[]).map((row) => ({
          firstName: row.firstName || row['First Name'] || row.Name?.split(' ')[0] || 'Guest',
          lastName: row.lastName || row['Last Name'] || row.Name?.split(' ')[1] || '',
          email: row.email || row.Email || '',
          phone: row.phone || row.Phone || '',
          rsvpStatus: (row.rsvpStatus as RSVPStatus) || 'invited',
          groupCategory: (row.groupCategory as GuestGroup) || 'Friends',
          dietaryRestrictions: row.dietary ? row.dietary.split(',') : [],
          mealPreference: 'Standard (Beef)' as const,
          hasPlusOne: row.plusOne === 'true' || row['Plus One'] === 'Yes',
          ageGroup: 'Adult' as const,
        }));

        importGuestsCSV(imported);
        setShowCSVModal(false);
      },
    });
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGuestIds.length === 0) return;

    selectedGuestIds.forEach((id) => {
      const updates: Partial<Guest> = {};
      if (bulkRsvp && bulkRsvp !== 'no_change') {
        updates.rsvpStatus = bulkRsvp as RSVPStatus;
      }
      if (bulkGroup && bulkGroup !== 'no_change') {
        updates.groupCategory = bulkGroup as GuestGroup;
      }
      if (bulkMeal && bulkMeal !== 'no_change') {
        updates.mealPreference = bulkMeal as Guest['mealPreference'];
      }
      if (bulkPlusOne && bulkPlusOne !== 'no_change') {
        updates.hasPlusOne = bulkPlusOne === 'yes';
      }

      if (Object.keys(updates).length > 0) {
        updateGuest(id, updates);
      }
    });

    setShowBulkModal(false);
    setSelectedGuestIds([]);
  };

  const handleExportCSV = () => {
    const csv = Papa.unparse(
      guests.map((g) => ({
        'First Name': g.firstName,
        'Last Name': g.lastName,
        Email: g.email,
        Phone: g.phone,
        'RSVP Status': g.rsvpStatus,
        Group: g.groupCategory,
        'Meal Preference': g.mealPreference,
        'Dietary Restrictions': g.dietaryRestrictions.join('; '),
        'Plus One': g.hasPlusOne ? g.plusOneName || 'Yes' : 'No',
      }))
    );

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Wedding_Guestlist_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedGuestIds(filteredGuests.map((g) => g.id));
    } else {
      setSelectedGuestIds([]);
    }
  };

  const toggleSelectGuest = (id: string) => {
    setSelectedGuestIds((prev) =>
      prev.includes(id) ? prev.filter((gId) => gId !== id) : [...prev, id]
    );
  };

  const filteredGuests = guests.filter((g) => {
    const matchesSearch =
      `${g.firstName} ${g.lastName} ${g.email}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRsvp = filterRsvp === 'all' || g.rsvpStatus === filterRsvp;
    const matchesGroup = filterGroup === 'all' || g.groupCategory === filterGroup;
    return matchesSearch && matchesRsvp && matchesGroup;
  });

  return (
    <div className="p-3 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-lg sm:text-2xl md:text-3xl text-slate-900 dark:text-slate-100">
            Guest List & RSVPs
          </h1>
          <p className="text-xs text-slate-500">
            Track guest invitations, meal choices, dietary allergies, and send automated reminders.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowCSVModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all"
          >
            <Upload className="w-4 h-4 text-slate-500" /> Import CSV
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all"
          >
            <Download className="w-4 h-4 text-slate-500" /> Export CSV
          </button>

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-md shadow-rose-500/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Guest
          </button>
        </div>
      </div>

      {/* Sub-Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('list')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all ${
            activeSubTab === 'list'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Guest List & RSVPs
        </button>
        <button
          onClick={() => setActiveSubTab('meals')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all ${
            activeSubTab === 'meals'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Utensils className="w-4 h-4" />
          Meal & Dietary Menu
        </button>
      </div>

      {activeSubTab === 'meals' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          {/* Meal Preferences Column */}
          <div className="glass-panel rounded-3xl p-6 space-y-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-500">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-slate-100">
                    Meal Preference Menu
                  </h3>
                  <p className="text-xs text-slate-500">
                    Customize the meal choices available for guests when submitting RSVPs.
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newMealName.trim()) {
                  addMealOption(newMealName.trim());
                  setNewMealName('');
                }
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Add new meal (e.g. Halal Lamb, Prime Rib Beef)..."
                value={newMealName}
                onChange={(e) => setNewMealName(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <button
                type="submit"
                disabled={!newMealName.trim()}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-semibold text-xs shadow-md shadow-rose-500/20 transition-all"
              >
                <Plus className="w-4 h-4" /> Add Meal
              </button>
            </form>

            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {mealOptions.map((meal) => {
                const isEditing = editingMeal?.old === meal;
                const count = guests.filter((g) => g.mealPreference === meal).length;

                return (
                  <div
                    key={meal}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 shadow-sm hover:border-slate-200 dark:hover:border-slate-600 transition-all group"
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1 mr-2">
                        <input
                          type="text"
                          value={editingMeal.current}
                          onChange={(e) =>
                            setEditingMeal({ ...editingMeal, current: e.target.value })
                          }
                          className="flex-1 px-3 py-1 rounded-lg border border-rose-500 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => {
                            updateMealOption(editingMeal.old, editingMeal.current);
                            setEditingMeal(null);
                          }}
                          className="p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-all"
                          title="Save"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingMeal(null)}
                          className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                          {meal}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700/70 text-slate-600 dark:text-slate-400 text-[11px] font-medium">
                          {count} {count === 1 ? 'guest' : 'guests'} selected
                        </span>
                      </div>
                    )}

                    {!isEditing && (
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => setEditingMeal({ old: meal, current: meal })}
                          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-all"
                          title="Edit meal option"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (mealOptions.length <= 1) {
                              alert('You must have at least one meal option in your menu.');
                              return;
                            }
                            if (count > 0) {
                              if (
                                !window.confirm(
                                  `Warning: ${count} guest(s) have selected "${meal}". Are you sure you want to delete this meal option?`
                                )
                              ) {
                                return;
                              }
                            }
                            deleteMealOption(meal);
                          }}
                          className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 transition-all"
                          title="Delete meal option"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dietary Restrictions Column */}
          <div className="glass-panel rounded-3xl p-6 space-y-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-500">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-slate-100">
                    Dietary Restrictions & Allergies
                  </h3>
                  <p className="text-xs text-slate-500">
                    Manage default dietary tags guests can choose or filter by.
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newDietaryName.trim()) {
                  addDietaryOption(newDietaryName.trim());
                  setNewDietaryName('');
                }
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Add dietary tag (e.g. Gluten-Free, Peanut Allergy)..."
                value={newDietaryName}
                onChange={(e) => setNewDietaryName(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="submit"
                disabled={!newDietaryName.trim()}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold text-xs shadow-md shadow-amber-500/20 transition-all"
              >
                <Plus className="w-4 h-4" /> Add Tag
              </button>
            </form>

            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {dietaryOptions.map((tag) => {
                const isEditing = editingDietary?.old === tag;
                const count = guests.filter((g) => g.dietaryRestrictions?.includes(tag)).length;

                return (
                  <div
                    key={tag}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 shadow-sm hover:border-slate-200 dark:hover:border-slate-600 transition-all group"
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1 mr-2">
                        <input
                          type="text"
                          value={editingDietary.current}
                          onChange={(e) =>
                            setEditingDietary({ ...editingDietary, current: e.target.value })
                          }
                          className="flex-1 px-3 py-1 rounded-lg border border-amber-500 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => {
                            updateDietaryOption(editingDietary.old, editingDietary.current);
                            setEditingDietary(null);
                          }}
                          className="p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-all"
                          title="Save"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingDietary(null)}
                          className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                          {tag}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700/70 text-slate-600 dark:text-slate-400 text-[11px] font-medium">
                          {count} {count === 1 ? 'guest' : 'guests'} tagged
                        </span>
                      </div>
                    )}

                    {!isEditing && (
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => setEditingDietary({ old: tag, current: tag })}
                          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-all"
                          title="Edit dietary tag"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (count > 0) {
                              if (
                                !window.confirm(
                                  `Warning: ${count} guest(s) have "${tag}" as a dietary restriction. Are you sure you want to delete this tag?`
                                )
                              ) {
                                return;
                              }
                            }
                            deleteDietaryOption(tag);
                          }}
                          className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 transition-all"
                          title="Delete dietary tag"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Filter & Bulk Actions Bar */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search guest name or email..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={filterRsvp}
            onChange={(e) => setFilterRsvp(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none"
          >
            <option value="all">All RSVP Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="declined">Declined</option>
            <option value="invited">Invited</option>
            <option value="opened">Opened Link</option>
          </select>

          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none"
          >
            <option value="all">All Guest Groups</option>
            {groups.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          {selectedGuestIds.length > 0 && (
            <div className="flex items-center gap-2 animate-fade-in">
              <button
                onClick={() => {
                  setBulkRsvp('no_change');
                  setBulkGroup('no_change');
                  setBulkMeal('no_change');
                  setBulkPlusOne('no_change');
                  setShowBulkModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-sm transition-all text-xs"
              >
                <Edit2 className="w-3.5 h-3.5" /> Bulk Edit ({selectedGuestIds.length})
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Are you sure you want to permanently delete ${selectedGuestIds.length} selected guests?`)) {
                    selectedGuestIds.forEach((id) => deleteGuest(id));
                    setSelectedGuestIds([]);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold shadow-sm transition-all text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" /> Bulk Delete ({selectedGuestIds.length})
              </button>
              <button
                onClick={() => {
                  if (addEmailCampaign) {
                    addEmailCampaign({
                      title: `Reminder Blast (${selectedGuestIds.length} Selected Guests)`,
                      scheduledDate: new Date().toISOString().split('T')[0],
                      status: 'draft',
                      recipientFilter: 'custom',
                      customGuestIds: selectedGuestIds,
                      sentCount: 0,
                      openRate: 0,
                      clickRate: 0,
                    });
                  }
                  sendRSVPReminders(selectedGuestIds);
                  if (setActiveTab) {
                    setActiveTab('automation');
                  } else {
                    alert(`Created a Bulk Blast campaign for ${selectedGuestIds.length} selected guests! Go to Automation & Email tab to send.`);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all text-xs border border-rose-200 dark:border-rose-800"
              >
                <Mail className="w-3.5 h-3.5" /> Remind ({selectedGuestIds.length})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Guest Data Table */}
      <div className="glass-panel rounded-3xl overflow-hidden">
        <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      selectedGuestIds.length === filteredGuests.length && filteredGuests.length > 0
                    }
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-rose-500 focus:ring-rose-400"
                  />
                </th>
                <th className="p-4">Guest Name</th>
                <th className="p-4">RSVP Status</th>
                <th className="p-4">Group</th>
                <th className="p-4">Meal & Dietary</th>
                <th className="p-4">Plus-One</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredGuests.map((guest) => {
                const isSelected = selectedGuestIds.includes(guest.id);

                return (
                  <tr
                    key={guest.id}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors ${
                      isSelected ? 'bg-rose-50/40 dark:bg-rose-950/20' : ''
                    }`}
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectGuest(guest.id)}
                        className="rounded border-slate-300 text-rose-500 focus:ring-rose-400"
                      />
                    </td>
                    <td className="p-4 font-medium text-slate-900 dark:text-slate-100">
                      <div>
                        <span className="font-semibold">
                          {guest.firstName} {guest.lastName}
                        </span>
                        <div className="text-[11px] text-slate-400">{guest.email}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          guest.rsvpStatus === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : guest.rsvpStatus === 'declined'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}
                      >
                        {guest.rsvpStatus === 'confirmed' && <CheckCircle2 className="w-3 h-3" />}
                        {guest.rsvpStatus === 'declined' && <XCircle className="w-3 h-3" />}
                        {guest.rsvpStatus !== 'confirmed' && guest.rsvpStatus !== 'declined' && (
                          <Clock className="w-3 h-3" />
                        )}
                        <span className="capitalize">{guest.rsvpStatus}</span>
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400 font-medium">
                      {guest.groupCategory}
                    </td>
                    <td className="p-4 space-y-1">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {guest.mealPreference}
                      </div>
                      {guest.dietaryRestrictions?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {guest.dietaryRestrictions.map((d) => (
                            <span
                              key={d}
                              className="bg-amber-50 text-amber-700 dark:bg-amber-950/50 text-[10px] px-1.5 py-0.5 rounded font-semibold"
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">
                      {guest.hasPlusOne ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                          <UserPlus className="w-3.5 h-3.5" />
                          {guest.plusOneName || 'Allowed'}
                        </span>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenModal(guest)}
                          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteGuest(guest.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-100 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
        </div>
      )}

      {/* ADD/EDIT GUEST MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full sm:max-w-xl mx-3 sm:mx-auto p-6 space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif font-bold text-lg">
                {editingGuest ? 'Edit Guest Profile' : 'Add New Wedding Guest'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGuest} className="space-y-4 text-xs font-medium">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">
                    RSVP Status
                  </label>
                  <select
                    value={rsvpStatus}
                    onChange={(e) => setRsvpStatus(e.target.value as RSVPStatus)}
                    className="w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="invited">Invited</option>
                    <option value="opened">Opened Link</option>
                    <option value="responded">Responded</option>
                    <option value="confirmed">Confirmed (Attending)</option>
                    <option value="declined">Declined</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">
                    Guest Group
                  </label>
                  <select
                    value={groupCategory}
                    onChange={(e) => setGroupCategory(e.target.value as GuestGroup)}
                    className="w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800"
                  >
                    {groups.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">
                    Meal Preference
                  </label>
                  <select
                    value={mealPreference}
                    onChange={(e) =>
                      setMealPreference(e.target.value as Guest['mealPreference'])
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800"
                  >
                    {mealOptions.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">
                    Dietary Restrictions
                  </label>
                  <input
                    type="text"
                    placeholder="Gluten-Free, Dairy-Free (comma separated)"
                    value={dietary}
                    onChange={(e) => setDietary(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {dietaryOptions.map((tag) => {
                      const currentTags = dietary.split(',').map((s) => s.trim()).filter(Boolean);
                      const selected = currentTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            if (selected) {
                              setDietary(currentTags.filter((t) => t !== tag).join(', '));
                            } else {
                              setDietary([...currentTags, tag].join(', '));
                            }
                          }}
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all border ${
                            selected
                              ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-rose-400'
                          }`}
                        >
                          {selected ? '✓ ' : '+ '}{tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="plusOneCheck"
                    checked={hasPlusOne}
                    onChange={(e) => setHasPlusOne(e.target.checked)}
                    className="rounded text-rose-500"
                  />
                  <label htmlFor="plusOneCheck" className="font-semibold text-slate-800 dark:text-slate-200">
                    Allow Plus-One Guest
                  </label>
                </div>
                {hasPlusOne && (
                  <div>
                    <label className="block text-slate-500 mb-1">Plus-One Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Jane Doe"
                      value={plusOneName}
                      onChange={(e) => setPlusOneName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border bg-white dark:bg-slate-900"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-500 text-white font-semibold shadow-md shadow-rose-500/20"
                >
                  Save Guest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV IMPORT DIALOG MODAL */}
      {showCSVModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full sm:max-w-md mx-3 sm:mx-auto p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif font-bold text-lg">Import Guestlist CSV</h3>
              <button onClick={() => setShowCSVModal(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Upload a .csv file containing columns like First Name, Last Name, Email, Group, and
              RSVP status.
            </p>
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center space-y-2">
              <Upload className="w-8 h-8 text-rose-500 mx-auto" />
              <p className="text-xs font-semibold">Select CSV file from computer</p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100"
              />
            </div>
          </div>
        </div>
      )}

      {/* BULK EDIT MODAL */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full sm:max-w-md mx-3 sm:mx-auto p-6 space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-slate-100">
                    Bulk Edit Guests
                  </h3>
                  <p className="text-xs text-slate-500">
                    Updating <strong className="text-amber-600">{selectedGuestIds.length}</strong> selected guest{selectedGuestIds.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowBulkModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBulkSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">RSVP Status</label>
                <select
                  value={bulkRsvp}
                  onChange={(e) => setBulkRsvp(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="no_change">-- Keep Current Status --</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="declined">Declined</option>
                  <option value="invited">Invited</option>
                  <option value="opened">Opened Link</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Guest Group</label>
                <select
                  value={bulkGroup}
                  onChange={(e) => setBulkGroup(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="no_change">-- Keep Current Group --</option>
                  {groups.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Meal Preference</label>
                <select
                  value={bulkMeal}
                  onChange={(e) => setBulkMeal(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="no_change">-- Keep Current Meal --</option>
                  {mealOptions.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Plus-One Allowed</label>
                <select
                  value={bulkPlusOne}
                  onChange={(e) => setBulkPlusOne(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="no_change">-- Keep Current Setting --</option>
                  <option value="yes">Allow Plus-One (Yes)</option>
                  <option value="no">No Plus-One (No)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-md shadow-amber-500/20 transition-all"
                >
                  Apply Bulk Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
