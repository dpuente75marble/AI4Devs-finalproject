-- CreateTable
CREATE TABLE "SprintAbsence" (
    "id" TEXT NOT NULL,
    "sprint" TEXT NOT NULL,
    "teamName" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "absenceDays" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SprintAbsence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SprintAbsence_sprint_idx" ON "SprintAbsence"("sprint");

-- CreateIndex
CREATE INDEX "SprintAbsence_sprint_teamName_projectName_idx" ON "SprintAbsence"("sprint", "teamName", "projectName");
