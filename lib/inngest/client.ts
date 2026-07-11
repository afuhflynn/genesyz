import { Inngest } from "inngest";

// Create the Inngest client
export const inngest = new Inngest({
  id: "genesyz",
  name: "Genesyz",
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
  "startup.follower.added": {
    data: {
      followerId: string;
      startupId: string;
      startupName: string;
      startupSlug: string;
      followerEmail: string;
      followerName?: string;
      addedByUserId: string;
    };
  };
  "startup.member.added": {
    data: {
      startupId: string;
      startupName: string;
      startupSlug: string;
      newMemberUserId: string;
      newMemberEmail: string;
      newMemberName: string;
      newMemberRole: string;
      addedByUserId: string;
    };
  };
  "startup.weeklyUpdate.followerNotification": {
    data: {
      updateId: string;
      startupId: string;
    };
  };
};
