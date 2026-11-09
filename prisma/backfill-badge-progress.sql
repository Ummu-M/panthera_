UPDATE "BadgeCompletion"
SET "progressStatus" = 'COMPLETED'
WHERE "status" = 'APPROVED'
  AND "progressStatus" = 'IN_PROGRESS';
