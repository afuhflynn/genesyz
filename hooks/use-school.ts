import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Course,
  Enrollment,
  SchoolStats,
  Certificate,
  UserBadge,
  LessonProgress,
} from "@/types/school";

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Request failed");
  return json;
}

const withStartup = (url: string, startupSlug?: string) =>
  startupSlug
    ? `${url}${url.includes("?") ? "&" : "?"}startupSlug=${encodeURIComponent(startupSlug)}`
    : url;

export function useCourses(startupSlug?: string) {
  return useQuery({
    queryKey: ["school", "courses", startupSlug],
    queryFn: () =>
      fetchJson<{
        data: (Course & {
          enrollment: Enrollment | null;
          totalLessons: number;
        })[];
      }>(withStartup("/api/school/courses", startupSlug)),
  });
}

export function useCourse(slug: string, startupSlug?: string) {
  return useQuery({
    queryKey: ["school", "course", slug, startupSlug],
    queryFn: () =>
      fetchJson<{
        data: Course & {
          enrollment: (Enrollment & { progress: LessonProgress[] }) | null;
          completedLessonIds: string[];
          completedLessons: number;
          totalLessons: number;
        };
      }>(withStartup(`/api/school/courses/${slug}`, startupSlug)),
    enabled: !!slug,
  });
}

export function useEnrollments(startupSlug?: string) {
  return useQuery({
    queryKey: ["school", "enrollments", startupSlug],
    queryFn: () =>
      fetchJson<{ data: (Enrollment & { totalLessons: number })[] }>(
        withStartup("/api/school/enrollments", startupSlug),
      ),
  });
}

export function useEnroll(startupSlug?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) =>
      fetchJson(
        withStartup(`/api/school/courses/${slug}/enroll`, startupSlug),
        { method: "POST" },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["school", "enrollments", startupSlug],
      });
      queryClient.invalidateQueries({
        queryKey: ["school", "courses", startupSlug],
      });
    },
  });
}

export function useProgress(
  courseId: string | undefined,
  startupSlug?: string,
) {
  return useQuery({
    queryKey: ["school", "progress", courseId, startupSlug],
    queryFn: () =>
      fetchJson<{ data: Enrollment & { progress: LessonProgress[] } }>(
        withStartup(`/api/school/progress?courseId=${courseId}`, startupSlug),
      ),
    enabled: !!courseId,
  });
}

export function useUpdateProgress(startupSlug?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      lessonId: string;
      percent: number;
      timeSpent?: number;
    }) =>
      fetchJson("/api/school/progress", {
        method: "POST",
        body: JSON.stringify({ ...body, startupSlug }),
        headers: { "Content-Type": "application/json" },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school", "progress"] });
      queryClient.invalidateQueries({ queryKey: ["school", "course"] });
    },
  });
}

export function useSubmitQuiz(startupSlug?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ quizId, answers }: { quizId: string; answers: number[] }) =>
      fetchJson(
        withStartup(`/api/school/quizzes/${quizId}/attempt`, startupSlug),
        {
          method: "POST",
          body: JSON.stringify({ answers }),
          headers: { "Content-Type": "application/json" },
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school", "progress"] });
    },
  });
}

export function useSubmitAssignment(startupSlug?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      assignmentId,
      content,
    }: {
      assignmentId: string;
      content: string;
    }) =>
      fetchJson(
        withStartup(
          `/api/school/assignments/${assignmentId}/submit`,
          startupSlug,
        ),
        {
          method: "POST",
          body: JSON.stringify({ content }),
          headers: { "Content-Type": "application/json" },
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school", "progress"] });
    },
  });
}

export function useCertificates(startupSlug?: string) {
  return useQuery({
    queryKey: ["school", "certificates", startupSlug],
    queryFn: () =>
      fetchJson<{ data: Certificate[] }>(
        withStartup("/api/school/certificates", startupSlug),
      ),
  });
}

export function useClaimCertificate(startupSlug?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (courseId: string) =>
      fetchJson("/api/school/certificates", {
        method: "POST",
        body: JSON.stringify({ courseId, startupSlug }),
        headers: { "Content-Type": "application/json" },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school", "certificates"] });
    },
  });
}

export function useBadges() {
  return useQuery({
    queryKey: ["school", "badges"],
    queryFn: () => fetchJson<{ data: UserBadge[] }>("/api/school/badges"),
  });
}

export function useSchoolStats() {
  return useQuery({
    queryKey: ["school", "stats"],
    queryFn: () => fetchJson<{ data: SchoolStats }>("/api/school/stats"),
  });
}

export function useStreak() {
  return useQuery({
    queryKey: ["school", "streak"],
    queryFn: () =>
      fetchJson<{
        data: {
          currentStreak: number;
          longestStreak: number;
          lastActiveDate: string;
        };
      }>("/api/school/streaks"),
  });
}

export function useUpdateStreak() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      fetchJson<{
        data: {
          currentStreak: number;
          longestStreak: number;
          lastActiveDate: string;
          updated: boolean;
        };
      }>("/api/school/streaks", { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school", "streak"] });
      queryClient.invalidateQueries({ queryKey: ["school", "stats"] });
    },
  });
}

export function useLearningOrganizations() {
  return useQuery({
    queryKey: ["school", "organizations"],
    queryFn: () =>
      fetchJson<{
        data: Array<{ id: string; name: string; slug: string; role: string }>;
      }>("/api/school/organization"),
  });
}

export function useOrganizationLearning(organizationId: string | undefined) {
  return useQuery({
    queryKey: ["school", "organization", organizationId],
    queryFn: async () => {
      const [progress, assignments] = await Promise.all([
        fetchJson<{ data: any }>(
          `/api/school/organization/progress?organizationId=${organizationId}`,
        ),
        fetchJson<{ data: any[] }>(
          `/api/school/organization/assignments?organizationId=${organizationId}`,
        ),
      ]);
      return { progress: progress.data, assignments: assignments.data };
    },
    enabled: !!organizationId,
  });
}

export function useAssignOrganizationCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      organizationId: string;
      courseId: string;
      assigneeIds?: string[];
      dueDate?: string;
      required?: boolean;
    }) =>
      fetchJson(`/api/school/organization/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({
        queryKey: ["school", "organization", variables.organizationId],
      }),
  });
}
