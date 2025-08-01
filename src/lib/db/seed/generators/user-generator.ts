import { faker } from '@faker-js/faker';

import type { users as usersTable } from '@/lib/db/schemas/auth';

type UserInsert = typeof usersTable.$inferInsert;

/**
 * Generate a single user with realistic data
 */
export function generateUser(): UserInsert {
  const fullName = faker.person.fullName();
  const firstName = fullName.split(' ')[0];
  const lastName = fullName.split(' ')[1] || '';
  const cleanName = fullName.toLowerCase().replaceAll(/[^a-z0-9]/g, '');

  return {
    name: fullName,
    email: faker.internet.email({ firstName, lastName }),
    emailVerified: false,
    image: faker.image.avatar(),
    role: 'user',
    username: faker.internet.username({ firstName, lastName }),
    displayUsername: `${firstName} ${lastName}`,
    address: JSON.stringify({
      city: faker.location.city(),
      country: faker.location.country(),
      postalCode: faker.location.zipCode(),
      state: faker.location.state(),
      street: faker.location.streetAddress(),
    }),
    phone: faker.phone.number(),
    website: faker.datatype.boolean({ probability: 0.3 })
      ? faker.internet.url()
      : `https://${cleanName}${faker.helpers.arrayElement(['.com', '.net', '.org', '.dev', '.io'])}`,
  };
}

/**
 * Generate multiple users
 */
export function generateUsers(count: number): UserInsert[] {
  return Array.from({ length: count }, () => generateUser());
}
