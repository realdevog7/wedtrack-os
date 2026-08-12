import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Unlock,
  Key,
  UserPlus,
  Trash2,
  RotateCcw,
  Archive,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Download,
  Zap,
  Users,
  Layers,
  User,
  Database,
  Sparkles,
  Eye,
  EyeOff,
  Copy,
} from 'lucide-react';
import {
  getWhitelistedEmails,
  addWhitelistedEmail,
  deleteWhitelistedEmail,
  bulkAddWhitelistedEmails,
  getTrashedEmails,
  restoreWhitelistedEmail,
  permanentlyDeleteWhitelistedEmail,
  WhitelistRecord,
  TrashedRecord,
  generateAutoPassword,
} from '../utils/whitelist';
import { isFirebaseConfigured, db } from '../utils/firebase';
import { collection, getDocs } from 'firebase/firestore';

interface AdminPortalProps {
  onExit?: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onExit }) => {
  // Session authentication state (Master Key lock screen)
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem('etsy_admin_unlocked') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState('');

  // Workspace state
  const [records, setRecords] = useState<WhitelistRecord[]>([]);
  const [trashedRecords, setTrashedRecords] = useState<TrashedRecord[]>([]);
  const [setupUsers, setSetupUsers] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bulk' | 'single'>('bulk');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTrash, setShowTrash] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Form states (No Order ID - Email only!)
  const [singleEmail, setSingleEmail] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Master Key demo (In production, replace or configure in env)
  const MASTER_KEY = 'etsy2026';

  const showStatus = (text: string, isError: boolean = false) => {
    setStatusMsg({ text, isError });
    setTimeout(() => setStatusMsg(null), 5000);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getWhitelistedEmails();
      setRecords(data);
      const trashed = await getTrashedEmails();
      setTrashedRecords(trashed);
      
      if (isFirebaseConfigured && db) {
        try {
          const weddingsSnap = await getDocs(collection(db, 'weddings'));
          const setupSet = new Set<string>();
          weddingsSnap.forEach(doc => {
            if (doc.data().onboardingComplete === true) {
              setupSet.add(doc.id);
            }
          });
          setSetupUsers(setupSet);
        } catch (e) {
          console.error('Failed to load wedding statuses:', e);
        }
      }
    } catch (err) {
      console.error('Failed to load whitelisted emails:', err);
      showStatus('Error reading database records.', true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isUnlocked) {
      loadData();
    }
  }, [isUnlocked]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === MASTER_KEY) {
      sessionStorage.setItem('etsy_admin_unlocked', 'true');
      setIsUnlocked(true);
      setPinError('');
    } else {
      setPinError('Invalid Master Key. Please try again.');
    }
  };

  const handleLockStudio = () => {
    sessionStorage.removeItem('etsy_admin_unlocked');
    setIsUnlocked(false);
    setPinInput('');
  };

  const handleAddSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleEmail.trim()) return;

    setIsSubmitting(true);
    try {
      await addWhitelistedEmail(singleEmail.trim());
      setSingleEmail('');
      showStatus(`Successfully whitelisted ${singleEmail.trim()}!`);
      await loadData();
    } catch (err) {
      showStatus('Failed to whitelist email.', true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkText.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await bulkAddWhitelistedEmails(bulkText);
      if (result.added === 0) {
        showStatus('No valid email addresses found in pasted text.', true);
      } else {
        setBulkText('');
        showStatus(`Successfully extracted & whitelisted ${result.added} buyer emails!`);
        await loadData();
      }
    } catch (err) {
      showStatus('Error during bulk extraction.', true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (email: string) => {
    if (!confirm(`Move ${email} to trash? You can restore them later from the Recently Deleted section.`)) return;

    try {
      await deleteWhitelistedEmail(email);
      showStatus(`Moved ${email} to trash. You can restore them anytime! 🗑️`);
      await loadData();
    } catch (err) {
      showStatus('Failed to revoke access.', true);
    }
  };

  const handleRestore = async (email: string) => {
    try {
      await restoreWhitelistedEmail(email);
      showStatus(`✅ Successfully restored ${email} back to the active whitelist!`);
      await loadData();
    } catch (err) {
      showStatus('Failed to restore email.', true);
    }
  };

  const handlePermanentDelete = async (email: string) => {
    if (!confirm(`⚠️ PERMANENTLY DELETE ${email}?\n\nThis will:\n• Remove them from trash\n• Wipe ALL their wedding data from the database\n\nThis action is IRREVERSIBLE!`)) return;

    try {
      await permanentlyDeleteWhitelistedEmail(email);
      showStatus(`Permanently deleted ${email} and wiped all their data.`);
      await loadData();
    } catch (err) {
      showStatus('Failed to permanently delete.', true);
    }
  };

  const handleExportCsv = () => {
    if (records.length === 0) {
      showStatus('No customer records to export.', true);
      return;
    }
    const headers = ['Email Address', 'Date Added', 'Status'];
    const rows = records.map((r) => [
      r.email,
      r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '',
      'Active',
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `etsy_whitelisted_emails_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showStatus('Downloaded CSV export of all whitelisted email addresses!');
  };

  const filteredRecords = records.filter((r) =>
    r.email.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  // ---------------------------------------------------------------------------
  // LOCK SCREEN VIEW
  // ---------------------------------------------------------------------------
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[#050811] text-slate-100 flex items-center justify-center p-6 select-none font-sans relative">
        {onExit && (
          <button
            onClick={onExit}
            className="absolute top-6 left-6 px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all flex items-center gap-2 border border-slate-800 shadow-lg z-20"
          >
            ← Return to Wedding Planner
          </button>
        )}
        <div className="max-w-md w-full bg-[#0c101d] rounded-3xl p-8 border border-slate-800 shadow-2xl shadow-pink-500/10 space-y-6 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-60 h-60 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="text-center space-y-3 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-600 via-purple-600 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-pink-500/20 border border-white/20">
              <Lock className="w-8 h-8 animate-pulse" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-white tracking-tight">
              WedTrack Admin Studio 🔒
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Protected seller administration console. Please enter your Master Key to manage customer app access.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4 relative z-10">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Master Key / Seller PIN
              </label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  required
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Enter secret key..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:outline-none focus:border-pink-500 text-sm font-mono text-slate-100 placeholder:text-slate-600 pr-11 shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {pinError && (
                <p className="text-[11px] text-rose-400 mt-1.5 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  {pinError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-pink-500/25 active:scale-95 transition-all border border-white/10"
            >
              <Unlock className="w-4 h-4" /> Unlock Seller Studio
            </button>
          </form>


        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // UNLOCKED STUDIO VIEW (PURE DARK THEME)
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 p-6 lg:p-10 font-sans selection:bg-pink-500 selection:text-white">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Banner */}
        <header className="bg-gradient-to-r from-slate-950 via-purple-950/60 to-slate-950 rounded-3xl p-6 lg:p-8 border border-white/10 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -left-20 -top-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-pink-500/20 shrink-0 border border-white/20">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl lg:text-3xl font-serif font-bold tracking-tight text-white">
                  WedTrack Admin Studio
                </h1>
                <span className="bg-pink-500/20 text-pink-300 text-[10px] uppercase font-bold px-3 py-0.5 rounded-full border border-pink-500/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-ping"></span> Pure Dark Mode
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-normal">
                Manage buyer email access cleanly. Only whitelisted emails can complete Step 1 of the onboarding wizard.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-center relative z-10 flex-wrap">
            {onExit && (
              <button
                onClick={onExit}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all flex items-center gap-2 border border-slate-800 shadow-lg"
              >
                ← Return to Wedding Planner
              </button>
            )}
            <button
              onClick={handleExportCsv}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-semibold transition-all flex items-center gap-2 border border-slate-800 shadow-lg"
            >
              <Download className="w-4 h-4 text-indigo-400" /> Export CSV
            </button>
            <button
              onClick={handleLockStudio}
              className="px-4 py-2.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 hover:text-white text-xs font-semibold transition-all flex items-center gap-2 border border-rose-500/30 shadow-lg"
              title="Lock portal when leaving"
            >
              <Lock className="w-4 h-4" /> Lock Studio
            </button>
          </div>
        </header>

        {/* Status Notification Banner */}
        {statusMsg && (
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between text-xs transition-all ${
              statusMsg.isError
                ? 'bg-rose-950/80 border-rose-500/50 text-rose-200'
                : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
            }`}
          >
            <span className="flex items-center gap-2 font-medium">
              {statusMsg.isError ? (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              {statusMsg.text}
            </span>
            <button onClick={() => setStatusMsg(null)} className="text-slate-400 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Whitelist Controls */}
          <div className="lg:col-span-1 bg-[#0c101d] rounded-3xl p-6 space-y-5 flex flex-col justify-between border border-slate-800/80 shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="font-serif font-bold text-lg text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-pink-500" /> Grant Buyer Access
                </h2>
              </div>

              {/* Mode Selector Tabs */}
              <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl text-xs font-semibold text-center border border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('bulk')}
                  className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'bulk'
                      ? 'bg-pink-600 text-white shadow-md shadow-pink-600/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" /> Bulk Paste
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('single')}
                  className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'single'
                      ? 'bg-pink-600 text-white shadow-md shadow-pink-600/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <User className="w-3.5 h-3.5" /> Single Email
                </button>
              </div>

              {/* Bulk Paste Form */}
              {activeTab === 'bulk' && (
                <form onSubmit={handleAddBulk} className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-300">
                    Paste Etsy Order Text or Email List
                  </label>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Copy & paste raw text from Etsy order notifications, messages, or buyer spreadsheets. We automatically extract every valid email!
                  </p>
                  <textarea
                    rows={6}
                    required
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    placeholder="Example paste:&#10;Order from sarah_wedding@gmail.com&#10;mike.jones@yahoo.com, jessica@hotmail.com"
                    className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:outline-none focus:border-pink-500 text-xs font-mono text-slate-200 shadow-inner leading-relaxed placeholder:text-slate-600"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20 active:scale-95 transition-all border border-white/10 disabled:opacity-50"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    {isSubmitting ? 'Extracting...' : 'Extract & Whitelist All Emails'}
                  </button>
                </form>
              )}

              {/* Single Email Form */}
              {activeTab === 'single' && (
                <form onSubmit={handleAddSingle} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Buyer Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={singleEmail}
                      onChange={(e) => setSingleEmail(e.target.value)}
                      placeholder="customer@gmail.com"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 text-xs text-slate-200 placeholder:text-slate-600"
                    />
                  </div>
                  {singleEmail && (
                    <div className="p-2.5 rounded-xl bg-pink-950/30 border border-pink-500/30 text-xs flex items-center justify-between font-mono text-pink-300">
                      <span>🔑 Auto Password:</span>
                      <strong className="tracking-wide">{generateAutoPassword(singleEmail)}</strong>
                    </div>
                  )}
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Enter the exact email address the customer will use to register their wedding planner account.
                  </p>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 active:scale-95 transition-all border border-white/10 disabled:opacity-50"
                  >
                    <UserPlus className="w-4 h-4" />
                    {isSubmitting ? 'Saving...' : 'Whitelist Customer Email'}
                  </button>
                </form>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2 bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/60">
              <Lock className="w-4 h-4 text-pink-400 shrink-0" />
              <span>Only emails listed here can pass Step 1 of your wedding planner app.</span>
            </div>
          </div>

          {/* Right 2 Columns: Whitelisted Directory */}
          <div className="lg:col-span-2 bg-[#0c101d] rounded-3xl p-6 space-y-4 flex flex-col border border-slate-800/80 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <h2 className="font-serif font-bold text-lg text-white">Whitelisted Email Directory</h2>
                <span className="bg-pink-500/10 text-pink-400 text-xs font-bold px-3 py-0.5 rounded-full border border-pink-500/20">
                  {records.length} Active
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search active email addresses..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 text-xs text-slate-200 placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* List Container */}
            <div className="flex-1 max-h-[520px] overflow-y-auto space-y-2 pr-1">
              {isLoading ? (
                <div className="text-center py-16 text-slate-500">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-pink-500" />
                  <p className="text-xs">Loading buyer access records...</p>
                </div>
              ) : filteredRecords.length === 0 ? (
                <div className="text-center py-16 bg-slate-950/60 rounded-2xl border border-dashed border-slate-800">
                  <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">
                    No whitelisted email addresses found matching your query.
                  </p>
                </div>
              ) : (
                filteredRecords.map((item) => (
                  <div
                    key={item.email}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs hover:border-pink-500/40 transition-all shadow-md group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500/20 to-purple-500/20 text-pink-400 font-bold flex items-center justify-center text-sm shrink-0 border border-pink-500/30">
                        {item.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-bold text-white block text-sm tracking-wide">
                          {item.email}
                        </span>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-[11px] bg-pink-950/40 text-pink-300 px-2.5 py-0.5 rounded-lg border border-pink-500/30 font-mono flex items-center gap-1.5">
                            <Key className="w-3 h-3 text-pink-400" />
                            {item.password || generateAutoPassword(item.email)}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Added: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Manual'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const pass = item.password || generateAutoPassword(item.email);
                          navigator.clipboard.writeText(`Email: ${item.email}\nPassword: ${pass}`);
                          setStatusMsg({ text: `Copied login details for ${item.email}!`, isError: false });
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5 border border-slate-800 shadow-sm"
                        title="Copy Access Details for Customer"
                      >
                        <Copy className="w-3.5 h-3.5 text-indigo-400" /> Copy Login
                      </button>
                      
                      {setupUsers.has(item.email) ? (
                        <button
                          type="button"
                          onClick={() => {
                            sessionStorage.setItem('wedtrack_admin_preview', item.email);
                            window.location.reload();
                          }}
                          className="p-2 text-slate-500 hover:text-amber-400 hover:bg-amber-950/50 rounded-xl transition-all group-hover:text-amber-500 border border-transparent hover:border-amber-500/30"
                          title="Preview Customer Dashboard (Read-Only)"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      ) : (
                        <div
                          className="p-2 text-slate-700 rounded-xl cursor-not-allowed"
                          title="User has not completed the onboarding wizard yet."
                        >
                          <EyeOff className="w-4 h-4 opacity-50" />
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDelete(item.email)}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/50 rounded-xl transition-all group-hover:text-slate-400"
                        title="Revoke Access"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                Storage Mode:{' '}
                <strong className={isFirebaseConfigured ? 'text-emerald-400' : 'text-slate-300'}>
                  {isFirebaseConfigured ? 'Cloud Firestore Sync' : 'Local Storage (Demo Mode)'}
                </strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowTrash(!showTrash)}
                  className={`flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-lg border ${
                    showTrash
                      ? 'bg-amber-950/50 text-amber-400 border-amber-500/30'
                      : 'bg-slate-900 hover:text-white border-slate-800'
                  }`}
                >
                  <Archive className="w-3.5 h-3.5" /> Trash{trashedRecords.length > 0 && ` (${trashedRecords.length})`}
                </button>
                <button
                  onClick={loadData}
                  className="hover:text-white flex items-center gap-1.5 transition-colors bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-indigo-400" /> Refresh List
                </button>
              </div>
            </div>

            {/* ---- TRASH / RECENTLY DELETED SECTION ---- */}
            {showTrash && (
              <div className="mt-4 pt-4 border-t border-amber-500/20">
                <div className="flex items-center gap-2.5 mb-3">
                  <Archive className="w-4 h-4 text-amber-400" />
                  <h3 className="font-serif font-bold text-base text-amber-300">Recently Deleted</h3>
                  <span className="bg-amber-500/10 text-amber-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-500/20">
                    {trashedRecords.length} in trash
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mb-3">
                  These users have been soft-deleted. Their wedding data is still preserved on the server. You can <strong className="text-amber-300">Restore</strong> them to re-grant access, or <strong className="text-rose-400">Permanently Delete</strong> to wipe all their data forever.
                </p>
                {trashedRecords.length === 0 ? (
                  <div className="text-center py-8 bg-slate-950/60 rounded-2xl border border-dashed border-slate-800">
                    <Archive className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">Trash is empty. No recently deleted users.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {trashedRecords.map((item) => (
                      <div
                        key={item.email}
                        className="p-3.5 rounded-2xl bg-slate-950 border border-amber-500/20 flex items-center justify-between text-xs hover:border-amber-500/40 transition-all shadow-md group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 text-amber-400 font-bold flex items-center justify-center text-sm shrink-0 border border-amber-500/30">
                            {item.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-300 block text-sm line-through decoration-amber-500/50">
                              {item.email}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className="text-[10px] text-amber-400">
                                🗑️ Deleted: {new Date(item.trashedAt).toLocaleDateString()}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                Originally added: {new Date(item.originalCreatedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleRestore(item.email)}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-400 hover:text-emerald-300 text-xs font-semibold transition-all flex items-center gap-1.5 border border-emerald-500/30 shadow-sm"
                            title="Restore to Active Whitelist"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Restore
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePermanentDelete(item.email)}
                            className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/50 rounded-xl transition-all"
                            title="Permanently Delete & Wipe All Data"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
