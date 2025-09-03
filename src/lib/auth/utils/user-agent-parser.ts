import { UAParser } from 'ua-parser-js';

import type { DeviceType } from '@/lib/db/schemas/session-metadata';

export type ParsedUserAgent = {
  deviceType: DeviceType;
  deviceName: string;
  browserName: string | null;
  browserVersion: string | null;
  osName: string | null;
  osVersion: string | null;
  isMobile: boolean;
};

/**
 * Parse user agent string into structured information using ua-parser-js
 *
 * This provides much more accurate parsing than regex-based approaches
 * and handles edge cases and new browsers/devices automatically.
 */
export function parseUserAgent(userAgent: string | null): ParsedUserAgent {
  if (!userAgent) {
    return {
      deviceType: 'unknown',
      deviceName: 'Unknown Device',
      browserName: null,
      browserVersion: null,
      osName: null,
      osVersion: null,
      isMobile: false,
    };
  }

  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  // Extract device information
  const deviceType = mapDeviceType(result.device.type, result.os.name);
  const isMobile = deviceType === 'mobile';

  // Extract browser information
  const browserName = result.browser.name ?? null;
  const browserVersion = result.browser.version ?? null;

  // Extract OS information
  const osName = result.os.name ?? null;
  const osVersion = result.os.version ?? null;

  // Generate friendly device name
  const deviceName = generateDeviceName(
    deviceType,
    browserName,
    osName,
    result.device.model,
  );

  return {
    deviceType,
    deviceName,
    browserName,
    browserVersion,
    osName,
    osVersion,
    isMobile,
  };
}

// Mobile OS indicators - compiled once for performance
const MOBILE_OS_INDICATORS = ['ios', 'android'] as const;
const DESKTOP_OS_INDICATORS = ['windows', 'mac', 'linux'] as const;
const UNKNOWN_DEVICE_TYPES = [
  'console',
  'smarttv',
  'wearable',
  'embedded',
] as const;

/**
 * Map ua-parser-js device types to our DeviceType enum
 */
function mapDeviceType(
  uaDeviceType: string | undefined,
  osName: string | undefined,
): DeviceType {
  if (!uaDeviceType) {
    // If no device type detected, infer from OS
    if (osName) {
      const osLower = osName.toLowerCase();
      if (
        MOBILE_OS_INDICATORS.some((indicator) => osLower.includes(indicator))
      ) {
        return 'mobile';
      }
      if (
        DESKTOP_OS_INDICATORS.some((indicator) => osLower.includes(indicator))
      ) {
        return 'desktop';
      }
    }
    return 'desktop'; // Default assumption
  }

  const deviceTypeLower = uaDeviceType.toLowerCase();

  if (deviceTypeLower === 'mobile') {
    return 'mobile';
  }
  if (deviceTypeLower === 'tablet') {
    return 'tablet';
  }
  if (UNKNOWN_DEVICE_TYPES.includes(deviceTypeLower as any)) {
    return 'unknown';
  }

  return 'desktop';
}

// Device type display names - compiled once for performance
const DEVICE_TYPE_NAMES = {
  mobile: 'Mobile Device',
  desktop: 'Desktop Computer',
  tablet: 'Tablet',
  unknown: 'Unknown Device',
} as const;

/**
 * Generate a user-friendly device name
 */
function generateDeviceName(
  deviceType: DeviceType,
  browserName: string | null,
  osName: string | null,
  deviceModel?: string | null,
): string {
  let baseName: string = DEVICE_TYPE_NAMES[deviceType];

  // Use specific device model if available (e.g., "iPhone", "Samsung Galaxy")
  if (deviceModel && deviceType !== 'desktop') {
    baseName = deviceModel;
  }

  if (browserName && osName) {
    return `${baseName} (${browserName} on ${osName})`;
  } else if (browserName) {
    return `${baseName} (${browserName})`;
  } else if (osName) {
    return `${baseName} (${osName})`;
  }

  return baseName;
}

/**
 * Get display name for device type
 */
export function getDeviceTypeDisplayName(deviceType: DeviceType): string {
  return DEVICE_TYPE_NAMES[deviceType];
}
