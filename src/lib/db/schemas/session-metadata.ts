import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-arktype';
import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  varchar,
} from 'drizzle-orm/pg-core';

import { sessions, users } from '@/lib/db/schemas/auth';
import { nanoid } from '@/lib/nanoid';

// Enums for better type safety and performance
export const deviceTypeEnum = pgEnum('device_type', [
  'mobile',
  'desktop',
  'tablet',
  'unknown',
]);

export const trustLevelEnum = pgEnum('trust_level', ['high', 'medium', 'low']);

export const activityTypeEnum = pgEnum('activity_type', [
  'login',
  'logout',
  'page_view',
  'api_request',
  'security_event',
  'error',
]);

export const connectionTypeEnum = pgEnum('connection_type', [
  'wifi',
  'cellular',
  'ethernet',
  'unknown',
]);

// Session metadata table for detailed session tracking
export const sessionMetadata = pgTable(
  'session_metadata',
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => nanoid()),
    sessionId: text()
      .notNull()
      .references(() => sessions.id, { onDelete: 'cascade' }),

    // Device identification and characteristics
    deviceFingerprint: varchar({ length: 64 }).notNull(), // SHA-256 hash
    deviceType: deviceTypeEnum().notNull().default('unknown'),
    deviceName: varchar({ length: 255 }), // "iPhone 15", "Chrome on MacOS"
    browserName: varchar({ length: 100 }),
    browserVersion: varchar({ length: 50 }),
    osName: varchar({ length: 100 }),
    osVersion: varchar({ length: 50 }),
    isMobile: boolean().notNull().default(false),

    // Location and network information
    countryCode: varchar({ length: 2 }), // ISO 2-letter
    region: varchar({ length: 100 }),
    city: varchar({ length: 100 }),
    timezone: varchar({ length: 50 }),
    ispName: varchar({ length: 200 }),
    connectionType: connectionTypeEnum().default('unknown'),

    // Cloudflare-specific information
    cfDataCenter: varchar({ length: 10 }), // "CDG", "LAX", "LHR" etc.
    cfRay: varchar({ length: 50 }), // Full Cloudflare Ray ID for debugging
    isSecureConnection: boolean().default(false), // HTTPS vs HTTP
    usingCloudflareWarp: boolean().default(false), // Privacy-focused users

    // Security and trust scoring
    securityScore: integer().notNull().default(50), // 0-100
    isTrustedDevice: boolean().notNull().default(false),
    trustFactors: jsonb().$type<Record<string, any>>(), // Detailed trust calculation data
    suspiciousActivityCount: integer().notNull().default(0),
    lastSecurityCheck: timestamp({ withTimezone: true }),

    // Activity tracking
    lastActivityAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    pageViewsCount: integer().notNull().default(0),
    requestsCount: integer().notNull().default(0),
    lastPageVisited: text(),
    sessionDurationSeconds: integer().default(0),

    // Timestamps
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date()),
  },
  (table) => [
    // Performance indexes
    index('session_metadata_session_id_idx').on(table.sessionId),
    index('session_metadata_device_fingerprint_idx').on(
      table.deviceFingerprint,
    ),
    index('session_metadata_security_score_idx').on(table.securityScore),
    index('session_metadata_last_activity_idx').on(table.lastActivityAt),
    index('session_metadata_created_at_idx').on(table.createdAt),

    // Unique constraint to prevent duplicate metadata per session
    unique('session_metadata_session_id_unique').on(table.sessionId),
  ],
);

// Trusted devices for persistent device management
export const trustedDevices = pgTable(
  'trusted_devices',
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => nanoid()),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    deviceFingerprint: varchar({ length: 64 }).notNull(),
    deviceName: varchar({ length: 255 }).notNull(),
    deviceType: deviceTypeEnum().notNull(),
    trustLevel: trustLevelEnum().notNull().default('medium'),
    isActive: boolean().notNull().default(true),

    // Trust lifecycle
    firstSeenAt: timestamp({ withTimezone: true }).notNull(),
    lastSeenAt: timestamp({ withTimezone: true }).notNull(),
    trustedAt: timestamp({ withTimezone: true }).notNull(),
    expiresAt: timestamp({ withTimezone: true }), // Optional expiration
    createdBySessionId: text().references(() => sessions.id, {
      onDelete: 'set null',
    }),

    // Timestamps
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date()),
  },
  (table) => [
    // Performance indexes
    index('trusted_devices_user_id_active_idx').on(
      table.userId,
      table.isActive,
    ),
    index('trusted_devices_device_fingerprint_idx').on(table.deviceFingerprint),
    index('trusted_devices_expires_at_idx').on(table.expiresAt),
    index('trusted_devices_last_seen_at_idx').on(table.lastSeenAt),

    // Prevent duplicate active devices per user
    unique('trusted_devices_user_device_unique').on(
      table.userId,
      table.deviceFingerprint,
    ),
  ],
);

