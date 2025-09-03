import { createHash } from 'node:crypto';

import { faker } from '@faker-js/faker';

import type { sessions as sessionsTable } from '@/lib/db/schemas/auth';
import type {
  sessionActivityLog as sessionActivityLogTable,
  sessionMetadata as sessionMetadataTable,
  trustedDevices as trustedDevicesTable,
} from '@/lib/db/schemas/session-metadata';
import {
  generateActivityDetails,
  generateDeviceName,
  generateRequestPath,
  generateResponseStatus,
  SEED_CONSTANTS,
} from '@/lib/db/seed/utils/seed-utils';

type SessionInsert = typeof sessionsTable.$inferInsert;
type SessionMetadataInsert = typeof sessionMetadataTable.$inferInsert;
type TrustedDeviceInsert = typeof trustedDevicesTable.$inferInsert;
type ActivityLogInsert = typeof sessionActivityLogTable.$inferInsert;

export type SessionData = {
  sessions: SessionInsert[];
  sessionMetadata: SessionMetadataInsert[];
  trustedDevices: TrustedDeviceInsert[];
  activityLogs: ActivityLogInsert[];
};

/**
 * Generate a device fingerprint from device information
 */
function generateDeviceFingerprint(
  browser: string,
  osName: string,
  deviceType: string,
): string {
  const deviceInfo = `${browser}-${osName}-${deviceType}-${faker.internet.mac()}`;
  return createHash('sha256').update(deviceInfo).digest('hex');
}

/**
 * Generate activity logs for a session
 */
function generateActivityLogs(
  sessionId: string,
  userId: string,
  createdAt: Date,
  expiresAt: Date,
  isActive: boolean,
  osName: string,
  osVersions: string[],
): ActivityLogInsert[] {
  const activityCount = faker.number.int({ min: 5, max: 20 });
  const activityLogs: ActivityLogInsert[] = [];

  for (let j = 0; j < activityCount; j++) {
    const activityType = faker.helpers.arrayElement(
      SEED_CONSTANTS.activityTypes,
    );
    const activityTime = faker.date.between({
      from: createdAt,
      to: isActive ? new Date() : expiresAt,
    });

    activityLogs.push({
      sessionId,
      userId,
      activityType,
      activityDetails: generateActivityDetails(activityType),
      ipAddress: faker.internet.ipv4(),
      userAgent: `Mozilla/5.0 (${osName} ${faker.helpers.arrayElement(osVersions)}) AppleWebKit/537.36`,
      requestPath: generateRequestPath(activityType),
      httpMethod: faker.helpers.arrayElement(['GET', 'POST', 'PUT', 'DELETE']),
      responseStatus: generateResponseStatus(activityType),
      responseTimeMs: faker.number.int({ min: 50, max: 2000 }),
      createdAt: activityTime,
    });
  }

  return activityLogs;
}

/**
 * Generate session data for a single user
 */
