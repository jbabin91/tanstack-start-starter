import { eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { sessionMetadata } from '@/lib/db/schemas';

import {
  calculateSecurityScore,
  generateDeviceFingerprint,
  shouldInitiallyTrustDevice,
} from './device-fingerprinting';
import { extractIPAddress } from './ip-extraction';
import { resolveLocationFromIP } from './location-resolver';
import { parseUserAgent } from './user-agent-parser';

export type SessionMetadataInput = {
  sessionId: string;
  sessionIP: string | null | undefined;
  request?: Request | null;
};

/**
 * Create comprehensive session metadata
 *
 * This function orchestrates all the different utilities to create
 * a complete session metadata record in the database.
 */
export async function createSessionMetadata(
  input: SessionMetadataInput,
): Promise<void> {
  const { sessionId, sessionIP, request } = input;

  // Extract user agent
  const userAgent = request?.headers?.get('user-agent') ?? null;

  // Extract IP address
  const { ipAddress } = extractIPAddress(sessionIP, request);

  // Parse user agent for device information
  const parsedUA = parseUserAgent(userAgent);

  // Generate device fingerprint
  const deviceFingerprint = generateDeviceFingerprint({
    userAgent,
    ipAddress,
    deviceType: parsedUA.deviceType,
    browserName: parsedUA.browserName,
    osName: parsedUA.osName,
  });

  // Calculate security score
  const securityScore = calculateSecurityScore({
    userAgent,
    ipAddress,
    deviceType: parsedUA.deviceType,
    browserName: parsedUA.browserName,
    osName: parsedUA.osName,
  });

  // Resolve location from IP and request headers
  const locationData = await resolveLocationFromIP(ipAddress, request);

  // Determine initial trust level
  const isTrustedDevice = shouldInitiallyTrustDevice({
    userAgent,
    ipAddress,
    deviceType: parsedUA.deviceType,
    browserName: parsedUA.browserName,
    osName: parsedUA.osName,
  });

  // Create the session metadata record
  await db.insert(sessionMetadata).values({
    sessionId,
    deviceFingerprint,
    deviceType: parsedUA.deviceType,
    deviceName: parsedUA.deviceName,
    browserName: parsedUA.browserName,
    browserVersion: parsedUA.browserVersion,
    osName: parsedUA.osName,
    osVersion: parsedUA.osVersion,
    isMobile: parsedUA.isMobile,
    countryCode: locationData.countryCode,
    region: locationData.region,
    city: locationData.city,
    timezone: locationData.timezone,
    ispName: locationData.ispName,
    connectionType: locationData.connectionType,
    securityScore,
    isTrustedDevice,
    suspiciousActivityCount: 0,
    lastActivityAt: new Date(),
    pageViewsCount: 0,
    requestsCount: 0,
    lastPageVisited: null,
    sessionDurationSeconds: null,
  });
}

/**
 * Update session activity tracking
 *
 * Call this function on significant user actions to update
 * session metadata with activity information.
 */
export async function updateSessionActivity(
  sessionId: string,
  activity: {
    pageViewsCount?: number;
    requestsCount?: number;
    lastPageVisited?: string;
    sessionDurationSeconds?: number;
  },
): Promise<void> {
  const updateData = {
    ...activity,
    lastActivityAt: new Date(),
    updatedAt: new Date(),
  };

  await db
    .update(sessionMetadata)
    .set(updateData)
    .where(eq(sessionMetadata.sessionId, sessionId));
}
