import { faker } from '@faker-js/faker';
import { reset } from 'drizzle-seed';

import { db } from '@/lib/db';
import * as schema from '@/lib/db/schemas';

// Set a consistent seed for reproducible results
faker.seed(1234);

async function main() {
  // Reset database before seeding
  await reset(db, schema);

  console.log('🌱 Starting database seeding...');

  // Generate 25 users with realistic data
  const users = Array.from({ length: 25 }, () => {
    const fullName = faker.person.fullName();
    const firstName = fullName.split(' ')[0];
    const lastName = fullName.split(' ')[1] || '';
    const cleanName = fullName.toLowerCase().replaceAll(/[^a-z0-9]/g, '');

    return {
      address: {
        city: faker.location.city(),
        street: faker.location.streetAddress(),
      },
      company: {
        name: faker.company.name(),
      },
      email: faker.internet.email({ firstName, lastName }),
      name: fullName,
      phone: faker.phone.number(),
      username: faker.helpers.arrayElement([
        cleanName,
        `${cleanName}${faker.number.int({ max: 999, min: 100 })}`,
        cleanName.replace(' ', '.'),
        cleanName.replace(' ', '_'),
        faker.internet.username({ firstName, lastName }),
      ]),
      website: faker.datatype.boolean({ probability: 0.3 })
        ? faker.internet.url()
        : `https://${cleanName}${faker.helpers.arrayElement(['.com', '.net', '.org', '.dev', '.io'])}`,
    };
  });

  // Insert users and get their IDs
  const insertedUsers = await db
    .insert(schema.usersTable)
    .values(users)
    .returning({ id: schema.usersTable.id });

  // Generate 5 posts per user (125 total)
  const posts = [];
  for (const user of insertedUsers) {
    for (let i = 0; i < 5; i++) {
      const titleTypes = [
        () => faker.hacker.phrase(),
        () => `How to ${faker.hacker.verb()} ${faker.hacker.noun()}`,
        () =>
          `${faker.hacker.adjective()} ${faker.hacker.noun()} Best Practices`,
        () => `Understanding ${faker.hacker.noun()} in Modern Development`,
        () => `${faker.company.buzzPhrase()}`,
        () => `${faker.lorem.words(2)} ${faker.hacker.noun()} Guide`,
        () =>
          `Building ${faker.hacker.adjective()} ${faker.hacker.noun()} Systems`,
        () => `${faker.hacker.verb()} ${faker.hacker.noun()} with Modern Tools`,
        () => `Advanced ${faker.hacker.noun()} Techniques`,
        () =>
          `${faker.hacker.adjective()} ${faker.hacker.noun()}: A Complete Overview`,
      ];

      const titleGenerator = faker.helpers.arrayElement(titleTypes);

      posts.push({
        body: faker.lorem.paragraphs(3, '\n\n'),
        title: titleGenerator(),
        userId: user.id,
      });
    }
  }

  // Insert posts
  await db.insert(schema.postsTable).values(posts);

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
