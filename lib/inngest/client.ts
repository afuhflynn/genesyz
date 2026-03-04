import { realtimeMiddleware } from "@inngest/realtime/middleware";
import { Inngest } from "inngest";

// Create the Inngest client
export const inngest = new Inngest({
  id: "ideasvault",
  name: "IdeasVault",
  middleware: [realtimeMiddleware()],
});

// Event types for type safety
export type InngestEvents = {
  "idea.submitted": {
    data: {
      ideaId: string;
      userId: string;
    };
  };
  "idea.research.completed": {
    data: {
      ideaId: string;
      userId: string;
      overallScore: number;
    };
  };
  "user.created": {
    data: {
      userId: string;
      email: string;
      name?: string;
    };
  };
  "email.send.verification": {
    data: {
      email: string;
      name: string;
      code: string;
      url: string;
    };
  };
  "email.send.welcome": {
    data: {
      email: string;
      name: string;
    };
  };
  "email.send.passwordReset": {
    data: {
      email: string;
      name: string;
      url: string;
    };
  };
  "email.send.magicLink": {
    data: {
      email: string;
      url: string;
    };
  };
  "digest.weekly": {
    data: Record<string, never>;
  };
  "weeklyUpdate.created": {
    data: {
      updateId: string;
      startupId: string;
      userId: string;
    };
  };
  "startup.weeklyReport": {
    data: {
      startupId: string;
      userId: string;
    };
  };
  "announcement.startupFeature": {
    data: {
      userId: string;
    };
  };
  "announcement.startupFeature.broadcast": {
    data: Record<string, never>;
  };
  "startup.weeklyReminder": {
    data: {
      startupId: string;
      userId: string;
      reminderDay: "friday" | "saturday";
    };
  };
  "startup.opportunities.discovery.completed": {
    data: {
      startupsScanned: number;
      startupsWithInsertions: number;
      generatedCandidates: number;
      insertedOpportunities: number;
      dedupedOpportunities: number;
      failedStartups: number;
    };
  };
};