// Session activity log for audit trail and analytics
export const sessionActivityLog = pgTable(
  'session_activity_log',
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => nanoid()),
    sessionId: text()
      .notNull()
      .references(() => sessions.id, { onDelete: 'cascade' }),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }), // Denormalized for performance

    // Activity details
    activityType: activityTypeEnum().notNull(),
    activityDetails: jsonb().$type<Record<string, any>>(), // Flexible event data
    ipAddress: varchar({ length: 45 }), // IPv6 compatible
    userAgent: text(),
    requestPath: text(),
    httpMethod: varchar({ length: 10 }),
    responseStatus: integer(),
    responseTimeMs: integer(),

    // Timestamp
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // Performance indexes for common queries
    index('session_activity_log_session_created_idx').on(
      table.sessionId,
      table.createdAt,
    ),
    index('session_activity_log_user_created_idx').on(
      table.userId,
      table.createdAt,
    ),
    index('session_activity_log_activity_created_idx').on(
      table.activityType,
      table.createdAt,
    ),
    index('session_activity_log_created_at_idx').on(table.createdAt), // For partitioning and cleanup
    index('session_activity_log_ip_address_idx').on(table.ipAddress), // Security analysis

    // Composite indexes for complex queries
    index('session_activity_log_user_activity_idx').on(
      table.userId,
      table.activityType,
      table.createdAt,
    ),
    index('session_activity_log_session_activity_idx').on(
      table.sessionId,
      table.activityType,
    ),
  ],
);

// Relations for type-safe joins
export const sessionMetadataRelations = relations(
  sessionMetadata,
  ({ one }) => ({
    session: one(sessions, {
      fields: [sessionMetadata.sessionId],
      references: [sessions.id],
    }),
  }),
);

export const trustedDevicesRelations = relations(trustedDevices, ({ one }) => ({
  user: one(users, {
    fields: [trustedDevices.userId],
    references: [users.id],
  }),
  createdBySession: one(sessions, {
    fields: [trustedDevices.createdBySessionId],
    references: [sessions.id],
  }),
}));

export const sessionActivityLogRelations = relations(
  sessionActivityLog,
  ({ one }) => ({
    session: one(sessions, {
      fields: [sessionActivityLog.sessionId],
      references: [sessions.id],
    }),
    user: one(users, {
      fields: [sessionActivityLog.userId],
      references: [users.id],
    }),
  }),
);

// Arktype schemas for validation
export const insertSessionMetadataSchema = createInsertSchema(sessionMetadata);
export const selectSessionMetadataSchema = createSelectSchema(sessionMetadata);
export const updateSessionMetadataSchema = createUpdateSchema(sessionMetadata);

export const insertTrustedDeviceSchema = createInsertSchema(trustedDevices);
export const selectTrustedDeviceSchema = createSelectSchema(trustedDevices);
export const updateTrustedDeviceSchema = createUpdateSchema(trustedDevices);

export const insertSessionActivityLogSchema =
  createInsertSchema(sessionActivityLog);
export const selectSessionActivityLogSchema =
  createSelectSchema(sessionActivityLog);

// TypeScript types
export type InsertSessionMetadata = typeof insertSessionMetadataSchema.infer;
export type SessionMetadata = typeof selectSessionMetadataSchema.infer;
export type UpdateSessionMetadata = typeof updateSessionMetadataSchema.infer;

export type InsertTrustedDevice = typeof insertTrustedDeviceSchema.infer;
export type TrustedDevice = typeof selectTrustedDeviceSchema.infer;
export type UpdateTrustedDevice = typeof updateTrustedDeviceSchema.infer;

export type InsertSessionActivityLog =
  typeof insertSessionActivityLogSchema.infer;
export type SessionActivityLog = typeof selectSessionActivityLogSchema.infer;

// Device type and activity type unions for use in application code
export type DeviceType = (typeof deviceTypeEnum.enumValues)[number];
export type TrustLevel = (typeof trustLevelEnum.enumValues)[number];
export type ActivityType = (typeof activityTypeEnum.enumValues)[number];
export type ConnectionType = (typeof connectionTypeEnum.enumValues)[number];
