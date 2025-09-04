import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-arktype';
import { relations } from 'drizzle-orm';
import {
  bigint,
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

import { nanoid } from '@/lib/nanoid';

// Define role enums for type safety and database constraints
export const systemRoleEnum = pgEnum('system_role', [
  'user',
  'admin',
  'super_admin',
]);
export const organizationRoleEnum = pgEnum('organization_role', [
  'member',
  'admin',
  'owner',
]);

export const users = pgTable(
  'users',
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => nanoid()),
    name: text().notNull(),
    email: text().notNull().unique(),
    emailVerified: boolean()
      .$defaultFn(() => false)
      .notNull(),
    image: text(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    role: systemRoleEnum().default('user'),
    banned: boolean().default(false),
    banReason: text(),
    banExpires: timestamp({ withTimezone: true }),
    username: text().unique(),
    displayUsername: text(),
    address: text(),
    phone: text(),
    website: text(),
  },
  (table) => [index('users_email_idx').on(table.email)],
);

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const updateUserSchema = createUpdateSchema(users);

export type InsertUser = typeof insertUserSchema.infer;
export type User = typeof selectUserSchema.infer;
export type UpdateUser = typeof updateUserSchema.infer;

export const sessions = pgTable(
  'sessions',
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => nanoid()),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    token: text().notNull().unique(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text(),
    userAgent: text(),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    impersonatedBy: text(),
    activeOrganizationId: text(),
  },
  (table) => [
    index('sessions_user_id_idx').on(table.userId),
    index('sessions_token_idx').on(table.token),
    index('sessions_expires_at_idx').on(table.expiresAt),
  ],
);

export const insertSessionSchema = createInsertSchema(sessions);
export const selectSessionSchema = createSelectSchema(sessions);
export const updateSessionSchema = createUpdateSchema(sessions);

export type InsertSession = typeof insertSessionSchema.infer;
export type Session = typeof selectSessionSchema.infer;
export type UpdateSession = typeof updateSessionSchema.infer;

export const accounts = pgTable(
  'accounts',
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => nanoid()),
    accountId: text().notNull(),
    providerId: text().notNull(),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    accessToken: text(),
    refreshToken: text(),
    idToken: text(),
    accessTokenExpiresAt: timestamp(),
    refreshTokenExpiresAt: timestamp(),
    scope: text(),
    password: text(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index('accounts_user_id_idx').on(table.userId)],
);

export const insertAccountSchema = createInsertSchema(accounts);
export const selectAccountSchema = createSelectSchema(accounts);
export const updateAccountSchema = createUpdateSchema(accounts);

export type InsertAccount = typeof insertAccountSchema.infer;
export type Account = typeof selectAccountSchema.infer;
export type UpdateAccount = typeof updateAccountSchema.infer;

export const verifications = pgTable(
  'verifications',
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => nanoid()),
    identifier: text().notNull(),
    value: text().notNull(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index('verifications_identifier_idx').on(table.identifier)],
);

export const insertVerificationSchema = createInsertSchema(verifications);
export const selectVerificationSchema = createSelectSchema(verifications);
export const updateVerificationSchema = createUpdateSchema(verifications);

export type InsertVerification = typeof insertVerificationSchema.infer;
export type Verification = typeof selectVerificationSchema.infer;
export type UpdateVerification = typeof updateVerificationSchema.infer;

export const organizations = pgTable(
  'organizations',
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => nanoid()),
    name: text().notNull(),
    slug: text().unique(),
    logo: text(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    metadata: text(),
  },
  (table) => [index('organizations_slug_idx').on(table.slug)],
);

export const insertOrganizationSchema = createInsertSchema(organizations);
export const selectOrganizationSchema = createSelectSchema(organizations);
export const updateOrganizationSchema = createUpdateSchema(organizations);

export type InsertOrganization = typeof insertOrganizationSchema.infer;
export type Organization = typeof selectOrganizationSchema.infer;
export type UpdateOrganization = typeof updateOrganizationSchema.infer;

export const members = pgTable(
  'members',
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => nanoid()),
    organizationId: text()
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: organizationRoleEnum().default('member').notNull(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('members_user_id_idx').on(table.userId),
    index('members_organization_id_idx').on(table.organizationId),
  ],
);

export const insertMemberSchema = createInsertSchema(members);
export const selectMemberSchema = createSelectSchema(members);
export const updateMemberSchema = createUpdateSchema(members);

export type InsertMember = typeof insertMemberSchema.infer;
export type Member = typeof selectMemberSchema.infer;
export type UpdateMember = typeof updateMemberSchema.infer;

export const invitations = pgTable(
  'invitations',
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => nanoid()),
    organizationId: text()
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    email: text().notNull(),
    role: organizationRoleEnum().default('member'),
    status: text().default('pending').notNull(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    inviterId: text()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (table) => [
    index('invitations_organization_id_idx').on(table.organizationId),
    index('invitations_email_idx').on(table.email),
  ],
);

export const insertInvitationSchema = createInsertSchema(invitations);
export const selectInvitationSchema = createSelectSchema(invitations);
export const updateInvitationSchema = createUpdateSchema(invitations);

export type InsertInvitation = typeof insertInvitationSchema.infer;
export type Invitation = typeof selectInvitationSchema.infer;
export type UpdateInvitation = typeof updateInvitationSchema.infer;

export const rateLimits = pgTable(
  'rate_limits',
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => nanoid()),
    key: text(),
    count: integer(),
    lastRequest: bigint({ mode: 'number' }),
  },
  (table) => [
    index('rate_limits_key_idx').on(table.key),
    index('rate_limits_last_request_idx').on(table.lastRequest),
  ],
);

export const insertRateLimitSchema = createInsertSchema(rateLimits);
export const selectRateLimitSchema = createSelectSchema(rateLimits);
export const updateRateLimitSchema = createUpdateSchema(rateLimits);

export type InsertRateLimit = typeof insertRateLimitSchema.infer;
export type RateLimit = typeof selectRateLimitSchema.infer;
export type UpdateRateLimit = typeof updateRateLimitSchema.infer;

// ============================================================================
// Relations for type-safe joins with Drizzle ORM
// ============================================================================

export const membersRelations = relations(members, ({ one }) => ({
  user: one(users, {
    fields: [members.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [members.organizationId],
    references: [organizations.id],
  }),
}));

export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(members),
  invitations: many(invitations),
}));

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  memberships: many(members),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  organization: one(organizations, {
    fields: [invitations.organizationId],
    references: [organizations.id],
  }),
  inviter: one(users, {
    fields: [invitations.inviterId],
    references: [users.id],
  }),
}));
