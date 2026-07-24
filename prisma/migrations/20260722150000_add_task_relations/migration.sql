-- Add the task fields and relations already represented in the Prisma schema.
CREATE TABLE "task_assignees" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "task_assignees_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "task_labels" (
    "id" TEXT NOT NULL,
    "startupId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6366f1',

    CONSTRAINT "task_labels_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "task_task_labels" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "labelId" TEXT NOT NULL,

    CONSTRAINT "task_task_labels_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "task_assignees_taskId_userId_key"
ON "task_assignees"("taskId", "userId");

CREATE INDEX "task_assignees_userId_idx"
ON "task_assignees"("userId");

CREATE UNIQUE INDEX "task_labels_startupId_name_key"
ON "task_labels"("startupId", "name");

CREATE INDEX "task_labels_startupId_idx"
ON "task_labels"("startupId");

CREATE UNIQUE INDEX "task_task_labels_taskId_labelId_key"
ON "task_task_labels"("taskId", "labelId");

ALTER TABLE "task_assignees"
ADD CONSTRAINT "task_assignees_taskId_fkey"
FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "task_assignees"
ADD CONSTRAINT "task_assignees_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "task_labels"
ADD CONSTRAINT "task_labels_startupId_fkey"
FOREIGN KEY ("startupId") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "task_task_labels"
ADD CONSTRAINT "task_task_labels_taskId_fkey"
FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "task_task_labels"
ADD CONSTRAINT "task_task_labels_labelId_fkey"
FOREIGN KEY ("labelId") REFERENCES "task_labels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
