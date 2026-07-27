import React, { useState, useEffect } from 'react';
import { useWedding } from '../contexts/WeddingContext';
import { getCurrencySymbol } from '../utils/currency';
import {
  Settings as SettingsIcon,
  Shield,
  Save,
  CheckCircle2,
  Globe,
  Key,
  Eye,
  EyeOff,
  Sliders,
  Sparkles,
  DollarSign,
  AlertTriangle,
  Trash2,
  RefreshCw,
} from 'lucide-react';

const worldCurrencies = [
  { code: 'USD', symbol: '$', name: 'United States Dollar (USD)' },
  { code: 'EUR', symbol: '€', name: 'Euro (EUR)' },
  { code: 'GBP', symbol: '£', name: 'British Pound Sterling (GBP)' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen (JPY)' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar (CAD)' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar (AUD)' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc (CHF)' },
  { code: 'CNY', symbol: 'CN¥', name: 'Chinese Yuan (CNY)' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (INR)' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real (BRL)' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand (ZAR)' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble (RUB)' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won (KRW)' },
  { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso (MXN)' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar (SGD)' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar (HKD)' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar (NZD)' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona (SEK)' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone (NOK)' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone (DKK)' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Złoty (PLN)' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht (THB)' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah (IDR)' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit (MYR)' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso (PHP)' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira (TRY)' },
  { code: 'AED', symbol: 'AED', name: 'United Arab Emirates Dirham (AED)' },
  { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal (SAR)' },
  { code: 'ILS', symbol: '₪', name: 'Israeli New Shekel (ILS)' },
  { code: 'ARS', symbol: '$', name: 'Argentine Peso (ARS)' },
  { code: 'CLP', symbol: '$', name: 'Chilean Peso (CLP)' },
  { code: 'COP', symbol: '$', name: 'Colombian Peso (COP)' },
  { code: 'PEN', symbol: 'S/', name: 'Peruvian Sol (PEN)' },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Đồng (VND)' },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound (EGP)' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira (NGN)' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling (KES)' },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi (GHS)' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee (PKR)' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka (BDT)' },
  { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee (LKR)' },
  { code: 'UAH', symbol: '₴', name: 'Ukrainian Hryvnia (UAH)' },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna (CZK)' },
  { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint (HUF)' },
  { code: 'RON', symbol: 'lei', name: 'Romanian Leu (RON)' },
  { code: 'BGN', symbol: 'лв', name: 'Bulgarian Lev (BGN)' },
  { code: 'HRK', symbol: 'kn', name: 'Croatian Kuna (HRK)' },
  { code: 'RSD', symbol: 'din.', name: 'Serbian Dinar (RSD)' },
  { code: 'ISK', symbol: 'kr', name: 'Icelandic Króna (ISK)' },
  { code: 'QAR', symbol: 'QR', name: 'Qatari Riyal (QAR)' },
  { code: 'KWD', symbol: 'KD', name: 'Kuwaiti Dinar (KWD)' },
  { code: 'BHD', symbol: 'BD', name: 'Bahraini Dinar (BHD)' },
  { code: 'OMR', symbol: 'OMR', name: 'Omani Rial (OMR)' },
  { code: 'JOD', symbol: 'JD', name: 'Jordanian Dinar (JOD)' },
  { code: 'MAD', symbol: 'MAD', name: 'Moroccan Dirham (MAD)' },
  { code: 'TND', symbol: 'DT', name: 'Tunisian Dinar (TND)' },
];

export const Settings: React.FC = () => {
  const { wedding, updateWedding, resetDataToSample } = useWedding();
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleConfirmReset = () => {
    resetDataToSample();
    setShowResetModal(false);
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3500);
  };

  // Project Details State
  const [partner1Name, setPartner1Name] = useState(wedding.partner1Name);
  const [partner2Name, setPartner2Name] = useState(wedding.partner2Name);
  const [weddingDate, setWeddingDate] = useState(
    wedding.weddingDate.split('T')[0] || '2027-06-18'
  );
  const [venueName, setVenueName] = useState(wedding.venueName);
  const [totalBudget, setTotalBudget] = useState(wedding.totalBudget);

  // Security & Privacy State
  const [rsvpPinEnabled, setRsvpPinEnabled] = useState(false);
  const [rsvpPin, setRsvpPin] = useState('2026');
  const [showPin, setShowPin] = useState(false);

  // Preferences State
  const [currency, setCurrency] = useState(wedding.currency || '$ (USD)');
  const [timezone, setTimezone] = useState('America/New_York');
  const sym = getCurrencySymbol(currency);

  useEffect(() => {
    if (wedding.currency) setCurrency(wedding.currency);
  }, [wedding.currency]);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'project' | 'security' | 'preferences'>('project');

  const handleSaveWeddingSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateWedding({
      partner1Name,
      partner2Name,
      weddingDate: new Date(weddingDate).toISOString(),
      venueName,
      totalBudget,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-xl sm:text-2xl md:text-3xl text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <SettingsIcon className="w-7 h-7 text-rose-500" />
            Settings & Security
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure wedding metadata, guest portal PIN protection, currency standards, and localization preferences.
          </p>
        </div>

        {savedSuccess && (
          <div className="px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> All settings successfully saved!
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 sm:gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-semibold overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('project')}
          className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 whitespace-nowrap rounded-xl transition-all ${
            activeTab === 'project'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
              : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Sparkles className="w-4 h-4" /> Wedding Details
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 whitespace-nowrap rounded-xl transition-all ${
            activeTab === 'security'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
              : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Shield className="w-4 h-4" /> Security & Privacy
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 whitespace-nowrap rounded-xl transition-all ${
            activeTab === 'preferences'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
              : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Sliders className="w-4 h-4" /> App Preferences
        </button>
      </div>

      {/* TAB 1: WEDDING PROJECT DETAILS */}
      {activeTab === 'project' && (
        <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-6 border border-slate-100 dark:border-slate-800 shadow-xl animate-in fade-in duration-200">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Wedding Project Overview
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              These details update your countdown header, budget tracker calculations, and public RSVP portal.
            </p>
          </div>

          <form onSubmit={handleSaveWeddingSettings} className="space-y-5 text-xs font-medium">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">
                  Partner 1 Full Name
                </label>
                <input
                  type="text"
                  required
                  value={partner1Name}
                  onChange={(e) => setPartner1Name(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">
                  Partner 2 Full Name
                </label>
                <input
                  type="text"
                  required
                  value={partner2Name}
                  onChange={(e) => setPartner2Name(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">
                  Wedding Ceremony Date
                </label>
                <input
                  type="date"
                  required
                  value={weddingDate}
                  onChange={(e) => setWeddingDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">{sym}</span> Total Master Budget ({sym})
                </label>
                <input
                  type="number"
                  required
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">
                Primary Venue Name & Location
              </label>
              <input
                type="text"
                required
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                placeholder="e.g. Grand Plaza Resort & Gardens, Napa Valley"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs shadow-lg shadow-rose-500/20 flex items-center gap-2 transition-all transform active:scale-95"
              >
                <Save className="w-4 h-4" /> Save Project Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: SECURITY & PRIVACY */}
      {activeTab === 'security' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Guest Portal PIN Protection */}
          <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-5 border border-slate-100 dark:border-slate-800 shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-start gap-3.5">
                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-500">
                  <Key className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-slate-900 dark:text-slate-100">
                    Public RSVP Portal PIN Protection
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Require invited guests to enter a 4-digit PIN code before viewing wedding details or submitting their RSVP.
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rsvpPinEnabled}
                  onChange={(e) => setRsvpPinEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-rose-500"></div>
              </label>
            </div>

            {rsvpPinEnabled ? (
              <div className="p-5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-rose-900 dark:text-rose-200 block">
                    Active RSVP Passcode
                  </span>
                  <span className="text-[11px] text-rose-600 dark:text-rose-400">
                    Share this code on your printed invitations or email announcements.
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type={showPin ? 'text' : 'password'}
                      maxLength={6}
                      value={rsvpPin}
                      onChange={(e) => setRsvpPin(e.target.value)}
                      className="w-32 px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-800 bg-white dark:bg-slate-900 font-mono text-center font-bold text-sm tracking-widest text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-rose-600"
                    >
                      {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setSavedSuccess(true);
                      setTimeout(() => setSavedSuccess(false), 2000);
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-sm transition-all"
                  >
                    Set PIN
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 text-xs flex items-center justify-between">
                <span>PIN protection is currently disabled. Anyone with your public RSVP link can submit their response.</span>
                <button
                  onClick={() => setRsvpPinEnabled(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-rose-500 hover:text-white font-semibold transition-all shrink-0"
                >
                  Enable PIN
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: APP PREFERENCES */}
      {activeTab === 'preferences' && (
        <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-6 border border-slate-100 dark:border-slate-800 shadow-xl animate-in fade-in duration-200 text-xs">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-slate-100">
              Localization & Global Currency Standards
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select your primary world currency and preferred timezone for budget reporting and schedule reminders.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-2 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-500" /> Default World Currency
              </label>
              <select
                value={currency}
                onChange={(e) => {
                  setCurrency(e.target.value);
                  updateWedding({ currency: e.target.value });
                }}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-rose-500 max-h-60"
              >
                {worldCurrencies.map((c) => (
                  <option key={c.code} value={`${c.symbol} (${c.code})`}>
                    {c.symbol} - {c.name}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Updates currency notation across your budget tracker, vendor quotes, and financial analytics reports.
              </p>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-2 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-rose-500" /> Timezone Standard
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-rose-500"
              >
                <option value="America/New_York">Eastern Time (US & Canada - EST/EDT)</option>
                <option value="America/Chicago">Central Time (US & Canada - CST/CDT)</option>
                <option value="America/Denver">Mountain Time (US & Canada - MST/MDT)</option>
                <option value="America/Los_Angeles">Pacific Time (US & Canada - PST/PDT)</option>
                <option value="America/Anchorage">Alaska Time (US & Canada)</option>
                <option value="Pacific/Honolulu">Hawaii Time (US)</option>
                <option value="America/Sao_Paulo">Brasilia Time (South America)</option>
                <option value="Europe/London">Greenwich Mean Time (London / UK)</option>
                <option value="Europe/Paris">Central European Time (Paris, Berlin, Rome)</option>
                <option value="Europe/Helsinki">Eastern European Time (Helsinki, Athens)</option>
                <option value="Asia/Dubai">Gulf Standard Time (Dubai, UAE)</option>
                <option value="Asia/Kolkata">India Standard Time (IST - Mumbai, New Delhi)</option>
                <option value="Asia/Bangkok">Indochina Time (Bangkok, Vietnam)</option>
                <option value="Asia/Singapore">Singapore / Malaysia Standard Time</option>
                <option value="Asia/Tokyo">Japan Standard Time (Tokyo, Osaka)</option>
                <option value="Asia/Seoul">Korea Standard Time (Seoul)</option>
                <option value="Australia/Sydney">Australian Eastern Time (Sydney, Melbourne)</option>
                <option value="Pacific/Auckland">New Zealand Standard Time (Auckland)</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Ensures vendor meetings, itinerary reminders, and RSVP countdown timers synchronize accurately.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              onClick={() => {
                updateWedding({ currency });
                setSavedSuccess(true);
                setTimeout(() => setSavedSuccess(false), 2000);
              }}
              className="px-6 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs shadow-lg shadow-rose-500/20 flex items-center gap-2 transition-all transform active:scale-95"
            >
              <Save className="w-4 h-4" /> Save Preferences
            </button>
          </div>
        </div>
      )}

      {/* Danger Zone: Global Data Reset */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-red-200 dark:border-red-900/50 bg-red-50/40 dark:bg-red-950/20 shadow-xl mt-8 transition-all">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-serif font-bold text-base sm:text-lg text-red-700 dark:text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-500 shrink-0" />
              Danger Zone: Reset Database
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-xl leading-relaxed">
              Need a fresh start? Resetting will overwrite all your custom guests, seating plans, budget items, and timeline schedules, restoring the default sample dataset.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-red-500/20 flex items-center gap-2 transition-all shrink-0 active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Reset Project Data
          </button>
        </div>
      </div>

      {/* Warning Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 transform transition-all scale-100">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/60 flex items-center justify-center text-red-600 dark:text-red-400 mx-auto">
              <AlertTriangle className="w-6 h-6 animate-bounce" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-serif font-bold text-lg sm:text-xl text-slate-900 dark:text-slate-100">
                Are you absolutely sure?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                This action will permanently reset your wedding project database. All custom guests, seating arrangements, tasks, vendor quotes, and budget logs will be overwritten with sample data.
              </p>
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-left text-xs font-medium flex items-start gap-2 mt-3">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                <span>⚠️ This cannot be undone. Please confirm if you wish to proceed.</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-red-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Yes, Reset Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Success Toast */}
      {resetSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-semibold animate-in slide-in-from-bottom duration-300">
          <CheckCircle2 className="w-5 h-5" /> Database successfully reset to initial state!
        </div>
      )}
    </div>
  );
};
