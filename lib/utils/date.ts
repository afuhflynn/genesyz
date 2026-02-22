/**
 * Calculate week number based on startup creation date.
 * Week 1 = the week containing the creation date
 */
export function getWeeksSinceCreation(createdAt: Date): number {
  const now = new Date();
  const created = new Date(createdAt);
  const diffInMs = now.getTime() - created.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  return Math.floor(diffInDays / 7) + 1;
}

/**
 * Get the start of the week (Monday) for a given date
 */
export function getWeekStartForDate(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

/**
 * Get the end of the week (Sunday) for a given date
 */
export function getWeekEndForDate(date: Date): Date {
  const start = getWeekStartForDate(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return end;
}
