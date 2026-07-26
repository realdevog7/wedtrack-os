import React, { useState, useRef } from 'react';
import { useWedding } from '../contexts/WeddingContext';
import { Table, Guest } from '../types';
import jsPDF from 'jspdf';
import {
  Grid2X2,
  Sparkles,
  Plus,
  Trash2,
  UserCheck,
  AlertTriangle,
  Download,
  Users,
  X,
  RotateCcw,
} from 'lucide-react';

export const Seating: React.FC = () => {
  const { guests, tables, runAutoSeating, addTable, deleteTable, assignGuestSeat } = useWedding();
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [showTableModal, setShowTableModal] = useState(false);

  // Table form state
  const [tableName, setTableName] = useState('');
  const [maxSeats, setMaxSeats] = useState(8);
  const [shape, setShape] = useState<Table['shape']>('round');

  const [seatingMetrics, setSeatingMetrics] = useState<{
    seatedCount: number;
    unassignedCount: number;
    score: number;
  } | null>(null);

  const floorPlanRef = useRef<HTMLDivElement>(null);

  const handleRunAlgorithm = () => {
    const res = runAutoSeating();
    setSeatingMetrics(res);
  };

  const handleAddTableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableName.trim()) return;

    addTable({
      tableName,
      maxSeats,
      shape,
      xPosition: 100 + (tables.length % 3) * 220,
      yPosition: 100 + Math.floor(tables.length / 3) * 180,
    });

    setTableName('');
    setShowTableModal(false);
  };

  const exportPDFSeatingChart = () => {
    try {
      const pdf = new jsPDF('landscape', 'pt', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 40;

      // Title Banner
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(22);
      pdf.setTextColor(136, 19, 55); // Rose 800
      pdf.text('Wedding Seating Chart & Floor Plan', margin, 45);

      // Subtitle / Metrics
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      pdf.setTextColor(100, 116, 139); // Slate 500
      const dateStr = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      pdf.text(
        `Generated on ${dateStr} | Active Tables: ${tables.length} | Seated Guests: ${seatedGuestIds.size} | Unassigned: ${unassignedGuests.length}`,
        margin,
        65
      );

      // Horizontal Divider Line
      pdf.setDrawColor(226, 232, 240);
      pdf.setLineWidth(1.5);
      pdf.line(margin, 78, pageWidth - margin, 78);

      // Grid Layout for Table Cards
      const columns = 3;
      const colGap = 20;
      const rowGap = 20;
      const cardWidth = (pageWidth - margin * 2 - colGap * (columns - 1)) / columns;
      const cardHeight = 180;
      let currentY = 95;

      tables.forEach((table, index) => {
        if (currentY + cardHeight > pageHeight - margin) {
          pdf.addPage();
          currentY = 50;
        }

        const colIndex = index % columns;
        const currentX = margin + colIndex * (cardWidth + colGap);

        // Draw Table Card outer box
        pdf.setFillColor(255, 255, 255);
        pdf.setDrawColor(203, 213, 225);
        pdf.setLineWidth(1);
        pdf.roundedRect(currentX, currentY, cardWidth, cardHeight, 8, 8, 'FD');

        // Draw Top Header Banner inside Table Card
        pdf.setFillColor(255, 241, 242); // Rose 50
        pdf.roundedRect(currentX, currentY, cardWidth, 34, 8, 8, 'F');
        pdf.rect(currentX, currentY + 18, cardWidth, 16, 'F');
        pdf.setDrawColor(251, 113, 133); // Rose 400
        pdf.line(currentX, currentY + 34, currentX + cardWidth, currentY + 34);

        // Table Name
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.setTextColor(190, 18, 60); // Rose 700
        const tableName = pdf.splitTextToSize(table.tableName, cardWidth - 70);
        pdf.text(tableName[0] || table.tableName, currentX + 12, currentY + 22);

        // Seat Capacity Badge
        const assignedGuests = guests.filter((g) => table.assignedGuestIds.includes(g.id));
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(100, 116, 139);
        const countText = `${assignedGuests.length}/${table.maxSeats || 8} Seats`;
        pdf.text(countText, currentX + cardWidth - 12 - pdf.getTextWidth(countText), currentY + 22);

        // List Assigned Guests inside Card
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(30, 41, 59);

        let guestY = currentY + 52;
        const maxGuestsToShow = 7;
        if (assignedGuests.length === 0) {
          pdf.setFont('helvetica', 'italic');
          pdf.setTextColor(148, 163, 184);
          pdf.text('No guests assigned yet', currentX + 12, guestY);
        } else {
          assignedGuests.slice(0, maxGuestsToShow).forEach((g) => {
            const guestName = `• ${g.firstName} ${g.lastName}`;
            const groupTag = g.groupCategory ? ` (${g.groupCategory})` : '';
            const fullStr = pdf.splitTextToSize(guestName + groupTag, cardWidth - 24)[0];
            pdf.text(fullStr, currentX + 12, guestY);
            guestY += 16;
          });

          if (assignedGuests.length > maxGuestsToShow) {
            pdf.setFont('helvetica', 'bolditalic');
            pdf.setTextColor(190, 18, 60);
            pdf.text(`+ ${assignedGuests.length - maxGuestsToShow} more guest(s)...`, currentX + 12, guestY);
          }
        }

        if (colIndex === columns - 1) {
          currentY += cardHeight + rowGap;
        }
      });

      if (tables.length % columns !== 0) {
        currentY += cardHeight + rowGap;
      }

      // Draw Unassigned Guests Section
      if (unassignedGuests.length > 0) {
        if (currentY + 100 > pageHeight - margin) {
          pdf.addPage();
          currentY = 50;
        } else {
          currentY += 10;
        }

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(14);
        pdf.setTextColor(180, 83, 9); // Amber 700
        pdf.text(`Unassigned Guests (${unassignedGuests.length} waiting for assignment)`, margin, currentY);
        currentY += 15;

        pdf.setDrawColor(251, 191, 36); // Amber 400
        pdf.setLineWidth(1);
        pdf.line(margin, currentY, pageWidth - margin, currentY);
        currentY += 18;

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(71, 85, 105);

        const namesList = unassignedGuests.map((g) => `${g.firstName} ${g.lastName} (${g.groupCategory})`).join('  •  ');
        const wrappedNames = pdf.splitTextToSize(namesList, pageWidth - margin * 2);
        wrappedNames.forEach((line: string) => {
          if (currentY > pageHeight - margin) {
            pdf.addPage();
            currentY = 50;
          }
          pdf.text(line, margin, currentY);
          currentY += 15;
        });
      }

      pdf.save(`Wedding_Seating_Chart_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('Failed to export vector PDF:', err);
      alert('An error occurred while generating the PDF.');
    }
  };

  const seatedGuestIds = new Set(tables.flatMap((t) => t.assignedGuestIds));
  const unassignedGuests = guests.filter((g) => !g.tableId && g.rsvpStatus !== 'declined');

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl md:text-3xl text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Automated Seating Chart & Floor Plan
          </h1>
          <p className="text-xs text-slate-500">
            Intelligent algorithm groups family, couples, and friends while respecting conflicts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleRunAlgorithm}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-semibold shadow-lg shadow-rose-500/25 transition-all"
          >
            <Sparkles className="w-4 h-4 animate-pulse" /> Auto-Generate Seating
          </button>

          <button
            onClick={() => setShowTableModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all"
          >
            <Plus className="w-4 h-4" /> Add Table
          </button>

          <button
            onClick={exportPDFSeatingChart}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all"
          >
            <Download className="w-4 h-4" /> Export PDF Chart
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      {seatingMetrics && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
              {seatingMetrics.score}%
            </div>
            <div>
              <h4 className="font-semibold text-emerald-900 dark:text-emerald-200">
                Seating Arrangement Optimized!
              </h4>
              <p className="text-slate-500 dark:text-slate-400">
                Seated {seatingMetrics.seatedCount} guests with 0 hard constraint violations.
              </p>
            </div>
          </div>
          <span className="font-mono text-emerald-700 dark:text-emerald-300 font-bold text-sm">
            {unassignedGuests.length} Unassigned
          </span>
        </div>
      )}

      {/* Floorplan & Unassigned Guests Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Unassigned Guest Pool */}
        <div className="glass-panel rounded-3xl p-5 space-y-4 lg:col-span-1">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-serif font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-rose-500" /> Unassigned ({unassignedGuests.length})
            </h3>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 text-xs">
            {unassignedGuests.length === 0 ? (
              <div className="p-6 text-center text-slate-400">
                <UserCheck className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                All eligible guests assigned to tables!
              </div>
            ) : (
              unassignedGuests.map((guest) => (
                <div
                  key={guest.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold block text-slate-900 dark:text-slate-100">
                      {guest.firstName} {guest.lastName}
                    </span>
                    <span className="text-[10px] text-slate-400">{guest.groupCategory}</span>
                  </div>

                  {selectedTableId && (
                    <button
                      onClick={() => assignGuestSeat(guest.id, selectedTableId)}
                      className="px-2 py-1 rounded bg-rose-500 text-white text-[10px] font-semibold"
                    >
                      Assign to Table
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Visual Floor Plan Grid */}
        <div
          ref={floorPlanRef}
          className="glass-panel rounded-3xl p-6 lg:col-span-3 min-h-[550px] relative bg-slate-900/5 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 space-y-6"
        >
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-serif font-bold text-base text-slate-900 dark:text-slate-100">
                Venue Floorplan Grid
              </h3>
              <p className="text-xs text-slate-500">
                Click any table to view assigned seats or manually place guests.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">{tables.length} Active Tables</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tables.map((table) => {
              const assignedGuests = guests.filter((g) => table.assignedGuestIds.includes(g.id));
              const isSelected = selectedTableId === table.id;

              return (
                <div
                  key={table.id}
                  onClick={() => setSelectedTableId(table.id)}
                  className={`rounded-3xl p-5 border-2 transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-rose-500 bg-rose-50/20 dark:bg-rose-950/30 ring-4 ring-rose-500/10'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between border-b pb-2 mb-3">
                    <span className="font-serif font-bold text-sm text-slate-900 dark:text-slate-100">
                      {table.tableName}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTable(table.id);
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Table Shape Render */}
                  <div className="flex items-center justify-center py-4">
                    <div
                      className={`w-28 h-28 rounded-full border-4 border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 flex flex-col items-center justify-center font-serif text-rose-700 dark:text-rose-300 shadow-inner ${
                        table.shape === 'long' ? 'w-40 rounded-2xl' : ''
                      }`}
                    >
                      <span className="font-bold text-lg">{assignedGuests.length}</span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-sans">
                        / {table.maxSeats} Seats
                      </span>
                    </div>
                  </div>

                  {/* Assigned Guest Badges */}
                  <div className="mt-3 space-y-1 text-xs">
                    {assignedGuests.map((g) => (
                      <div
                        key={g.id}
                        className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80"
                      >
                        <span className="font-medium truncate">
                          {g.firstName} {g.lastName}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            assignGuestSeat(g.id, undefined);
                          }}
                          className="text-[10px] text-slate-400 hover:text-rose-500"
                        >
                          Unassign
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ADD TABLE MODAL */}
      {showTableModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif font-bold text-lg">Add New Floorplan Table</h3>
              <button onClick={() => setShowTableModal(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTableSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Table Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Table 5 - VIPs"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">
                    Max Capacity
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={20}
                    value={maxSeats}
                    onChange={(e) => setMaxSeats(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">
                    Table Shape
                  </label>
                  <select
                    value={shape}
                    onChange={(e) => setShape(e.target.value as Table['shape'])}
                    className="w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="round">Round Table</option>
                    <option value="rectangular">Rectangular</option>
                    <option value="long">Long Banquet</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowTableModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-500 text-white font-semibold shadow-md shadow-rose-500/20"
                >
                  Create Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
