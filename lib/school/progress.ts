export function calculateCourseProgress(
  totalLessons: number,
  completedLessons: number,
): number {
  if (totalLessons === 0) return 0;
  return Math.round((completedLessons / totalLessons) * 100);
}

export function getStreakLabel(days: number): string {
  if (days === 0) return "Start your streak!";
  if (days < 4) return `${days} day streak`;
  if (days < 7) return `${days} day streak 🔥`;
  if (days < 14) return `${days} day streak 🔥🔥`;
  if (days < 30) return `${days} day streak 🔥🔥🔥`;
  return `${days} day streak 🔥🔥🔥🔥`;
}

export function getStreakMilestone(days: number): number | null {
  const milestones = [3, 7, 14, 21, 30, 60, 90, 180, 365];
  for (const m of milestones) {
    if (days >= m) continue;
    return m;
  }
  return null;
}
