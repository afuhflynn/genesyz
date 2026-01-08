import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { researchPipelineFunction } from "@/lib/inngest/functions/research-pipeline";
import { weeklyDigestFunction } from "@/lib/inngest/functions/weekly-digest";
import { reevaluationFunction } from "@/lib/inngest/functions/re-evaluation";

// Export Inngest serve handler with all functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    researchPipelineFunction,
    weeklyDigestFunction,
    reevaluationFunction,
  ],
});