export function generateSessionDataForUser(userId: string): SessionData {
  const sessionCount = faker.number.int({ min: 1, max: 3 });
  const sessions: SessionInsert[] = [];
  const sessionMetadata: SessionMetadataInsert[] = [];
  const trustedDevices: TrustedDeviceInsert[] = [];
  const activityLogs: ActivityLogInsert[] = [];

  for (let i = 0; i < sessionCount; i++) {
    const sessionId = faker.string.nanoid();
    const deviceType = faker.helpers.arrayElement(SEED_CONSTANTS.deviceTypes);
    const browser = faker.helpers.arrayElement(SEED_CONSTANTS.browsers);
    const os = faker.helpers.arrayElement(SEED_CONSTANTS.operatingSystems);
    const isActive = faker.datatype.boolean({ probability: 0.7 });
    const createdAt = faker.date.recent({ days: 30 });
    const expiresAt = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from creation

    // Generate device fingerprint
    const deviceFingerprint = generateDeviceFingerprint(
      browser,
      os.name,
      deviceType,
    );

    // Create session
    sessions.push({
      id: sessionId,
      token: faker.string.uuid(),
      userId,
      expiresAt,
      createdAt,
      updatedAt: createdAt,
      ipAddress: faker.internet.ipv4(),
      userAgent: `Mozilla/5.0 (${os.name} ${faker.helpers.arrayElement(os.versions)}) AppleWebKit/537.36 (KHTML, like Gecko) ${browser}/120.0.0.0`,
    });

    // Create session metadata
    const securityScore = faker.number.int({ min: 20, max: 95 });
    const isTrustedDevice =
      securityScore > 70 && faker.datatype.boolean({ probability: 0.4 });
    const usingCloudflareWarp = faker.datatype.boolean({ probability: 0.15 });

    sessionMetadata.push({
      sessionId,
      deviceFingerprint,
      deviceType,
      deviceName: generateDeviceName(deviceType, browser, os.name),
      browserName: browser,
      browserVersion: faker.system.semver(),
      osName: os.name,
      osVersion: faker.helpers.arrayElement(os.versions),
      isMobile: deviceType === 'mobile',
      countryCode: faker.location.countryCode(),
      region: faker.location.state(),
      city: faker.location.city(),
      timezone: faker.date.timeZone(),
      ispName: faker.company.name() + ' Communications',
      connectionType: faker.helpers.arrayElement(
        SEED_CONSTANTS.connectionTypes,
      ),
      cfDataCenter: faker.helpers.arrayElement([
        'LAX',
        'SFO',
        'CDG',
        'LHR',
        'NRT',
        'SIN',
        'SYD',
        'DFW',
        'IAD',
        'ORD',
      ]),
      cfRay:
        faker.string.alphanumeric({ length: 16 }) +
        '-' +
        faker.helpers.arrayElement(['LAX', 'SFO', 'CDG']),
      isSecureConnection: faker.datatype.boolean({ probability: 0.95 }),
      usingCloudflareWarp,
      securityScore,
      isTrustedDevice,
      trustFactors: {
        location_consistency: faker.number.float({
          min: 0.5,
          max: 1,
          fractionDigits: 2,
        }),
        device_age_days: faker.number.int({ min: 1, max: 365 }),
        behavior_score: faker.number.float({
          min: 0.6,
          max: 1,
          fractionDigits: 2,
        }),
      },
      suspiciousActivityCount: faker.number.int({ min: 0, max: 3 }),
      lastSecurityCheck: faker.date.recent({ days: 1 }),
      lastActivityAt: isActive ? faker.date.recent({ days: 1 }) : createdAt,
      pageViewsCount: faker.number.int({ min: 5, max: 150 }),
      requestsCount: faker.number.int({ min: 10, max: 500 }),
      lastPageVisited: faker.helpers.arrayElement([
        '/dashboard',
        '/profile',
        '/posts',
        '/settings',
        '/',
      ]),
      sessionDurationSeconds: faker.number.int({ min: 300, max: 7200 }),
    });

    // Create trusted device (30% chance if device is trusted)
    if (isTrustedDevice) {
      trustedDevices.push({
        userId,
        deviceFingerprint,
        deviceName: generateDeviceName(deviceType, browser, os.name),
        deviceType,
        trustLevel: faker.helpers.arrayElement(SEED_CONSTANTS.trustLevels),
        firstSeenAt: createdAt,
        lastSeenAt: faker.date.recent({ days: 1 }),
        trustedAt: faker.date.between({ from: createdAt, to: new Date() }),
        expiresAt: faker.datatype.boolean({ probability: 0.2 })
          ? faker.date.future({ years: 1 })
          : null,
        createdBySessionId: sessionId,
      });
    }

    // Generate activity logs for this session
    activityLogs.push(
      ...generateActivityLogs(
        sessionId,
        userId,
        createdAt,
        expiresAt,
        isActive,
        os.name,
        os.versions,
      ),
    );
  }

  return {
    sessions,
    sessionMetadata,
    trustedDevices,
    activityLogs,
  };
}

/**
 * Generate session data for multiple users
 */
export function generateSessionDataForUsers(userIds: string[]): SessionData {
  const allSessionData: SessionData = {
    sessions: [],
    sessionMetadata: [],
    trustedDevices: [],
    activityLogs: [],
  };

  for (const userId of userIds) {
    const userData = generateSessionDataForUser(userId);
    allSessionData.sessions.push(...userData.sessions);
    allSessionData.sessionMetadata.push(...userData.sessionMetadata);
    allSessionData.trustedDevices.push(...userData.trustedDevices);
    allSessionData.activityLogs.push(...userData.activityLogs);
  }

  return allSessionData;
}
