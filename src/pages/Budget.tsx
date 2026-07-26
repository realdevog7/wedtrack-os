import React, { useState } from 'react';
import { useWedding } from '../contexts/WeddingContext';
import { BudgetItem } from '../types';
import {
  PieChart as PieIcon,
  PiggyBank,
  TrendingUp,
  Plus,
  AlertTriangle,
  AlertCircle,
  Calculator,
  Trash2,
  Edit2,
  DollarSign,
  X,
  Sparkles,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export const Budget: React.FC = () => {
  const { wedding, budgetItems, updateWedding, addBudgetItem, updateBudgetItem, deleteBudgetItem } =
    useWedding();

  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);

  // Tip Calculator state
  const [tipVendorCost, setTipVendorCost] = useState<number>(2000);
  const [tipPercent, setTipPercent] = useState<number>(15);

  // Form state
  const [category, setCategory] = useState<string>('Venue');
  const [customCategory, setCustomCategory] = useState('');
  const [description, setDescription] = useState('');
  const [allocatedAmount, setAllocatedAmount] = useState<number>(0);
  const [actualAmount, setActualAmount] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);

  const totalBudget = wedding.totalBudget;
  const totalAllocated = budgetItems.reduce((sum, b) => sum + b.allocatedAmount, 0);
  const totalSpent = budgetItems.reduce((sum, b) => sum + b.actualAmount, 0);
  const totalPaid = budgetItems.reduce((sum, b) => sum + b.paidAmount, 0);
  const remainingBudget = totalBudget - totalSpent;
  const spentRatio = Math.round((totalSpent / totalBudget) * 100);

  // Chart dataset for category pie chart (uses actualAmount, or falls back to allocatedAmount if actual is 0)
  const categoryMap: Record<string, number> = {};
  budgetItems.forEach((item) => {
    const amount = item.actualAmount > 0 ? item.actualAmount : item.allocatedAmount;
    if (amount > 0) {
      categoryMap[item.category] = (categoryMap[item.category] || 0) + amount;
    }
  });

  const pieChartData = Object.entries(categoryMap).map(([cat, val]) => ({
    name: cat,
    value: val,
  }));

  const baseCategories = [
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
    'General',
    'Other',
  ];
  const categories = Array.from(
    new Set([...baseCategories.filter((c) => c !== 'Other'), ...budgetItems.map((b) => b.category)])
  );
  if (!categories.includes('Other')) categories.push('Other');

  const COLORS = ['#E11D48', '#F59E0B', '#10B981', '#6366F1', '#8B5CF6', '#EC4899', '#06B6D4'];

  const barChartData = budgetItems.map((b) => ({
    name: b.description.length > 15 ? b.description.slice(0, 15) + '...' : b.description,
    Allocated: b.allocatedAmount,
    Actual: b.actualAmount,
  }));

  const handleOpenModal = (item?: BudgetItem) => {
    if (item) {
      setEditingItem(item);
      const isBase = baseCategories.includes(item.category) && item.category !== 'Other';
      setCategory(isBase ? item.category : 'Other');
      setCustomCategory(!isBase && item.category !== 'Other' ? item.category : '');
      setDescription(item.description);
      setAllocatedAmount(item.allocatedAmount);
      setActualAmount(item.actualAmount);
      setPaidAmount(item.paidAmount);
    } else {
      setEditingItem(null);
      setCategory('Venue');
      setCustomCategory('');
      setDescription('');
      setAllocatedAmount(0);
      setActualAmount(0);
      setPaidAmount(0);
    }
    setShowItemModal(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const finalCategory = category === 'Other' && customCategory.trim() ? customCategory.trim() : category;

    if (editingItem) {
      updateBudgetItem(editingItem.id, {
        category: finalCategory as any,
        description,
        allocatedAmount,
        actualAmount,
        paidAmount,
      });
    } else {
      addBudgetItem({
        category: finalCategory as any,
        description,
        allocatedAmount,
        actualAmount,
        paidAmount,
      });
    }
    setShowItemModal(false);
  };

  const calculatedTipAmount = Math.round(tipVendorCost * (tipPercent / 100));

  return (
    <div className="p-3 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-lg sm:text-2xl md:text-3xl text-slate-900 dark:text-slate-100">
            Budget Tracker & Forecast
          </h1>
          <p className="text-xs text-slate-500">
            Track allocated vs actual expenses, spending alerts, tip calculator, and cost forecast.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-md shadow-rose-500/20 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Expense
        </button>
      </div>

      {/* Alert Banner if over budget */}
      {spentRatio >= 90 && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 animate-bounce" />
          <div>
            <span className="font-bold">Budget Warning:</span> You have utilized {spentRatio}% of
            your overall ${totalBudget.toLocaleString()} wedding budget.
          </div>
        </div>
      )}

      {/* 4 Budget Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card rounded-2xl p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Total Target Budget
          </p>
          <h3 className="font-serif font-bold text-2xl mt-1 text-slate-900 dark:text-slate-100">
            ${totalBudget.toLocaleString()}
          </h3>
          <span className="text-[11px] text-slate-400">Set in Wedding Settings</span>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Total Allocated
          </p>
          <h3 className="font-serif font-bold text-2xl mt-1 text-slate-900 dark:text-slate-100">
            ${totalAllocated.toLocaleString()}
          </h3>
          <span className="text-[11px] text-slate-400">Sum of estimated category limits</span>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Actual Spent
          </p>
          <h3 className="font-serif font-bold text-2xl mt-1 text-rose-600 dark:text-rose-400">
            ${totalSpent.toLocaleString()}
          </h3>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            ${totalPaid.toLocaleString()} Deposit Paid
          </span>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Remaining Funds
          </p>
          <h3
            className={`font-serif font-bold text-2xl mt-1 ${
              remainingBudget < 0 ? 'text-rose-600' : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            ${remainingBudget.toLocaleString()}
          </h3>
          <span className="text-[11px] text-slate-400">Available to allocate</span>
        </div>
      </div>

      {/* Recharts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart Category Breakdown */}
        <div className="glass-panel rounded-3xl p-6 space-y-4">
          <h3 className="font-serif font-bold text-base text-slate-900 dark:text-slate-100">
            Category Breakdown
          </h3>
          <div className="h-64">
            {pieChartData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-4">
                <p className="text-xs font-semibold">No category breakdown available</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Add allocated or actual expense amounts to see chart</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Bar Chart Allocated vs Actual */}
        <div className="glass-panel rounded-3xl p-6 space-y-4">
          <h3 className="font-serif font-bold text-base text-slate-900 dark:text-slate-100">
            Allocated vs Actual Spending
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData}>
                <XAxis dataKey="name" stroke="#888888" fontSize={10} />
                <YAxis stroke="#888888" fontSize={10} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Allocated" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Actual" fill="#E11D48" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Budget Item Table & Tip Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expense List Table */}
        <div className="glass-panel rounded-3xl p-6 lg:col-span-2 space-y-4">
          <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-slate-100">
            Detailed Expenses List
          </h3>
          <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0 text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-semibold">
                  <th className="py-3">Description</th>
                  <th className="py-3">Category</th>
                  <th className="py-3">Allocated</th>
                  <th className="py-3">Actual</th>
                  <th className="py-3">Paid</th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {budgetItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 font-semibold text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-2">
                        {item.description}
                        {item.vendorId && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
                            Vendor
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 text-slate-500">{item.category}</td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">
                      ${item.allocatedAmount.toLocaleString()}
                    </td>
                    <td className="py-3 font-bold text-rose-600 dark:text-rose-400">
                      ${item.actualAmount.toLocaleString()}
                    </td>
                    <td className="py-3 text-emerald-600 dark:text-emerald-400 font-semibold">
                      ${item.paidAmount.toLocaleString()}
                    </td>
                    <td className="py-3 text-right space-x-1">
                      <button
                        onClick={() => handleOpenModal(item)}
                        className="p-1 text-slate-400 hover:text-slate-700"
                        title={item.vendorId ? "View Details (Managed in Vendors)" : "Edit Expense"}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {!item.vendorId && (
                        <button
                          onClick={() => deleteBudgetItem(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tip & Gratuity Calculator Widget */}
        <div className="glass-panel rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-rose-500">
            <Calculator className="w-5 h-5" />
            <h3 className="font-serif font-bold text-base text-slate-900 dark:text-slate-100">
              Vendor Tip Calculator
            </h3>
          </div>

          <div className="space-y-3 text-xs font-medium">
            <div>
              <label className="block text-slate-500 mb-1">Contract / Bill Total ($)</label>
              <input
                type="number"
                value={tipVendorCost}
                onChange={(e) => setTipVendorCost(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-slate-500 mb-1">Tip Percentage (%)</label>
              <div className="flex gap-2">
                {[10, 15, 18, 20].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setTipPercent(pct)}
                    className={`flex-1 py-1.5 rounded-xl font-bold transition-all ${
                      tipPercent === pct
                        ? 'bg-rose-500 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-center space-y-1">
              <span className="text-slate-500 text-[11px] block">Suggested Gratuity Tip</span>
              <span className="font-serif font-bold text-2xl text-rose-600 dark:text-rose-400 block">
                ${calculatedTipAmount.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400">
                Total with Tip: ${(tipVendorCost + calculatedTipAmount).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ADD/EDIT ITEM MODAL */}
      {showItemModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full sm:max-w-md mx-3 sm:mx-auto p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif font-bold text-lg">
                {editingItem ? 'Edit Budget Expense' : 'Add New Expense Item'}
              </h3>
              <button onClick={() => setShowItemModal(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4 text-xs font-medium">
              {editingItem?.vendorId && (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800/50 flex items-start gap-2">
                  <div className="mt-0.5 shrink-0"><AlertCircle className="w-4 h-4" /></div>
                  <p>This is a synchronized Vendor Expense. To change these amounts, please update the vendor contract in the <b>Vendors</b> tab.</p>
                </div>
              )}
              
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Photography Drone Add-on"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800"
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-500 mb-1">Allocated ($)</label>
                  <input
                    type="number"
                    value={allocatedAmount}
                    onChange={(e) => setAllocatedAmount(Number(e.target.value))}
                    disabled={!!editingItem?.vendorId}
                    className="w-full px-2.5 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Actual ($)</label>
                  <input
                    type="number"
                    value={actualAmount}
                    onChange={(e) => setActualAmount(Number(e.target.value))}
                    disabled={!!editingItem?.vendorId}
                    className="w-full px-2.5 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Paid ($)</label>
                  <input
                    type="number"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(Number(e.target.value))}
                    disabled={!!editingItem?.vendorId}
                    className="w-full px-2.5 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800"
                >
                  {editingItem?.vendorId ? 'Close' : 'Cancel'}
                </button>
                {!editingItem?.vendorId && (
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-rose-500 text-white shadow-lg shadow-rose-500/30"
                  >
                    Save Expense
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
