import { faker } from '@faker-js/faker';

import type {
  ActivityType,
  ConnectionType,
  DeviceType,
  TrustLevel,
} from '@/lib/db/schemas/session-metadata';

/**
 * Generate a realistic device name based on device type, browser, and OS
 */
export function generateDeviceName(
  deviceType: DeviceType,
  browser: string,
  osName: string,
): string {
  const deviceNames = {
    mobile: [
      'iPhone 15 Pro',
      'iPhone 14',
      'Samsung Galaxy S24',
      'Google Pixel 8',
      'OnePlus 12',
      'iPhone 13 mini',
    ],
    desktop: [
      `${browser} on ${osName}`,
      `${osName} Desktop`,
      `${browser} Browser`,
    ],
    tablet: [
      'iPad Pro',
      'iPad Air',
      'Samsung Galaxy Tab',
      'Surface Pro',
      'iPad mini',
    ],
    unknown: ['Unknown Device'],
  };

  const names = deviceNames[deviceType] || deviceNames.unknown;
  return faker.helpers.arrayElement(names);
}

/**
 * Generate activity-specific details based on activity type
 */
export function generateActivityDetails(
  activityType: ActivityType,
): Record<string, unknown> {
  switch (activityType) {
    case 'login': {
      return {
        method: faker.helpers.arrayElement(['email', 'oauth', 'sso']),
        success: faker.datatype.boolean({ probability: 0.95 }),
        twoFactorUsed: faker.datatype.boolean({ probability: 0.3 }),
      };
    }
    case 'logout': {
      return {
        method: faker.helpers.arrayElement(['manual', 'timeout', 'force']),
        sessionDurationMs: faker.number.int({ min: 60_000, max: 7_200_000 }),
      };
    }
    case 'page_view': {
      return {
        pageTitle: faker.lorem.words(3),
        referrer: faker.internet.url(),
        loadTime: faker.number.int({ min: 200, max: 3000 }),
      };
    }
    case 'api_request': {
      return {
        endpoint: faker.helpers.arrayElement([
          '/api/posts',
          '/api/users',
          '/api/auth',
        ]),
        method: faker.helpers.arrayElement(['GET', 'POST', 'PUT', 'DELETE']),
        responseSize: faker.number.int({ min: 100, max: 10_000 }),
      };
    }
    case 'security_event': {
      return {
        eventType: faker.helpers.arrayElement([
          'suspicious_location',
          'multiple_failed_attempts',
          'unusual_device',
          'rate_limit_exceeded',
        ]),
        severity: faker.helpers.arrayElement(['low', 'medium', 'high']),
        blocked: faker.datatype.boolean({ probability: 0.4 }),
      };
    }
    case 'error': {
      return {
        errorCode: faker.helpers.arrayElement(['404', '500', '403', '429']),
        errorMessage: faker.lorem.sentence(),
        stackTrace: faker.datatype.boolean({ probability: 0.2 }),
      };
    }
    default: {
      return {};
    }
  }
}

/**
 * Generate request path based on activity type
 */
export function generateRequestPath(activityType: ActivityType): string {
  const paths = {
    login: ['/auth/login', '/auth/callback', '/auth/verify'],
    logout: ['/auth/logout'],
    page_view: ['/', '/dashboard', '/profile', '/posts', '/settings', '/about'],
    api_request: [
      '/api/posts',
      '/api/users/me',
      '/api/auth/session',
      '/api/organizations',
    ],
    security_event: ['/auth/login', '/api/auth/session', '/auth/verify'],
    error: ['/', '/api/posts', '/dashboard', '/api/users'],
  };

  const typePaths = paths[activityType] || paths.page_view;
  return faker.helpers.arrayElement(typePaths);
}

/**
 * Generate HTTP response status code based on activity type
 */
export function generateResponseStatus(activityType: ActivityType): number {
  const statusCodes = {
    login: [200, 201, 400, 401, 429],
    logout: [200, 204],
    page_view: [200, 404, 500],
    api_request: [200, 201, 400, 401, 403, 404, 500],
    security_event: [200, 401, 403, 429],
    error: [400, 401, 403, 404, 500, 503],
  };

  const codes = statusCodes[activityType] || [200];
  return faker.helpers.arrayElement(codes);
}

/**
 * Common constants for seeding
 */
export const SEED_CONSTANTS = {
  deviceTypes: ['mobile', 'desktop', 'tablet', 'unknown'] as DeviceType[],
  connectionTypes: [
    'wifi',
    'cellular',
    'ethernet',
    'unknown',
  ] as ConnectionType[],
  trustLevels: ['high', 'medium', 'low'] as TrustLevel[],
  activityTypes: [
    'login',
    'logout',
    'page_view',
    'api_request',
    'security_event',
    'error',
  ] as ActivityType[],
  browsers: ['Chrome', 'Safari', 'Firefox', 'Edge', 'Opera'],
  operatingSystems: [
    { name: 'iOS', versions: ['17.0', '16.5', '15.8'] },
    { name: 'Android', versions: ['14', '13', '12'] },
    { name: 'Windows', versions: ['11', '10'] },
    { name: 'macOS', versions: ['14.0', '13.6', '12.7'] },
    { name: 'Linux', versions: ['Ubuntu 22.04', 'Ubuntu 20.04', 'Fedora 38'] },
  ],
};
