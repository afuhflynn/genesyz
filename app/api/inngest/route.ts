import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import {
  sendMagicLinkEmailFunction,
  sendPasswordResetEmailFunction,
  sendVerificationEmailFunction,
  sendWelcomeEmailFunction,
} from "@/lib/inngest/functions/auth-emails";
import { reevaluationFunction } from "@/lib/inngest/functions/re-evaluation";
import { researchPipelineFunction } from "@/lib/inngest/functions/research-pipeline";
import { weeklyStrategicReportFunction } from "@/lib/inngest/functions/weekly-digest";

// Export Inngest serve handler with all functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    researchPipelineFunction,
    weeklyStrategicReportFunction,
    reevaluationFunction,
    sendVerificationEmailFunction,
    sendWelcomeEmailFunction,
    sendPasswordResetEmailFunction,
    sendMagicLinkEmailFunction,
  ],
});
