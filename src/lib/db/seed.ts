import { reset, seed } from 'drizzle-seed';

import { db } from '@/lib/db';
import * as schema from '@/lib/db/schemas';

async function main() {
  // Reset database before seeding (optional - uncomment if needed)
  await reset(db, schema);

  console.log('🌱 Starting database seeding...');

  await seed(db, schema, { seed: 1234 }).refine(() => ({
    usersTable: {
      count: 25,
      with: {
        postsTable: 5, // Each user will have 5 posts
      },
    },
  }));

  console.log(
    '✅ Database seeded successfully with 25 users and 125 posts (5 per user)!',
  );
}

// eslint-disable-next-line unicorn/prefer-top-level-await
main().catch((error) => {
  console.error('❌ Seeding failed:', error);
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(1);
});
