-- Add projectName with backfill for existing local MVP test rows.
ALTER TABLE "SprintCapacity" ADD COLUMN "projectName" TEXT;

UPDATE "SprintCapacity"
SET "projectName" = 'Riesgo'
WHERE "teamName" ILIKE '%Riesgo%';

UPDATE "SprintCapacity"
SET "projectName" = 'Ahorro'
WHERE "teamName" ILIKE '%Ahorro%'
  AND "projectName" IS NULL;

UPDATE "SprintCapacity"
SET "projectName" = 'Pasarelas'
WHERE "teamName" ILIKE '%Pasarelas%'
  AND "projectName" IS NULL;

UPDATE "SprintCapacity"
SET "projectName" = 'Gestionados'
WHERE "teamName" ILIKE '%Gestionados%'
  AND "projectName" IS NULL;

UPDATE "SprintCapacity"
SET "projectName" = 'Legacy'
WHERE "projectName" IS NULL;

ALTER TABLE "SprintCapacity" ALTER COLUMN "projectName" SET NOT NULL;

DROP INDEX "SprintCapacity_sprint_teamName_key";

CREATE UNIQUE INDEX "SprintCapacity_sprint_teamName_projectName_key" ON "SprintCapacity"("sprint", "teamName", "projectName");
