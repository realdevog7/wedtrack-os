import React from 'react';
import { useWedding } from '../contexts/WeddingContext';
import { getCurrencySymbol } from '../utils/currency';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import {
  Download,
  FileText,
  TrendingUp,
  Users,
  Utensils,
  FileBarChart,
  ArrowRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  PieChart, 
  Pie, 
  FunnelChart, 
  Funnel, 
  LabelList 
} from 'recharts';

export const Analytics: React.FC = () => {
  const { wedding, guests, tasks, vendors, budgetItems, tables } = useWedding();
  const sym = getCurrencySymbol(wedding.currency);

  // -------------------------------------------------------------
  // Data Export Functions
  // -------------------------------------------------------------
  const exportExcelBudget = () => {
    const wsData = budgetItems.map((b) => ({
      Category: b.category,
      Description: b.description,
      Allocated: b.allocatedAmount,
      Actual: b.actualAmount,
      Paid: b.paidAmount,
    }));
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Budget Summary');
    XLSX.writeFile(wb, `Wedding_Budget_Summary_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportPDFMasterReport = () => {
    const pdf = new jsPDF();
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(20);
    pdf.text(`${wedding.partner1Name} & ${wedding.partner2Name} - Master Wedding Report`, 20, 25);

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Wedding Date: ${new Date(wedding.weddingDate).toLocaleDateString()}`, 20, 35);
    pdf.text(`Venue: ${wedding.venueName}`, 20, 42);

    pdf.setFont('helvetica', 'bold');
    pdf.text('Key Summary Metrics:', 20, 55);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`• Total Guests: ${guests.length}`, 25, 63);
    pdf.text(
      `• Confirmed Attending: ${guests.filter((g) => g.rsvpStatus === 'confirmed').length}`,
      25,
      70
    );
    pdf.text(`• Budget: ${sym}${wedding.totalBudget.toLocaleString()}`, 25, 77);
    pdf.text(
      `• Total Spent: ${sym}${budgetItems.reduce((s, b) => s + b.actualAmount, 0).toLocaleString()}`,
      25,
      84
    );
    pdf.save(`Master_Wedding_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // -------------------------------------------------------------
  // Data Aggregations for Charts
  // -------------------------------------------------------------

  // 1. Budget Breakdown
  const budgetByCategory = budgetItems.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.actualAmount;
    return acc;
  }, {} as Record<string, number>);

  const totalSpent = Object.values(budgetByCategory).reduce((a, b) => a + b, 0);
  
  const COLORS = ['#f43f5e', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#06b6d4', '#ec4899'];
  
  const budgetData = Object.entries(budgetByCategory)
    .sort((a, b) => b[1] - a[1]) // Sort largest to smallest
    .map(([name, value], index) => ({
      name,
      value,
      percentage: totalSpent > 0 ? Math.round((value / totalSpent) * 100) : 0,
      color: COLORS[index % COLORS.length]
    }));

  // 2. RSVP Funnel
  const totalInvited = guests.length;
  const totalAttending = guests.filter(g => g.rsvpStatus === 'confirmed').length;
  const totalDeclined = guests.filter(g => g.rsvpStatus === 'declined').length;
  const totalPending = guests.filter(g => !['confirmed', 'declined'].includes(g.rsvpStatus as string)).length;

  const rsvpFunnelData = [
    { name: 'Invited', value: totalInvited, fill: '#94a3b8', label: '100%' },
    { name: 'Attending', value: totalAttending, fill: '#10b981', label: `${totalInvited ? Math.round((totalAttending/totalInvited)*100) : 0}%` },
    { name: 'Pending', value: totalPending, fill: '#f59e0b', label: `${totalInvited ? Math.round((totalPending/totalInvited)*100) : 0}%` },
    { name: 'Declined', value: totalDeclined, fill: '#f43f5e', label: `${totalInvited ? Math.round((totalDeclined/totalInvited)*100) : 0}%` }
  ];

  // 3. Dietary Requirements
  const dietaryCounts: Record<string, number> = {
    'Regular': 0,
  };
  
  guests.forEach(g => {
    if (g.rsvpStatus !== 'confirmed') return;
    
    if (!g.dietaryRestrictions || g.dietaryRestrictions.length === 0) {
      dietaryCounts['Regular']++;
    } else {
      g.dietaryRestrictions.forEach(r => {
        dietaryCounts[r] = (dietaryCounts[r] || 0) + 1;
      });
    }
  });

  const totalDietary = Object.values(dietaryCounts).reduce((a, b) => a + b, 0);
  const DIETARY_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#f43f5e'];
  
  const dietaryData = Object.entries(dietaryCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], index) => ({
      name,
      value,
      percentage: totalDietary > 0 ? Math.round((value / totalDietary) * 100) : 0,
      color: DIETARY_COLORS[index % DIETARY_COLORS.length]
    }));

  // 4. Guest Distribution by Group
  const groupCounts: Record<string, number> = {};
  guests.forEach((g) => {
    groupCounts[g.groupCategory || 'Others'] = (groupCounts[g.groupCategory || 'Others'] || 0) + 1;
  });

  const groupData = Object.entries(groupCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count], index) => ({
      name,
      count,
      percentage: totalInvited > 0 ? ((count / totalInvited) * 100).toFixed(1) : '0',
      color: COLORS[index % COLORS.length]
    }));

  // Helper Custom Tooltips
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg">
          <p className="font-semibold text-slate-900 dark:text-white">{payload[0].name}</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {payload[0].payload.value !== undefined ? payload[0].payload.value : payload[0].value} 
            {payload[0].payload.percentage !== undefined ? ` (${payload[0].payload.percentage}%)` : ''}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto pb-28 md:pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl md:text-3xl text-slate-900 dark:text-slate-100">
            Analytics & Reports
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Comprehensive insights into your budget, guest list, and overall wedding progress.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={exportExcelBudget}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-sm font-semibold transition-all border border-emerald-200 dark:border-emerald-800/50"
          >
            <Download className="w-4 h-4" /> Export Excel
          </button>
          <button
            onClick={exportPDFMasterReport}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold shadow-md shadow-rose-500/20 transition-all"
          >
            <FileText className="w-4 h-4" /> PDF Report
          </button>
        </div>
      </div>

      {/* Top Row: 3 Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Budget Breakdown */}
        <div className="glass-panel rounded-3xl p-6 flex flex-col">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-6">Budget Breakdown</h3>
          <div className="flex-1 flex flex-col items-center">
            <div className="h-[220px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={budgetData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {budgetData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-slate-900 dark:text-white">
                  {sym}{totalSpent.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500 font-medium">Total Spent</span>
              </div>
            </div>
            
            {/* Custom Legend */}
            <div className="w-full mt-4 space-y-2">
              {budgetData.slice(0, 6).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600 dark:text-slate-300">{item.name}</span>
                  </div>
                  <div className="text-slate-500 font-medium text-xs">
                    {sym}{item.value.toLocaleString()} <span className="opacity-60">({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={exportExcelBudget} className="mt-4 text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1 self-start">
              View full budget report <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* RSVP Response Funnel */}
        <div className="glass-panel rounded-3xl p-6 flex flex-col">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-6">RSVP Response Funnel</h3>
          <div className="flex-1 flex flex-col">
            <div className="h-[250px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <FunnelChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Funnel
                    dataKey="value"
                    data={rsvpFunnelData}
                    isAnimationActive
                  >
                    <LabelList position="center" fill="#fff" stroke="none" dataKey="value" fontWeight="bold" />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </div>
            
            {/* Custom Legend */}
            <div className="w-full mt-2 space-y-2">
              {rsvpFunnelData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 dark:text-slate-300 w-20">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-bold text-xs" style={{ color: item.fill }}>
                    {item.label} <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-auto pt-4 text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1 self-start">
              View RSVP report <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Dietary Requirements */}
        <div className="glass-panel rounded-3xl p-6 flex flex-col">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-6">Dietary Requirements</h3>
          <div className="flex-1 flex flex-col items-center">
            <div className="h-[220px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dietaryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {dietaryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-slate-900 dark:text-white">
                  {totalAttending}
                </span>
                <span className="text-xs text-slate-500 font-medium">Attending</span>
              </div>
            </div>
            
            {/* Custom Legend */}
            <div className="w-full mt-4 space-y-2">
              {dietaryData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600 dark:text-slate-300">{item.name}</span>
                  </div>
                  <div className="text-slate-500 font-medium text-xs">
                    {item.value} <span className="opacity-60">({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1 self-start">
              View dietary report <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: 2 Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Guest Distribution (Spans 2 columns) */}
        <div className="glass-panel rounded-3xl p-6 lg:col-span-2 flex flex-col">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-6">Guest Distribution by Group</h3>
          <div className="flex-1 flex flex-col md:flex-row gap-8">
            <div className="h-[250px] flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={groupData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40}>
                    {groupData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                    <LabelList dataKey="count" position="top" fill="#64748b" fontSize={12} fontWeight="bold" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Custom Legend */}
            <div className="w-full md:w-64 space-y-4 pt-4">
              {groupData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">{item.name}</span>
                  <div className="text-slate-700 dark:text-slate-200 font-bold text-xs">
                    {item.count} <span className="opacity-50 font-normal">({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button className="mt-4 text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1 self-start">
            View demographics report <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Quick Insights */}
        <div className="glass-panel rounded-3xl p-6 flex flex-col">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-6">Quick Insights</h3>
          <div className="flex-1 space-y-4">
            
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Budget Status</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  You're {totalSpent <= wedding.totalBudget ? 'under' : 'over'} budget by <span className={totalSpent <= wedding.totalBudget ? 'text-emerald-600 font-semibold' : 'text-rose-500 font-semibold'}>{sym}{Math.abs(wedding.totalBudget - totalSpent).toLocaleString()}</span>
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">RSVP Rate</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">{totalInvited ? Math.round(((totalAttending + totalDeclined) / totalInvited) * 100) : 0}%</span> of guests have responded
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0">
                <Utensils className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Dietary Summary</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{totalDietary - dietaryCounts['Regular']} guests</span> have special dietary needs
                </p>
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                <FileBarChart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex flex-col items-start">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Reports</h4>
                <p className="text-xs text-slate-500 mt-0.5 mb-1">
                  Export detailed reports anytime
                </p>
                <button onClick={exportPDFMasterReport} className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                  Generate Master PDF →
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
