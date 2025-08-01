import { faker } from '@faker-js/faker';

import type { posts as postsTable } from '@/lib/db/schemas/posts';

type PostInsert = typeof postsTable.$inferInsert;

/**
 * Generate a single post title using various strategies
 */
function generatePostTitle(): string {
  const titleTypes = [
    () => faker.hacker.phrase(),
    () => `How to ${faker.hacker.verb()} ${faker.hacker.noun()}`,
    () => `${faker.hacker.adjective()} ${faker.hacker.noun()} Best Practices`,
    () => `Understanding ${faker.hacker.noun()} in Modern Development`,
    () => `${faker.company.buzzPhrase()}`,
    () => `${faker.lorem.words(2)} ${faker.hacker.noun()} Guide`,
    () => `Building ${faker.hacker.adjective()} ${faker.hacker.noun()} Systems`,
    () => `${faker.hacker.verb()} ${faker.hacker.noun()} with Modern Tools`,
    () => `Advanced ${faker.hacker.noun()} Techniques`,
    () =>
      `${faker.hacker.adjective()} ${faker.hacker.noun()}: A Complete Overview`,
  ];

  const titleGenerator = faker.helpers.arrayElement(titleTypes);
  return titleGenerator();
}

/**
 * Generate a single post for a user
 */
export function generatePost(userId: string): PostInsert {
  return {
    title: generatePostTitle(),
    body: faker.lorem.paragraphs(3, '\n\n'),
    userId,
  };
}

/**
 * Generate multiple posts for a user
 */
export function generatePostsForUser(
  userId: string,
  count: number,
): PostInsert[] {
  return Array.from({ length: count }, () => generatePost(userId));
}

/**
 * Generate posts for multiple users
 */
export function generatePostsForUsers(
  userIds: string[],
  postsPerUser: number,
): PostInsert[] {
  const posts: PostInsert[] = [];

  for (const userId of userIds) {
    posts.push(...generatePostsForUser(userId, postsPerUser));
  }

  return posts;
}
