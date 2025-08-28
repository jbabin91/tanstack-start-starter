import type { DeviceType } from './user-agent-parser';

export type FingerprintData = {
  userAgent: string | null;
  ipAddress: string | null;
  deviceType: DeviceType;
  browserName: string | null;
  osName: string | null;
};

/**
 * Generate a device fingerprint from available data
 *
 * The fingerprint is used for:
 * - Device identification across sessions
 * - Security analysis
 * - Trusted device management
 */
export function generateDeviceFingerprint(data: FingerprintData): string {
  const fingerprintComponents = [
    data.userAgent,
    data.ipAddress,
    data.deviceType,
    data.browserName,
    data.osName,
  ]
    .filter(Boolean)
    .join('|');

  // Create a base64 hash (simplified for this implementation)
  // In production, consider using crypto.subtle.digest for SHA-256
  const fingerprint = Buffer.from(fingerprintComponents)
    .toString('base64')
    .slice(0, 32);

  return fingerprint;
}

/**
 * Calculate a basic security score based on available information
 *
 * Factors considered:
 * - Known browser and OS
 * - Standard user agent patterns
 * - IP address availability
 */
export function calculateSecurityScore(data: FingerprintData): number {
  let score = 50; // Base score

  // Bonus for known browser
  if (data.browserName) {
    score += 15;
  }

  // Bonus for known OS
  if (data.osName) {
    score += 15;
  }

  // Bonus for detailed user agent
  if (data.userAgent && data.userAgent.length > 50) {
    score += 10;
  }

  // Penalty for suspicious patterns
  if (data.userAgent && isSuspiciousUserAgent(data.userAgent)) {
    score -= 30;
  }

  // Bonus for standard device types
  if (data.deviceType !== 'unknown') {
    score += 10;
  }

  // Ensure score is within bounds
  return Math.max(0, Math.min(100, score));
}

/**
 * Check if user agent string appears suspicious
 * (Very basic implementation - production would use more sophisticated detection)
 */
function isSuspiciousUserAgent(userAgent: string): boolean {
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /headless/i,
    /phantom/i,
    /selenium/i,
    /curl/i,
    /wget/i,
  ];

  return suspiciousPatterns.some((pattern) => pattern.test(userAgent));
}

/**
 * Determine if a device should be initially trusted
 *
 * For now, we default to false for security.
 * In production, this could consider factors like:
 * - Corporate network detection
 * - Known safe IP ranges
 * - Previous successful authentication patterns
 */
export function shouldInitiallyTrustDevice(_data: FingerprintData): boolean {
  // Conservative approach - require explicit trust
  return false;
}
