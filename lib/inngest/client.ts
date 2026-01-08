import { Inngest } from "inngest";

// Create the Inngest client
export const inngest = new Inngest({
  id: "ideasvault",
  name: "IdeasVault",
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
  "digest.weekly": {
    data: Record<string, never>;
  };
};
