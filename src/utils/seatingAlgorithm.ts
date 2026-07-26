import { Guest, Table } from '../types';

export interface SeatingResult {
  updatedTables: Table[];
  updatedGuests: Guest[];
  unassignedGuests: Guest[];
  metrics: {
    totalGuests: number;
    seatedGuestsCount: number;
    conflictCount: number;
    satisfactionScore: number; // 0 to 100%
  };
}

export function autoGenerateSeating(
  guests: Guest[],
  tables: Table[]
): SeatingResult {
  // Deep clone to prevent direct mutation
  const workingGuests: Guest[] = JSON.parse(JSON.stringify(guests));
  const workingTables: Table[] = JSON.parse(JSON.stringify(tables));

  // Reset table assignments on working set
  workingTables.forEach((table) => {
    table.assignedGuestIds = [];
  });

  workingGuests.forEach((guest) => {
    guest.tableId = undefined;
    guest.seatNumber = undefined;
  });

  // Filter out declined guests
  const eligibleGuests = workingGuests.filter(
    (g) => g.rsvpStatus !== 'declined'
  );

  // Group guests by clusters (Family, Friends, Work, etc.)
  const clusters: Record<string, Guest[]> = {};
  eligibleGuests.forEach((guest) => {
    const cat = guest.groupCategory || 'Other';
    if (!clusters[cat]) clusters[cat] = [];
    clusters[cat].push(guest);
  });

  // Assign clusters to tables
  let tableIndex = 0;
  const unassigned: Guest[] = [];

  // Sort tables by capacity descending
  const sortedTables = [...workingTables].sort((a, b) => b.maxSeats - a.maxSeats);

  Object.entries(clusters).forEach(([_category, categoryGuests]) => {
    categoryGuests.forEach((guest) => {
      // Find table that has room and doesn't conflict
      let assigned = false;

      // Try current or subsequent tables
      for (let i = 0; i < sortedTables.length; i++) {
        const tIndex = (tableIndex + i) % sortedTables.length;
        const targetTable = sortedTables[tIndex];

        // Calculate current headcount at this table (including plus ones)
        const currentSeats = targetTable.assignedGuestIds.reduce((sum, gId) => {
          const g = workingGuests.find((x) => x.id === gId);
          return sum + 1 + (g?.hasPlusOne && g.plusOneRsvp !== 'declined' ? 1 : 0);
        }, 0);

        const neededSeats = 1 + (guest.hasPlusOne && guest.plusOneRsvp !== 'declined' ? 1 : 0);

        if (currentSeats + neededSeats <= targetTable.maxSeats) {
          // Check conflict constraint
          const hasConflict = targetTable.assignedGuestIds.some((existingId) => {
            const existingGuest = workingGuests.find((x) => x.id === existingId);
            return (
              guest.conflictGuestIds?.includes(existingId) ||
              existingGuest?.conflictGuestIds?.includes(guest.id)
            );
          });

          if (!hasConflict) {
            targetTable.assignedGuestIds.push(guest.id);
            guest.tableId = targetTable.id;
            guest.seatNumber = currentSeats + 1;
            assigned = true;
            break;
          }
        }
      }

      if (!assigned) {
        unassigned.push(guest);
      }

      // Advance table Index slightly for balanced distribution
      tableIndex = (tableIndex + 1) % sortedTables.length;
    });
  });

  // Compute metrics
  const seatedCount = eligibleGuests.length - unassigned.length;
  let conflictViolationCount = 0;

  sortedTables.forEach((table) => {
    table.assignedGuestIds.forEach((gId1) => {
      const g1 = workingGuests.find((x) => x.id === gId1);
      if (!g1) return;

      table.assignedGuestIds.forEach((gId2) => {
        if (gId1 === gId2) return;
        if (g1.conflictGuestIds?.includes(gId2)) {
          conflictViolationCount++;
        }
      });
    });
  });

  const satisfactionScore = Math.round(
    ((seatedCount / (eligibleGuests.length || 1)) * 100) - conflictViolationCount * 10
  );

  return {
    updatedTables: sortedTables,
    updatedGuests: workingGuests,
    unassignedGuests: unassigned,
    metrics: {
      totalGuests: eligibleGuests.length,
      seatedGuestsCount: seatedCount,
      conflictCount: conflictViolationCount,
      satisfactionScore: Math.max(0, Math.min(100, satisfactionScore)),
    },
  };
}
