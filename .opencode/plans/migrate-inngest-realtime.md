# Plan: Migrate `@inngest/realtime` v3 → Inngest v4 built-in realtime

**Goal:** Fix build error `Type 'InngestMiddleware<...>' is not assignable to type 'Class'` caused by incompatible v3 `@inngest/realtime` package with Inngest v4.

---

## Files to modify (6 files + 1 package.json change)

---

### 1. `package.json` - Remove `@inngest/realtime`

Remove this line from `dependencies`:
```diff
-    "@inngest/realtime": "^0.4.7",
```

Then run `pnpm install` to clean lockfile.

---

### 2. `lib/inngest/client.ts` - Remove `realtimeMiddleware`

**Replace lines 1-9:**
```typescript
import { realtimeMiddleware } from "@inngest/realtime/middleware";
import { Inngest } from "inngest";

// Create the Inngest client
export const inngest = new Inngest({
  id: "genesyz",
  name: "Genesyz",
  middleware: [realtimeMiddleware()],
});
```

with:
```typescript
import { Inngest } from "inngest";

// Create the Inngest client
export const inngest = new Inngest({
  id: "genesyz",
  name: "Genesyz",
});
```

**Reason:** In v4, realtime is built-in - no middleware registration needed.

---

### 3. `lib/inngest/functions/research-pipeline.ts` - Rewrite channel def + update publish calls

**Change import (line 1):**
```diff
- import { channel, topic } from "@inngest/realtime";
+ import { realtime } from "inngest";
```

**Replace the entire `ideaChannel` definition (lines 10-313):**

The v3 chaining API `channel(...).addTopic(topic(...).schema(...))` becomes v4 config-style `realtime.channel({ name, topics })`:

```typescript
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
```

**Update publish calls** in the function handler (lines 344-537). Each call changes from:
```typescript
publish({ channel: `idea:${ideaId}`, topic: "parse.idea", data: { ... } });
```
to:
```typescript
const ch = ideaChannel({ ideaId });
publish(ch["parse.idea"], { status: "INITIATE", message: "...", id: uuid4() });
```

Add `const ch = ideaChannel({ ideaId });` right after the destructuring on line 344.

List of all publish call sites to update in this file:

| Line | Topic | Change from → to |
|------|-------|------------------|
| 347 | `parse.idea` | `publish({ channel: \`idea:${ideaId}\`, topic: "parse.idea", data: { status: "INITIATE", message: "...", id: uuid4() } })` → `publish(ch["parse.idea"], { status: "INITIATE", message: "AI research pipeline initiated", id: uuid4() })` |
| 376 | `research.started` | → `publish(ch["research.started"], { status: "PROCESSING", message: "AI research pipeline started", id: uuid4() })` |
| 392 | `research.progress` | → `publish(ch["research.progress"], { status: result.success ? "COMPLETED" : "FAILED", message: result.success ? "AI research completed successfully" : "AI research failed", id: uuid4() })` |
| 527 | `research.finished` | → `publish(ch["research.finished"], { success: result.success, ideaId, overallScore, message: "Deep Research and Analysis finished.", id: uuid4() })` |

Note: The `research.progress` at line 392 previously included `result:` in the data payload. This field is now dropped since the schema only validates `{ status, message, id }`. This is fine - the result data was never consumed on the client side via the realtime subscription.

---

### 4. `lib/agents/pipeline.ts` - Import type change + 12 publish calls

**Change import (line 1):**
```diff
- import type { Realtime } from "@inngest/realtime";
+ import type { Realtime } from "inngest";
+ import { ideaChannel } from "@/lib/inngest/functions/research-pipeline";
```

**Change publish parameter type (line 50):**
```diff
-  publish: Realtime.PublishFn,
+  publish: Realtime.TypedPublishFn,
```

**Add channel instance** right after `try {` (line 91):
```typescript
const ch = ideaChannel({ ideaId });
```

**Update all 12 publish calls** from object-style to two-arg style. Pattern:
```diff
- publish({ channel: `idea:${ideaId}`, topic: "research.progress", data: { status, message, id } })
+ publish(ch["research.progress"], { status, message, id })
```

Lines 94, 108, 120, 135, 147, 162, 174, 189, 201, 217, 229, 244 - all change `research.progress` topic, same pattern.

Note: Line 135 currently has a typo `marketRsearchStepId` (should be `marketResearchStepId`) - the `marketRsearchStepId` was included as a property alongside `id` in the data object. With the new schema, only `id` is used. The `marketRsearchStepId` extra field is dropped (no client code reads it).

---

### 5. `app/api/inngest/token/_actions/fetchRealtimeSubscriptionToken.ts`

**Change import (line 3):**
```diff
- import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
+ import { getSubscriptionToken, type Realtime } from "inngest";
```

The `getSubscriptionToken` function has the same signature in v4 - just a different package. The rest of the file stays the same.

---

### 6. `app/api/inngest/token/route.ts`

**Change import (line 1):**
```diff
- import { getSubscriptionToken, Realtime } from "@inngest/realtime";
+ import { getSubscriptionToken } from "inngest";
```

The `Realtime` type import was unused (only used for its side effect in v3). Remove it.

Rest of the file stays the same.

---

### 7. `app/(dashboard)/ideas/[id]/page.tsx` - Replace hook

**Change import (line 3):**
```diff
- import { useInngestSubscription } from "@inngest/realtime/hooks";
+ import { useRealtime } from "inngest/react";
+ import { ideaChannel } from "@/lib/inngest/functions/research-pipeline";
```

**Replace the hook call (lines 93-97):**
```diff
  // Subscribe to real-time updates
- const { latestData } = useInngestSubscription({
-   refreshToken: async () =>
-     await fetchRealtimeSubscriptionToken(id as string),
- });
+ const { messages } = useRealtime({
+   channel: ideaChannel({ ideaId: id }),
+   topics: ["research.started", "research.progress", "research.finished", "parse.idea"],
+   token: () => fetchRealtimeSubscriptionToken(id as string),
+   enabled: idea?.status === "PROCESSING" || idea?.status === "PENDING",
+ });
```

**Replace the effect that processes `latestData` (lines 99-134):**
```diff
  useEffect(() => {
-   if (latestData) {
-     const message = (latestData.data as any).message;
-     const topic = latestData.topic;
-     const status = (latestData.data as any).status;
-     const eventId = (latestData.data as any).id;
+   for (const msg of messages.delta) {
+     if (msg.kind !== "data") continue;
+     const data = msg.data as any;
+     const topic = msg.topic;
+     const message = data.message;
+     const status = data.status;
+     const eventId = data.id;

      setResearchProgress((prev) => {
        const exists = prev.find((item) => item.step === topic);
        if (exists) {
          return prev.map((item) => {
            if (item.id === eventId) {
              return { ...item, message, status };
            }
            return item;
          });
        } else {
          return [...prev, { step: topic, message, status, id: eventId }];
        }
      });
    }
- }, [latestData]);
+ }, [messages.delta]);
```

**Reason:** v4's `useRealtime` returns `messages` with `messages.delta` (incremental updates) instead of `latestData` (single last message). The effect iterates over `messages.delta` to find data-type messages.

---

### 8. `RULES.md` (optional cleanup)

Remove the `@inngest/realtime` row from the dependency constraints table (line 357).
