import { faker } from '@faker-js/faker';
import { reset } from 'drizzle-seed';

import { db } from '@/lib/db';
import * as schema from '@/lib/db/schemas';
import { generatePostsForUsers } from '@/lib/db/seed/generators/post-generator';
import { generateSessionDataForUsers } from '@/lib/db/seed/generators/session-generator';
import { generateUsers } from '@/lib/db/seed/generators/user-generator';
import {
  insertPosts,
  insertSessionData,
  insertUsers,
} from '@/lib/db/seed/utils/database-operations';

// Set a consistent seed for reproducible results
faker.seed(1234);

/**
 * Seed configuration
 */
const SEED_CONFIG = {
  userCount: 25,
  postsPerUser: 5,
} as const;

/**
 * Main seeding function that resets and populates the database
 */
export async function seedDatabase() {
  // Reset database before seeding
  await reset(db, schema);

  console.log('🌱 Starting database seeding...');

  // Generate and insert users
  const users = generateUsers(SEED_CONFIG.userCount);
  const insertedUsers = await insertUsers(users);
  const userIds = insertedUsers.map((user) => user.id);

  console.log(`👥 Created ${insertedUsers.length} users`);

  // Generate and insert posts
  const posts = generatePostsForUsers(userIds, SEED_CONFIG.postsPerUser);
  await insertPosts(posts);

  console.log(`📝 Created ${posts.length} posts`);
  console.log('📝 Posts created, now generating sessions and metadata...');

  // Generate and insert session data
  const sessionData = generateSessionDataForUsers(userIds);
  await insertSessionData(sessionData);

  console.log(
    '✅ Database seeded successfully with users, posts, sessions, and metadata!',
  );
}

// When this file is run directly, execute the seeding
if (import.meta.url === `file://${process.argv[1]}`) {
  // eslint-disable-next-line unicorn/prefer-top-level-await
  seedDatabase().catch((error) => {
    console.error('❌ Seeding failed:', error);
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  });
}
