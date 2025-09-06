Migration steps: TimeEntry -> TimeActivity

1. Ensure you have DB backup.
2. Update Prisma schema (already done in `prisma/schema.prisma`).
3. Generate Prisma Client:

   npm run prisma:generate
   # or
   npx prisma generate

4. Create migration in Prisma (this will create migration files):

   npx prisma migrate dev --name add-time-activity

   or for production:

   npx prisma migrate deploy

5. Run migration script (paginated, idempotent):

   node --loader ts-node/esm scripts/migrate-timeentry-to-activities.ts

   Or compile script to JS and run with node:

   npx tsx scripts/migrate-timeentry-to-activities.ts

Notes:
- The migration script will skip entries that already have a TimeActivity.
- For large datasets, consider running in batches and monitoring DB load.
- After verifying data and updating API, consider removing old columns from `TimeEntry` in a later migration.
