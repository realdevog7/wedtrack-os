import React, { useState, useEffect } from 'react';
import {
  Heart,
  Sparkles,
  Calendar,
  MapPin,
  PiggyBank,
  Users,
  ChevronRight,
  ChevronLeft,
  Check,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  PartyPopper,
  X,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { checkEmailWhitelist } from '../utils/whitelist';
import { useWedding } from '../contexts/WeddingContext';
import { getCurrencySymbol } from '../utils/currency';

export interface OnboardingData {
  partner1Name: string;
  partner2Name: string;
  email: string;
  password: string;
  weddingDate: string;
  estimatedGuests: number;
  weddingType: string;
  weddingStyle: string;
  venueName: string;
  venueAddress: string;
  venueType: 'indoor' | 'outdoor' | 'both';
  season: string;
  totalBudget: number;
  budgetPriorities: string[];
  budgetFlexibility: 'strict' | 'moderate' | 'flexible';
  collaborators: { name: string; email: string; role: 'Editor' | 'Viewer' }[];
}

export interface OnboardingProps {
  onComplete: (data: OnboardingData) => void;
}

const initialData: OnboardingData = {
  partner1Name: '',
  partner2Name: '',
  email: '',
  password: '',
  weddingDate: '',
  estimatedGuests: 100,
  weddingType: 'Traditional',
  weddingStyle: 'Romantic',
  venueName: '',
  venueAddress: '',
  venueType: 'both',
  season: 'Spring',
  totalBudget: 15000,
  budgetPriorities: [],
  budgetFlexibility: 'moderate',
  collaborators: [{ name: '', email: '', role: 'Editor' }],
};

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const { wedding, login } = useWedding();
  const sym = getCurrencySymbol(wedding?.currency);
  const [step, setStep] = useState(0);
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');
  const [data, setData] = useState<OnboardingData>(initialData);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [whitelistError, setWhitelistError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAuthSubmit = async (e?: React.FormEvent, forceSkipToDashboard: boolean = false) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!data.email || !data.password) {
      setWhitelistError('Please enter both your email address and password.');
      return;
    }
    setVerifyingEmail(true);
    setWhitelistError(null);
    try {
      const res = await checkEmailWhitelist(data.email, data.password);
      if (!res.allowed) {
        setWhitelistError(res.reason || 'Authentication failed. Please check your credentials.');
        setVerifyingEmail(false);
        return;
      }
      setConfirmPassword(data.password);
      const isProjectConfigured = Boolean(
        wedding?.onboardingComplete ||
        (wedding?.partner1Name && wedding?.partner1Name.trim() !== '' && wedding?.partner1Name !== 'Partner 1') ||
        (wedding?.totalBudget && wedding?.totalBudget > 0)
      );
      const isSetupDone = forceSkipToDashboard || isProjectConfigured;
      if (isSetupDone) {
        localStorage.setItem(`wedtrack_setup_done_${data.email.trim().toLowerCase()}`, 'true');
        if (login) {
          login(data.email);
        } else {
          onComplete({
            ...data,
            partner1Name: wedding?.partner1Name || data.partner1Name || 'Partner 1',
            partner2Name: wedding?.partner2Name || data.partner2Name || 'Partner 2',
            weddingDate: wedding?.weddingDate || data.weddingDate || '2027-06-18',
            totalBudget: wedding?.totalBudget || data.totalBudget || 15000,
          });
        }
      } else {
        setStep(1);
      }
    } catch (err) {
      console.error('Error verifying email & password:', err);
      setWhitelistError('An error occurred during verification. Please try again.');
    } finally {
      setVerifyingEmail(false);
    }
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!data.partner1Name) newErrors.partner1Name = 'Required';
      if (!data.partner2Name) newErrors.partner2Name = 'Required';
    } else if (step === 2) {
      if (!data.weddingDate) newErrors.weddingDate = 'Required';
    } else if (step === 3) {
      // Allow empty if 'still searching' logic could be added
    } else if (step === 4) {
      if (data.totalBudget <= 0) newErrors.totalBudget = 'Must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handlePrev = () => {
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const handleComplete = () => {
    if (validateStep()) {
      if (data.email) {
        localStorage.setItem(`wedtrack_setup_done_${data.email.trim().toLowerCase()}`, 'true');
      }
      onComplete(data);
    }
  };

  const handleChange = (field: keyof OnboardingData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const toggleBudgetPriority = (priority: string) => {
    const priorities = data.budgetPriorities.includes(priority)
      ? data.budgetPriorities.filter((p) => p !== priority)
      : [...data.budgetPriorities, priority];
    handleChange('budgetPriorities', priorities);
  };

  const addCollaborator = () => {
    handleChange('collaborators', [...data.collaborators, { name: '', email: '', role: 'Editor' }]);
  };

  const removeCollaborator = (index: number) => {
    const newCollabs = data.collaborators.filter((_, i) => i !== index);
    handleChange('collaborators', newCollabs);
  };

  const updateCollaborator = (index: number, field: string, value: string) => {
    const newCollabs = [...data.collaborators];
    newCollabs[index] = { ...newCollabs[index], [field]: value };
    handleChange('collaborators', newCollabs);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-100 via-white to-amber-100 p-4 md:p-8 font-sans overflow-hidden">
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .step-container {
          animation: slideInRight 0.4s ease-out forwards;
        }
        @keyframes confettiFall {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .confetti-piece {
          position: absolute;
          width: 10px;
          height: 20px;
          background: #f43f5e;
          top: -20px;
          animation: confettiFall 3s linear infinite;
        }
      `}</style>
      
      {step === 6 && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                backgroundColor: ['#f43f5e', '#fbbf24', '#3b82f6', '#10b981', '#a855f7'][Math.floor(Math.random() * 5)]
              }}
            />
          ))}
        </div>
      )}

      <div className="w-full max-w-3xl bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 overflow-hidden flex flex-col relative z-10 min-h-[600px]">
        {/* Header / Progress */}
        <div className="px-8 py-6 border-b border-gray-200/50 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="font-serif text-2xl font-semibold text-gray-800 flex items-center gap-2">
              <Heart className="w-6 h-6 text-rose-500 fill-rose-500/20" />
              WedTrack OS
            </h1>
            <span className="text-sm font-medium text-gray-500">
              {step === 0 ? 'Account Access' : `Step ${step} of 5`}
            </span>
          </div>
          {step > 0 && (
            <div className="w-full flex justify-between gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    i <= step ? 'bg-rose-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="step-container h-full" key={step}>
            {step === 0 && (
              <div className="max-w-md mx-auto space-y-5 py-2">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-rose-100 text-rose-500 mb-3 shadow-sm">
                    <Heart className="w-7 h-7 fill-rose-500/20" />
                  </div>
                  <h2 className="font-serif text-2xl text-gray-800 mb-1 font-bold">Welcome to WedTrack OS</h2>
                  <p className="text-gray-600 text-xs">
                    Enter your whitelisted Etsy order email and access PIN to launch your wedding suite.
                  </p>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Etsy Order Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={data.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="registered-email@gmail.com"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 font-medium shadow-sm focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all text-xs"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-gray-700">
                        Access Password / PIN
                      </label>
                      <span className="text-[10px] text-gray-400">
                        Check your Etsy purchase note
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={data.password}
                        onChange={(e) => handleChange('password', e.target.value)}
                        placeholder="e.g. Sarah#2026 or password"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 font-medium shadow-sm focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all pr-10 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {whitelistError && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl flex items-start gap-2.5 text-left shadow-sm">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                      <div className="text-xs">
                        <p className="font-bold text-xs mb-0.5">Authentication Required</p>
                        <p className="text-rose-600 text-[11px] leading-relaxed">{whitelistError}</p>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={verifyingEmail || !data.email || !data.password}
                    className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-amber-500 text-white rounded-xl font-bold hover:from-rose-600 hover:to-amber-600 transition-all shadow-lg shadow-rose-200 hover:shadow-xl hover:shadow-rose-200 active:scale-95 flex items-center justify-center gap-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed mt-3"
                  >
                    {verifyingEmail ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Verifying Credentials...
                      </>
                    ) : (
                      <>
                        ✨ Access My Wedding Suite <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleAuthSubmit(e, true)}
                    className="w-full py-2 text-gray-500 hover:text-gray-800 transition-colors text-[11px] font-semibold mt-1 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    Already configured your wedding? Skip directly to Dashboard →
                  </button>
                </form>

                <div className="text-center pt-2 border-t border-gray-100">
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Need help? Contact the seller via Etsy messages to retrieve your whitelisted email and auto-generated password.
                  </p>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="max-w-xl mx-auto space-y-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 text-rose-500 mb-4 shadow-sm">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <h2 className="font-serif text-3xl text-gray-800 mb-2 font-bold">Welcome to your journey</h2>
                  <p className="text-gray-600 text-sm">Let's personalize your account and meet the couple.</p>
                </div>
                
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-2xl flex items-center justify-between text-xs font-medium shadow-sm mb-4">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Verified Etsy Account: <strong className="font-bold">{data.email}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="text-emerald-700 hover:underline text-[11px] font-bold"
                  >
                    Change Account
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Partner 1 Name</label>
                    <input
                      type="text"
                      value={data.partner1Name}
                      onChange={(e) => handleChange('partner1Name', e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl border bg-white text-gray-900 placeholder:text-gray-400 font-medium shadow-sm focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all ${errors.partner1Name ? 'border-red-500' : 'border-gray-200'}`}
                      placeholder="Jane Doe"
                    />
                    {errors.partner1Name && <p className="text-red-500 text-xs mt-1">{errors.partner1Name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Partner 2 Name</label>
                    <input
                      type="text"
                      value={data.partner2Name}
                      onChange={(e) => handleChange('partner2Name', e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl border bg-white text-gray-900 placeholder:text-gray-400 font-medium shadow-sm focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all ${errors.partner2Name ? 'border-red-500' : 'border-gray-200'}`}
                      placeholder="John Smith"
                    />
                    {errors.partner2Name && <p className="text-red-500 text-xs mt-1">{errors.partner2Name}</p>}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="max-w-xl mx-auto space-y-8">
                <div className="text-center mb-6">
                  <h2 className="font-serif text-3xl text-gray-800 mb-2">The Big Day</h2>
                  <p className="text-gray-600">Tell us about your wedding vision.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-rose-500" /> Wedding Date
                  </label>
                  <input
                    type="date"
                    value={data.weddingDate}
                    onChange={(e) => handleChange('weddingDate', e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border bg-white text-gray-900 placeholder:text-gray-400 font-medium shadow-sm focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all ${errors.weddingDate ? 'border-red-500' : 'border-gray-200'}`}
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Users className="w-4 h-4 text-rose-500" /> Estimated Guests
                    </label>
                    <span className="text-rose-600 font-semibold">{data.estimatedGuests}</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="500"
                    step="10"
                    value={data.estimatedGuests}
                    onChange={(e) => handleChange('estimatedGuests', parseInt(e.target.value))}
                    className="w-full h-2 bg-rose-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>20</span>
                    <span>500+</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Wedding Type</label>
                    <select
                      value={data.weddingType}
                      onChange={(e) => handleChange('weddingType', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 font-medium shadow-sm focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all appearance-none"
                    >
                      {['Traditional', 'Destination', 'Intimate/Elopement', 'Cultural', 'Garden Party', 'Black Tie Gala'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Wedding Style</label>
                    <select
                      value={data.weddingStyle}
                      onChange={(e) => handleChange('weddingStyle', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 font-medium shadow-sm focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all appearance-none"
                    >
                      {['Romantic', 'Modern Minimalist', 'Rustic Chic', 'Bohemian', 'Classic Elegance', 'Glamorous', 'Vintage'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="max-w-xl mx-auto space-y-8">
                <div className="text-center mb-6">
                  <h2 className="font-serif text-3xl text-gray-800 mb-2">Location, Location</h2>
                  <p className="text-gray-600">Where will the magic happen?</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-rose-500" /> Venue Name</span>
                    </label>
                    <input
                      type="text"
                      value={data.venueName}
                      onChange={(e) => handleChange('venueName', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 font-medium shadow-sm focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all"
                      placeholder="e.g. The Grand Plaza (or 'Still searching')"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City / Address</label>
                    <input
                      type="text"
                      value={data.venueAddress}
                      onChange={(e) => handleChange('venueAddress', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 font-medium shadow-sm focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all"
                      placeholder="e.g. New York, NY"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Venue Setting</label>
                  <div className="flex gap-4">
                    {['indoor', 'outdoor', 'both'].map((type) => (
                      <label key={type} className={`flex-1 cursor-pointer rounded-xl border p-4 text-center transition-all ${data.venueType === type ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-sm' : 'border-gray-200 bg-white hover:border-rose-200'}`}>
                        <input type="radio" className="hidden" checked={data.venueType === type} onChange={() => handleChange('venueType', type)} />
                        <span className="capitalize font-medium">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Preferred Season</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['Spring', 'Summer', 'Fall', 'Winter'].map((s) => (
                      <label key={s} className={`cursor-pointer rounded-xl border py-2 text-center transition-all ${data.season === s ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-sm' : 'border-gray-200 bg-white hover:border-rose-200'}`}>
                        <input type="radio" className="hidden" checked={data.season === s} onChange={() => handleChange('season', s)} />
                        <span className="text-sm font-medium">{s}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="max-w-xl mx-auto space-y-8">
                <div className="text-center mb-6">
                  <h2 className="font-serif text-3xl text-gray-800 mb-2">Budget Planning</h2>
                  <p className="text-gray-600">Let's talk numbers so we can keep you on track.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <PiggyBank className="w-4 h-4 text-rose-500" /> Total Budget
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-2.5 text-gray-500 font-medium">{sym}</span>
                    <input
                      type="number"
                      value={data.totalBudget || ''}
                      onChange={(e) => handleChange('totalBudget', parseFloat(e.target.value) || 0)}
                      className={`w-full pl-8 pr-4 py-2.5 rounded-xl border bg-white text-gray-900 placeholder:text-gray-400 font-medium shadow-sm focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all text-lg font-medium ${errors.totalBudget ? 'border-red-500' : 'border-gray-200'}`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Top Priorities (Select all that apply)</label>
                  <div className="flex flex-wrap gap-2">
                    {['Venue', 'Food & Drinks', 'Photography', 'Flowers & Decor', 'Entertainment', 'Attire', 'Stationery', 'Transportation'].map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleBudgetPriority(item)}
                        className={`px-4 py-2 rounded-full border text-sm transition-all ${data.budgetPriorities.includes(item) ? 'border-rose-500 bg-rose-500 text-white shadow-md' : 'border-gray-200 bg-white text-gray-600 hover:border-rose-300'}`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Budget Flexibility</label>
                  <div className="flex gap-4">
                    {['strict', 'moderate', 'flexible'].map((flex) => (
                      <label key={flex} className={`flex-1 cursor-pointer rounded-xl border p-3 text-center transition-all ${data.budgetFlexibility === flex ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-sm' : 'border-gray-200 bg-white hover:border-rose-200'}`}>
                        <input type="radio" className="hidden" checked={data.budgetFlexibility === flex} onChange={() => handleChange('budgetFlexibility', flex)} />
                        <span className="capitalize text-sm font-medium">{flex}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="max-w-2xl mx-auto space-y-8">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-500 text-white mb-4 shadow-lg shadow-rose-200">
                    <PartyPopper className="w-8 h-8" />
                  </div>
                  <h2 className="font-serif text-3xl text-gray-800 mb-2">Ready to Launch!</h2>
                  <p className="text-gray-600">Here's a quick summary of your beautiful plan.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/80 p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
                      <Heart className="w-4 h-4 text-rose-500" /> The Couple
                    </h3>
                    <p className="text-gray-600">{data.partner1Name} & {data.partner2Name}</p>
                    <p className="text-sm text-gray-500">{data.email}</p>
                  </div>
                  
                  <div className="bg-white/80 p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
                      <Calendar className="w-4 h-4 text-rose-500" /> The Details
                    </h3>
                    <p className="text-gray-600">{data.weddingDate ? new Date(data.weddingDate).toLocaleDateString() : 'TBD'}</p>
                    <p className="text-sm text-gray-500">{data.estimatedGuests} Guests • {data.weddingStyle}</p>
                  </div>

                  <div className="bg-white/80 p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
                      <MapPin className="w-4 h-4 text-rose-500" /> The Venue
                    </h3>
                    <p className="text-gray-600">{data.venueName || 'Still searching'}</p>
                    <p className="text-sm text-gray-500 capitalize">{data.venueType} • {data.season}</p>
                  </div>

                  <div className="bg-white/80 p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
                      <PiggyBank className="w-4 h-4 text-rose-500" /> The Budget
                    </h3>
                    <p className="text-gray-600">{sym}{data.totalBudget.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 capitalize">{data.budgetFlexibility} Flexibility</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        {step > 0 && (
          <div className="px-8 py-5 border-t border-gray-200/50 bg-white/50 flex justify-between items-center">
            <button
              onClick={handlePrev}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <ChevronLeft className="w-5 h-5" /> Back
            </button>
            
            {step < 5 ? (
              <button
                onClick={handleNext}
                disabled={verifyingEmail}
                className="flex items-center gap-2 px-6 py-2.5 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-all shadow-md shadow-rose-200 hover:shadow-lg hover:shadow-rose-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {verifyingEmail ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Verifying Etsy Access...
                  </>
                ) : (
                  <>
                    Next Step <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-rose-500 to-amber-500 text-white rounded-xl font-medium hover:from-rose-600 hover:to-amber-600 transition-all shadow-lg shadow-rose-200 hover:shadow-xl hover:shadow-rose-200 active:scale-95 text-lg"
              >
                <Sparkles className="w-5 h-5" /> Launch Your Wedding Planner
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
