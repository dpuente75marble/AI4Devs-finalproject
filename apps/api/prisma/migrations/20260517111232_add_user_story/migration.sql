-- CreateTable
CREATE TABLE "UserStory" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "storyPoints" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "sprint" TEXT,
    "source" TEXT NOT NULL DEFAULT 'csv',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserStory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserStory_createdAt_idx" ON "UserStory"("createdAt");
