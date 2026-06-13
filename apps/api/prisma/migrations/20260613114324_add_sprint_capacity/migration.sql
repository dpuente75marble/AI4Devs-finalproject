-- CreateTable
CREATE TABLE "SprintCapacity" (
    "id" TEXT NOT NULL,
    "sprint" TEXT NOT NULL,
    "teamName" TEXT NOT NULL,
    "availablePoints" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SprintCapacity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SprintCapacity_sprint_idx" ON "SprintCapacity"("sprint");

-- CreateIndex
CREATE UNIQUE INDEX "SprintCapacity_sprint_teamName_key" ON "SprintCapacity"("sprint", "teamName");
