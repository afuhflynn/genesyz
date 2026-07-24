import { db } from "@/lib/db";
import { coursesCatalog } from "@/lib/school-catalog";

function durationSeconds(value: string) {
  const minutes = Number.parseInt(value, 10);
  return Number.isFinite(minutes) ? minutes * 60 : null;
}

async function main() {
  const lessonMap = new Map<string, { courseSlug: string; lessonId: string }>();
  for (const legacyCourse of coursesCatalog) {
    const course = await db.course.upsert({
      where: { slug: legacyCourse.id },
      create: {
        title: legacyCourse.title,
        slug: legacyCourse.id,
        description: legacyCourse.description,
        category: legacyCourse.category,
        isPublished: true,
      },
      update: {
        title: legacyCourse.title,
        description: legacyCourse.description,
        category: legacyCourse.category,
        isPublished: true,
      },
    });
    for (
      let moduleIndex = 0;
      moduleIndex < legacyCourse.modules.length;
      moduleIndex++
    ) {
      const legacyModule = legacyCourse.modules[moduleIndex];
      const module = await db.module.upsert({
        where: { id: `${course.id}-${legacyModule.id}` },
        create: {
          id: `${course.id}-${legacyModule.id}`,
          courseId: course.id,
          title: legacyModule.title,
          description: legacyModule.description,
          position: moduleIndex,
        },
        update: {
          title: legacyModule.title,
          description: legacyModule.description,
          position: moduleIndex,
        },
      });
      for (
        let lessonIndex = 0;
        lessonIndex < legacyModule.lectures.length;
        lessonIndex++
      ) {
        const lecture = legacyModule.lectures[lessonIndex];
        lessonMap.set(lecture.id, {
          courseSlug: legacyCourse.id,
          lessonId: `${course.id}-${lecture.id}`,
        });
        await db.lesson.upsert({
          where: { id: `${course.id}-${lecture.id}` },
          create: {
            id: `${course.id}-${lecture.id}`,
            moduleId: module.id,
            title: lecture.title,
            description: lecture.description,
            type: "VIDEO",
            videoUrl: `https://www.youtube.com/watch?v=${lecture.youtubeId}`,
            provider: "YOUTUBE",
            duration: durationSeconds(lecture.duration),
            position: lessonIndex,
          },
          update: {
            moduleId: module.id,
            title: lecture.title,
            description: lecture.description,
            videoUrl: `https://www.youtube.com/watch?v=${lecture.youtubeId}`,
            duration: durationSeconds(lecture.duration),
            position: lessonIndex,
          },
        });
      }
    }
  }
  const legacyProgress = await db.lectureProgress.findMany({
    where: { completed: true },
    include: { startup: { select: { userId: true } } },
  });
  for (const progress of legacyProgress) {
    const mapping = lessonMap.get(progress.lectureId);
    if (!mapping) continue;
    const course = await db.course.findUnique({
      where: { slug: mapping.courseSlug },
      select: { id: true },
    });
    if (!course) continue;
    const enrollment = await db.enrollment.upsert({
      where: {
        userId_startupId_courseId: {
          userId: progress.startup.userId,
          startupId: progress.startupId,
          courseId: course.id,
        },
      },
      create: {
        userId: progress.startup.userId,
        startupId: progress.startupId,
        courseId: course.id,
        status: "IN_PROGRESS",
      },
      update: {},
    });
    await db.lessonProgress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId: enrollment.id,
          lessonId: mapping.lessonId,
        },
      },
      create: {
        enrollmentId: enrollment.id,
        lessonId: mapping.lessonId,
        maxPercentage: 100,
        status: "COMPLETED",
        completedAt: progress.completedAt ?? new Date(),
      },
      update: {
        maxPercentage: 100,
        status: "COMPLETED",
        completedAt: progress.completedAt ?? new Date(),
      },
    });
  }
  console.log(`Migrated ${coursesCatalog.length} legacy courses into the LMS.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
