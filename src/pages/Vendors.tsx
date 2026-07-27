import React, { useState } from 'react';
import { useWedding } from '../contexts/WeddingContext';
import { getCurrencySymbol } from '../utils/currency';
import { Vendor, VendorCategory, VendorStatus, PaymentStatus } from '../types';
import {
  Briefcase,
  Plus,
  Star,
  CheckCircle2,
  Clock,
  DollarSign,
  Phone,
  Mail,
  Globe,
  Trash2,
  Edit2,
  MessageSquare,
  Sparkles,
  X,
} from 'lucide-react';

export const Vendors: React.FC = () => {
  const { wedding, vendors, addVendor, updateVendor, deleteVendor, addVendorLog } = useWedding();
  const sym = getCurrencySymbol(wedding.currency);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [showLogDrawer, setShowLogDrawer] = useState<Vendor | null>(null);

  // Vendor Form
  const [name, setName] = useState('');
  const [category, setCategory] = useState<VendorCategory>('Venue');
  const [customCategory, setCustomCategory] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<VendorStatus>('Inquiry');
  const [quotedCost, setQuotedCost] = useState<number>(0);
  const [actualCost, setActualCost] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Not paid');
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [rating, setRating] = useState<number>(5);
  const [notes, setNotes] = useState('');

  // Log entry form
  const [logSummary, setLogSummary] = useState('');
  const [logType, setLogType] = useState<'Call' | 'Email' | 'Meeting'>('Call');

  const baseCategories: VendorCategory[] = [
    'Venue',
    'Catering',
    'Photography',
    'Videography',
    'Flowers',
    'Music/DJ',
    'Attire',
    'Rentals',
    'Cake',
    'Hair & Makeup',
    'Other',
  ];

  const categories = Array.from(
    new Set([...baseCategories.filter((c) => c !== 'Other'), ...vendors.map((v) => v.category)])
  );
  if (!categories.includes('Other')) categories.push('Other');

  const handleOpenModal = (vendor?: Vendor) => {
    if (vendor) {
      setEditingVendor(vendor);
      setName(vendor.name);
      const isBase = baseCategories.includes(vendor.category) && vendor.category !== 'Other';
      setCategory(isBase ? vendor.category : 'Other');
      setCustomCategory(!isBase && vendor.category !== 'Other' ? vendor.category : '');
      setContactPerson(vendor.contactPerson);
      setPhone(vendor.phone);
      setEmail(vendor.email);
      setWebsite(vendor.website || '');
      setStatus(vendor.status);
      setQuotedCost(vendor.quotedCost);
      setActualCost(vendor.actualCost);
      setPaymentStatus(vendor.paymentStatus);
      setDepositAmount(vendor.depositAmount || 0);
      setRating(vendor.rating || 5);
      setNotes(vendor.notes || '');
    } else {
      setEditingVendor(null);
      setName('');
      setCategory('Venue');
      setCustomCategory('');
      setContactPerson('');
      setPhone('');
      setEmail('');
      setWebsite('');
      setStatus('Inquiry');
      setQuotedCost(0);
      setActualCost(0);
      setPaymentStatus('Not paid');
      setDepositAmount(0);
      setRating(5);
      setNotes('');
    }
    setShowVendorModal(true);
  };

  const handleSaveVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalCategory = category === 'Other' && customCategory.trim() ? customCategory.trim() : category;

    if (editingVendor) {
      updateVendor(editingVendor.id, {
        name,
        category: finalCategory as VendorCategory,
        contactPerson,
        phone,
        email,
        website,
        status,
        quotedCost,
        actualCost,
        paymentStatus,
        depositAmount,
        rating,
        notes,
      });
    } else {
      addVendor({
        name,
        category: finalCategory as VendorCategory,
        contactPerson,
        phone,
        email,
        website,
        status,
        quotedCost,
        actualCost,
        paymentStatus,
        depositAmount,
        rating,
        notes,
      });
    }
    setShowVendorModal(false);
  };

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showLogDrawer || !logSummary.trim()) return;
    addVendorLog(showLogDrawer.id, { type: logType, summary: logSummary });
    setLogSummary('');
  };

  const filteredVendors = vendors.filter((v) => {
    if (selectedCategory !== 'all' && v.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="p-3 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-lg sm:text-2xl md:text-3xl text-slate-900 dark:text-slate-100">
            Vendor Management & Directory
          </h1>
          <p className="text-xs text-slate-500">
            Manage vendor quotes, store contracts, track deposit milestones & communication logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-md shadow-rose-500/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Vendor
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs font-medium">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3.5 py-1.5 rounded-full transition-all shrink-0 ${
            selectedCategory === 'all'
              ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
          }`}
        >
          All Vendors ({vendors.length})
        </button>
        {categories.map((cat) => {
          const count = vendors.filter((v) => v.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-rose-500 text-white font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Vendor Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.map((vendor) => (
          <div
            key={vendor.id}
            className="glass-card rounded-3xl p-6 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                  {vendor.category}
                </span>

                <span
                  className={`text-[10px] font-semibold uppercase px-2.5 py-1 rounded-full ${
                    vendor.status === 'Confirmed'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : vendor.status === 'Quoted'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {vendor.status}
                </span>
              </div>

              <div>
                <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-slate-100">
                  {vendor.name}
                </h3>
                <p className="text-xs text-slate-500">Contact: {vendor.contactPerson}</p>
              </div>

              {/* Rating */}
              {vendor.rating && (
                <div className="flex items-center gap-1 text-amber-500 text-xs">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      className={`w-3.5 h-3.5 ${
                        idx < (vendor.rating || 0) ? 'fill-current' : 'text-slate-300'
                      }`}
                    />
                  ))}
                  <span className="text-slate-500 font-semibold ml-1">{vendor.rating}.0</span>
                </div>
              )}

              {/* Financial Summary */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Quoted Cost:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {sym}{vendor.quotedCost.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Status:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {vendor.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Action Controls */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setShowLogDrawer(vendor)}
                className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Logs ({vendor.communicationLog.length})
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenModal(vendor)}
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteVendor(vendor.id)}
                  className="p-1.5 rounded-lg hover:bg-rose-100 text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ADD/EDIT VENDOR MODAL */}
      {showVendorModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full mx-3 sm:mx-auto p-4 sm:p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif font-bold text-lg">
                {editingVendor ? 'Edit Vendor Record' : 'Add New Vendor'}
              </h3>
              <button onClick={() => setShowVendorModal(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVendor} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as VendorCategory)}
                    className="w-full px-3.5 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  {category === 'Other' && (
                    <div className="mt-2">
                      <input
                        type="text"
                        placeholder="Enter custom category name..."
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-rose-300 dark:border-rose-700 bg-rose-50/50 dark:bg-rose-950/30 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as VendorStatus)}
                    className="w-full px-3.5 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="Inquiry">Inquiry</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Quoted">Quoted</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">
                    Quoted Amount ({sym})
                  </label>
                  <input
                    type="number"
                    value={quotedCost}
                    onChange={(e) => setQuotedCost(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">
                    Payment Status
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                    className="w-full px-3.5 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="Not paid">Not paid</option>
                    <option value="Deposit paid">Deposit paid</option>
                    <option value="Fully paid">Fully paid</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowVendorModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-500 text-white font-semibold shadow-md"
                >
                  Save Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMMUNICATION LOG DRAWER MODAL */}
      {showLogDrawer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full mx-3 sm:mx-auto p-4 sm:p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-serif font-bold text-lg">{showLogDrawer.name} Logs</h3>
                <p className="text-xs text-slate-500">Communication log & call history</p>
              </div>
              <button onClick={() => setShowLogDrawer(null)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddLog} className="space-y-3">
              <div className="flex gap-2">
                <select
                  value={logType}
                  onChange={(e) => setLogType(e.target.value as any)}
                  className="px-3 py-2 rounded-xl border text-xs bg-slate-50 dark:bg-slate-800"
                >
                  <option value="Call">Call</option>
                  <option value="Email">Email</option>
                  <option value="Meeting">Meeting</option>
                </select>
                <input
                  type="text"
                  placeholder="Summary of call/email..."
                  value={logSummary}
                  onChange={(e) => setLogSummary(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border text-xs bg-slate-50 dark:bg-slate-800"
                />
                <button
                  type="submit"
                  className="px-3 py-2 rounded-xl bg-rose-500 text-white text-xs font-semibold"
                >
                  Log
                </button>
              </div>
            </form>

            <div className="space-y-2 max-h-60 overflow-y-auto text-xs">
              {showLogDrawer.communicationLog.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1"
                >
                  <div className="flex justify-between font-semibold">
                    <span>
                      {log.type} by {log.authorName}
                    </span>
                    <span className="text-[10px] text-slate-400">{log.date}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">{log.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
