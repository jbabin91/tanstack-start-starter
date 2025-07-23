import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-arktype';
import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { nanoid } from '@/lib/nanoid';

export const users = pgTable('users', {
  id: text()
    .primaryKey()
    .$defaultFn(() => nanoid()),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: boolean()
    .$defaultFn(() => false)
    .notNull(),
  image: text(),
  createdAt: timestamp()
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp()
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  role: text(),
  banned: boolean(),
  banReason: text(),
  banExpires: timestamp(),
  username: text().unique(),
  displayUsername: text(),
  address: text(),
  phone: text(),
  website: text(),
});

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const updateUserSchema = createUpdateSchema(users);

export type InsertUser = typeof insertUserSchema.infer;
export type User = typeof selectUserSchema.infer;
export type UpdateUser = typeof updateUserSchema.infer;

export const sessions = pgTable('sessions', {
  id: text()
    .primaryKey()
    .$defaultFn(() => nanoid()),
  expiresAt: timestamp().notNull(),
  token: text().notNull().unique(),
  createdAt: timestamp().notNull(),
  updatedAt: timestamp().notNull(),
  ipAddress: text(),
  userAgent: text(),
  userId: text()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  impersonatedBy: text(),
  activeOrganizationId: text(),
});

export const insertSessionSchema = createInsertSchema(sessions);
export const selectSessionSchema = createSelectSchema(sessions);
export const updateSessionSchema = createUpdateSchema(sessions);

export type InsertSession = typeof insertSessionSchema.infer;
export type Session = typeof selectSessionSchema.infer;
export type UpdateSession = typeof updateSessionSchema.infer;

export const accounts = pgTable('accounts', {
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
  createdAt: timestamp().notNull(),
  updatedAt: timestamp().notNull(),
});

export const insertAccountSchema = createInsertSchema(accounts);
export const selectAccountSchema = createSelectSchema(accounts);
export const updateAccountSchema = createUpdateSchema(accounts);

export type InsertAccount = typeof insertAccountSchema.infer;
export type Account = typeof selectAccountSchema.infer;
export type UpdateAccount = typeof updateAccountSchema.infer;

export const verifications = pgTable('verifications', {
  id: text()
    .primaryKey()
    .$defaultFn(() => nanoid()),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp().notNull(),
  createdAt: timestamp().$defaultFn(() => /* @__PURE__ */ new Date()),
  updatedAt: timestamp().$defaultFn(() => /* @__PURE__ */ new Date()),
});

export const insertVerificationSchema = createInsertSchema(verifications);
export const selectVerificationSchema = createSelectSchema(verifications);
export const updateVerificationSchema = createUpdateSchema(verifications);

export type InsertVerification = typeof insertVerificationSchema.infer;
export type Verification = typeof selectVerificationSchema.infer;
export type UpdateVerification = typeof updateVerificationSchema.infer;

export const organizations = pgTable('organizations', {
  id: text()
    .primaryKey()
    .$defaultFn(() => nanoid()),
  name: text().notNull(),
  slug: text().unique(),
  logo: text(),
  createdAt: timestamp().notNull(),
  metadata: text(),
});

export const insertOrganizationSchema = createInsertSchema(organizations);
export const selectOrganizationSchema = createSelectSchema(organizations);
export const updateOrganizationSchema = createUpdateSchema(organizations);

export type InsertOrganization = typeof insertOrganizationSchema.infer;
export type Organization = typeof selectOrganizationSchema.infer;
export type UpdateOrganization = typeof updateOrganizationSchema.infer;

export const members = pgTable('members', {
  id: text()
    .primaryKey()
    .$defaultFn(() => nanoid()),
  organizationId: text()
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  userId: text()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  role: text().default('member').notNull(),
  createdAt: timestamp().notNull(),
});

export const insertMemberSchema = createInsertSchema(members);
export const selectMemberSchema = createSelectSchema(members);
export const updateMemberSchema = createUpdateSchema(members);

export type InsertMember = typeof insertMemberSchema.infer;
export type Member = typeof selectMemberSchema.infer;
export type UpdateMember = typeof updateMemberSchema.infer;

export const invitations = pgTable('invitations', {
  id: text()
    .primaryKey()
    .$defaultFn(() => nanoid()),
  organizationId: text()
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  email: text().notNull(),
  role: text(),
  status: text().default('pending').notNull(),
  expiresAt: timestamp().notNull(),
  inviterId: text()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
});

export const insertInvitationSchema = createInsertSchema(invitations);
export const selectInvitationSchema = createSelectSchema(invitations);
export const updateInvitationSchema = createUpdateSchema(invitations);

export type InsertInvitation = typeof insertInvitationSchema.infer;
export type Invitation = typeof selectInvitationSchema.infer;
export type UpdateInvitation = typeof updateInvitationSchema.infer;
