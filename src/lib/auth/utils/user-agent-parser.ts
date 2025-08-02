/**
 * User Agent Parsing Utilities
 *
 * Provides type-safe parsing of user agent strings using ua-parser-js
 * to extract device, browser, and OS information with high accuracy.
 */

import { UAParser } from 'ua-parser-js';

export type DeviceType = 'mobile' | 'desktop' | 'tablet' | 'unknown';

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
      if (osLower.includes('ios') || osLower.includes('android')) {
        return 'mobile';
      }
      if (
        osLower.includes('windows') ||
        osLower.includes('mac') ||
        osLower.includes('linux')
      ) {
        return 'desktop';
      }
    }
    return 'desktop'; // Default assumption
  }

  switch (uaDeviceType.toLowerCase()) {
    case 'mobile': {
      return 'mobile';
    }
    case 'tablet': {
      return 'tablet';
    }
    case 'console':
    case 'smarttv':
    case 'wearable':
    case 'embedded': {
      return 'unknown';
    }
    default: {
      return 'desktop';
    }
  }
}

/**
 * Generate a user-friendly device name
 */
function generateDeviceName(
  deviceType: DeviceType,
  browserName: string | null,
  osName: string | null,
  deviceModel?: string | null,
): string {
  const typeNames = {
    mobile: 'Mobile Device',
    desktop: 'Desktop Computer',
    tablet: 'Tablet',
    unknown: 'Unknown Device',
  };

  let baseName = typeNames[deviceType];

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
  switch (deviceType) {
    case 'mobile': {
      return 'Mobile Device';
    }
    case 'tablet': {
      return 'Tablet';
    }
    case 'desktop': {
      return 'Desktop Computer';
    }
    default: {
      return 'Unknown Device';
    }
  }
}
