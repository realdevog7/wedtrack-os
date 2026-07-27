import React from 'react';
import { useWedding } from '../contexts/WeddingContext';
import { getCurrencySymbol } from '../utils/currency';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import {
  BarChart3,
  Download,
  FileText,
  PieChart as PieIcon,
  CheckCircle2,
  Users,
  Briefcase,
  PiggyBank,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const Analytics: React.FC = () => {
  const { wedding, guests, tasks, vendors, budgetItems, tables } = useWedding();
  const sym = getCurrencySymbol(wedding.currency);

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

  const exportMasterChecklistPDF = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let currentY = 20;

    const checkPageBreak = (neededHeight: number) => {
      if (currentY + neededHeight > pageHeight - 15) {
        pdf.addPage();
        currentY = 20;
      }
    };

    // Title Banner
    pdf.setFillColor(225, 29, 72); // Rose 600
    pdf.rect(0, 0, pageWidth, 24, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(15);
    pdf.text('MASTER TIMELINE & CHECKLIST SCHEDULE', 15, 15);

    currentY = 35;
    pdf.setTextColor(30, 41, 59);
    pdf.setFontSize(11);
    pdf.text(`Wedding: ${wedding.partner1Name} & ${wedding.partner2Name}`, 15, currentY);
    pdf.text(`Date: ${new Date(wedding.weddingDate).toLocaleDateString()}`, pageWidth - 70, currentY);
    currentY += 8;

    const completed = tasks.filter((t) => t.status === 'done').length;
    pdf.setFontSize(10);
    pdf.text(`Total Tasks: ${tasks.length}   |   Completed: ${completed}   |   Pending: ${tasks.length - completed}`, 15, currentY);
    currentY += 6;

    pdf.setDrawColor(203, 213, 225);
    pdf.line(15, currentY, pageWidth - 15, currentY);
    currentY += 10;

    // List Tasks
    tasks.forEach((task) => {
      checkPageBreak(22);

      const statusText = task.status === 'done' ? '[DONE]' : task.status === 'in_progress' ? '[IN PROGRESS]' : '[TODO]';

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      if (task.status === 'done') pdf.setTextColor(16, 185, 129);
      else if (task.status === 'in_progress') pdf.setTextColor(245, 158, 11);
      else pdf.setTextColor(100, 116, 139);

      pdf.text(statusText, 15, currentY);

      pdf.setTextColor(15, 23, 42);
      pdf.text(`${task.title}`, 50, currentY);

      pdf.setFontSize(9);
      pdf.setTextColor(100, 116, 139);
      pdf.text(`[${task.category}]`, pageWidth - 45, currentY);
      currentY += 5;

      pdf.setFont('helvetica', 'normal');
      pdf.text(`Due Date: ${task.dueDate}   |   Priority: ${task.priority.toUpperCase()}`, 50, currentY);
      currentY += 5;

      if (task.description) {
        const lines = pdf.splitTextToSize(`Notes: ${task.description}`, pageWidth - 65);
        checkPageBreak(lines.length * 4 + 4);
        pdf.text(lines, 50, currentY);
        currentY += lines.length * 4 + 2;
      }

      currentY += 5;
      pdf.setDrawColor(241, 245, 249);
      pdf.line(15, currentY - 2, pageWidth - 15, currentY - 2);
    });

    pdf.save(`Master_Checklist_Schedule_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportGuestDietaryMatrixCSV = () => {
    const wsData = guests.map((g) => {
      const assignedTable = tables.find((t) => t.id === g.tableId);
      const tableNameStr = assignedTable
        ? `${assignedTable.tableName}${g.seatNumber ? ` (Seat ${g.seatNumber})` : ''}`
        : 'Unassigned';

      return {
        'Guest Name': `${g.firstName || ''} ${g.lastName || ''}`.trim() || 'Unnamed Guest',
        'RSVP Status': (g.rsvpStatus || 'invited').toUpperCase(),
        'Group / Side': g.groupCategory || 'Other',
        'Table Number': tableNameStr,
        'Meal Selection': g.mealPreference || 'Standard',
        'Dietary Restrictions': (g.dietaryRestrictions || []).join(', ') || 'None',
        'Allergies': g.allergies || 'None',
        'Plus One': g.hasPlusOne ? `Yes (${g.plusOneName || 'Unnamed'})` : 'No',
        'Plus One Meal': g.hasPlusOne ? g.plusOneMeal || 'Standard' : 'N/A',
        'Email Address': g.email || '',
        'Phone Number': g.phone || '',
        'Special Notes': g.notes || '',
      };
    });

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Dietary Matrix');
    XLSX.writeFile(wb, `Guest_List_Dietary_Matrix_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportVendorDirectoryPDF = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let currentY = 20;

    const checkPageBreak = (neededHeight: number) => {
      if (currentY + neededHeight > pageHeight - 15) {
        pdf.addPage();
        currentY = 20;
      }
    };

    // Title Banner
    pdf.setFillColor(79, 70, 229); // Indigo 600
    pdf.rect(0, 0, pageWidth, 24, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(15);
    pdf.text('VENDOR DIRECTORY & CONTRACTS', 15, 15);

    currentY = 35;
    pdf.setTextColor(30, 41, 59);
    pdf.setFontSize(11);
    pdf.text(`Wedding: ${wedding.partner1Name} & ${wedding.partner2Name}`, 15, currentY);
    pdf.text(`Date: ${new Date(wedding.weddingDate).toLocaleDateString()}`, pageWidth - 70, currentY);
    currentY += 8;

    const totalQuoted = vendors.reduce((s, v) => s + v.quotedCost, 0);
    const totalDeposit = vendors.reduce((s, v) => s + (v.depositAmount || 0), 0);
    pdf.setFontSize(10);
    pdf.text(`Total Vendors: ${vendors.length}   |   Quoted Total: ${sym}${totalQuoted.toLocaleString()}   |   Deposits Paid: ${sym}${totalDeposit.toLocaleString()}`, 15, currentY);
    currentY += 6;

    pdf.setDrawColor(203, 213, 225);
    pdf.line(15, currentY, pageWidth - 15, currentY);
    currentY += 10;

    // List Vendors
    vendors.forEach((vendor) => {
      checkPageBreak(32);

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.setTextColor(15, 23, 42);
      pdf.text(`${vendor.name}`, 15, currentY);

      pdf.setFontSize(10);
      pdf.setTextColor(79, 70, 229);
      pdf.text(`[${vendor.category} - ${vendor.status}]`, pageWidth - 75, currentY);
      currentY += 6;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(71, 85, 105);
      pdf.text(`Contact: ${vendor.contactPerson || 'N/A'}   |   Phone: ${vendor.phone || 'N/A'}   |   Email: ${vendor.email || 'N/A'}`, 15, currentY);
      currentY += 5;

      pdf.text(`Quoted Cost: ${sym}${vendor.quotedCost.toLocaleString()}   |   Actual: ${sym}${vendor.actualCost.toLocaleString()}   |   Payment: ${vendor.paymentStatus} (${sym}${vendor.depositAmount || 0} deposit)`, 15, currentY);
      currentY += 5;

      if (vendor.notes) {
        const lines = pdf.splitTextToSize(`Contract / Notes: ${vendor.notes}`, pageWidth - 30);
        checkPageBreak(lines.length * 4 + 4);
        pdf.text(lines, 15, currentY);
        currentY += lines.length * 4 + 2;
      }

      currentY += 6;
      pdf.setDrawColor(241, 245, 249);
      pdf.line(15, currentY - 2, pageWidth - 15, currentY - 2);
    });

    pdf.save(`Vendor_Directory_Contracts_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Group demographics data
  const groupCounts: Record<string, number> = {};
  guests.forEach((g) => {
    groupCounts[g.groupCategory] = (groupCounts[g.groupCategory] || 0) + 1;
  });

  const demoChartData = Object.entries(groupCounts).map(([grp, count]) => ({
    name: grp,
    count,
  }));

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl md:text-3xl text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Analytics & Master Export Hub
          </h1>
          <p className="text-xs text-slate-500">
            Generate printable PDF reports, export Excel budget sheets, and view guest demographic insights.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={exportExcelBudget}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all"
          >
            <Download className="w-4 h-4" /> Export Excel Budget
          </button>
          <button
            onClick={exportPDFMasterReport}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-md shadow-rose-500/20 transition-all"
          >
            <FileText className="w-4 h-4" /> Master PDF Report
          </button>
        </div>
      </div>

      {/* Analytics Visual Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel rounded-3xl p-6 space-y-4">
          <h3 className="font-serif font-bold text-base text-slate-900 dark:text-slate-100">
            Guest Demographic Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demoChartData}>
                <XAxis dataKey="name" stroke="#888888" fontSize={10} />
                <YAxis stroke="#888888" fontSize={10} />
                <Tooltip />
                <Bar dataKey="count" fill="#E11D48" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Report Download Cards */}
        <div className="glass-panel rounded-3xl p-6 space-y-4">
          <h3 className="font-serif font-bold text-base text-slate-900 dark:text-slate-100">
            Exportable Report Packages
          </h3>
          <div className="space-y-3">
            {[
              {
                title: 'Master Checklist (PDF)',
                desc: 'Full timeline schedule with completion status and assignees.',
                action: exportMasterChecklistPDF,
              },
              {
                title: 'Guest List & Dietary Matrix (CSV)',
                desc: 'All invited guests with meal selections, allergies, and plus-ones.',
                action: exportGuestDietaryMatrixCSV,
              },
              {
                title: 'Vendor Directory & Contracts (PDF)',
                desc: 'Complete contact list, quoted costs, and payment milestones.',
                action: exportVendorDirectoryPDF,
              },
            ].map((rep, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
              >
                <div>
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                    {rep.title}
                  </h4>
                  <p className="text-xs text-slate-500">{rep.desc}</p>
                </div>
                <button
                  onClick={rep.action}
                  className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-rose-500 hover:text-white text-xs font-semibold transition-all"
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
