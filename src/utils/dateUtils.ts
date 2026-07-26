export const getDeadlineDisplay = (
  dueDateStr?: string,
  isCompleted?: boolean
): { text: string; isUrgent: boolean; isOverdue: boolean; isCompleted?: boolean } => {
  if (isCompleted) {
    return { text: '✅ Completed', isUrgent: false, isOverdue: false, isCompleted: true };
  }
  if (!dueDateStr) return { text: 'No due date', isUrgent: false, isOverdue: false };

  let targetTime: number;
  if (dueDateStr.length <= 10) {
    const [year, month, day] = dueDateStr.split('-').map(Number);
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      return { text: `Due ${dueDateStr}`, isUrgent: false, isOverdue: false };
    }
    const dateObj = new Date(year, month - 1, day, 23, 59, 59, 999);
    targetTime = dateObj.getTime();
  } else {
    targetTime = new Date(dueDateStr).getTime();
  }

  if (isNaN(targetTime)) {
    return { text: `Due ${dueDateStr}`, isUrgent: false, isOverdue: false };
  }

  const now = Date.now();
  const diffMs = targetTime - now;
  const hours24Ms = 24 * 60 * 60 * 1000;

  // Due within the next 24 hours (or today)
  if (diffMs > 0 && diffMs <= hours24Ms) {
    const totalMinutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const timeText = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
    return { text: `🔥 Due in ${timeText}`, isUrgent: true, isOverdue: false };
  }

  // Overdue by up to 24 hours
  if (diffMs <= 0 && diffMs >= -hours24Ms) {
    const totalMinutes = Math.max(1, Math.abs(Math.floor(diffMs / (1000 * 60))));
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const timeText = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
    return { text: `⚠️ Overdue by ${timeText}`, isUrgent: false, isOverdue: true };
  }

  // Overdue by more than 24 hours
  if (diffMs < -hours24Ms) {
    const days = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60 * 24));
    return { text: `⚠️ Overdue by ${days}d`, isUrgent: false, isOverdue: true };
  }

  return { text: `Due ${dueDateStr}`, isUrgent: false, isOverdue: false };
};
