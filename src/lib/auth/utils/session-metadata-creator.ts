import { eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { sessionMetadata } from '@/lib/db/schemas';

import {
  calculateSecurityScore,
  generateDeviceFingerprint,
  shouldInitiallyTrustDevice,
} from './device-fingerprinting';
import { resolveLocationAndIP } from './location-resolver';
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

  // Parse user agent for device information
  const parsedUA = parseUserAgent(userAgent);

  // Get IP address and location data in one call
  const { ipAddress, locationData } = await resolveLocationAndIP(
    sessionIP,
    request,
  );

  // Create shared session data object (used by multiple functions)
  const sessionData = {
    userAgent,
    ipAddress,
    deviceType: parsedUA.deviceType,
    browserName: parsedUA.browserName,
    osName: parsedUA.osName,
  };

  // Generate device fingerprint, security score, and trust level
  const deviceFingerprint = generateDeviceFingerprint(sessionData);
  const securityScore = calculateSecurityScore(sessionData);
  const isTrustedDevice = shouldInitiallyTrustDevice(sessionData);

  // Create the session metadata record - let database handle defaults
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
    cfDataCenter: locationData.cfDataCenter,
    cfRay: locationData.cfRay,
    isSecureConnection: locationData.isSecureConnection,
    usingCloudflareWarp: locationData.usingCloudflareWarp,
    securityScore,
    isTrustedDevice,
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
