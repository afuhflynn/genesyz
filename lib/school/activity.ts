import { db } from "@/lib/db";

function utcDay(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export async function recordLearningActivity(userId: string, activityType: string, sourceId?: string) {
  const activityDate = utcDay();
  const existing = await db.learningActivity.findUnique({ where: { userId_activityDate: { userId, activityDate } } });
  if (existing) return { created: false, streak: await db.streak.findUnique({ where: { userId } }) };

  await db.learningActivity.create({ data: { userId, activityDate, activityType, sourceId } });
  const streak = await db.streak.findUnique({ where: { userId } });
  if (!streak) {
    return { created: true, streak: await db.streak.create({ data: { userId, currentStreak: 1, longestStreak: 1, lastActiveDate: activityDate } }) };
  }

  const lastDay = utcDay(streak.lastActiveDate);
  const diffDays = Math.floor((activityDate.getTime() - lastDay.getTime()) / 86400000);
  const currentStreak = diffDays === 1 ? streak.currentStreak + 1 : diffDays > 1 ? 1 : streak.currentStreak;
  return { created: true, streak: await db.streak.update({ where: { userId }, data: { currentStreak, longestStreak: Math.max(currentStreak, streak.longestStreak), lastActiveDate: activityDate } }) };
}
