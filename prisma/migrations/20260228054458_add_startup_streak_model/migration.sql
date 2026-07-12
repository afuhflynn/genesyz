-- CreateTable
CREATE TABLE "startup_streaks" (
    "id" TEXT NOT NULL,
    "startupId" TEXT NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastUpdateWeek" TIMESTAMP(3),
    "streakStartDate" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "startup_streaks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "startup_streaks_startupId_key" ON "startup_streaks"("startupId");

-- AddForeignKey
ALTER TABLE "startup_streaks" ADD CONSTRAINT "startup_streaks_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
