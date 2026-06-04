import { realtime } from "inngest";
import z from "zod";

export const ideaChannel = realtime.channel({
  name: ({ ideaId }: { ideaId: string }) => `idea:${ideaId}`,
  topics: {
    "parse.idea": {
      schema: z.object({
        status: z.enum(["INITIATE", "COMPLETE"]),
        message: z.string(),
        id: z.string(),
      }),
    },
    "research.started": {
      schema: z.object({
        status: z.enum(["PROCESSING", "PENDING"]),
        message: z.string(),
        id: z.string(),
      }),
    },
    "research.progress": {
      schema: z.object({
        status: z.string(),
        message: z.string(),
        id: z.string().optional(),
      }),
    },
    "research.finished": {
      schema: z.object({
        success: z.boolean(),
        ideaId: z.string(),
        overallScore: z.number(),
        message: z.string(),
        id: z.string(),
      }),
    },
  },
});
