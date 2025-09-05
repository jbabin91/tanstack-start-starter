/**
 * Location Resolution Utilities
 *
 * Handles IP geolocation and location data extraction
 * for session metadata using MaxMind GeoLite2 database.
 */

import { type } from 'arktype';
import maxmind, { type CityResponse, type Reader } from 'maxmind';

import { authLogger } from '@/lib/logger';

// Arktype schemas for external API responses
const CloudflareVisitorSchema = type({
  'scheme?': 'string',
});

const IPApiResponseSchema = type({
  'error?': 'boolean',
  'reason?': 'string',
  'city?': 'string',
  'region?': 'string',
  'country_code?': 'string',
  'timezone?': 'string',
  'org?': 'string',
});

export type IPExtractionResult = {
  ipAddress: string | null;
  source:
    | 'session'
    | 'x-forwarded-for'
    | 'x-real-ip'
    | 'cf-connecting-ip'
    | 'x-client-ip'
    | 'fallback';
};

/**
 * Extract IP address from session object and request headers
 */
function extractIPAddress(
  sessionIP: string | null | undefined,
  request?: Request | null,
): IPExtractionResult {
  if (!request) {
    return {
      ipAddress: sessionIP ?? '127.0.0.1',
      source: sessionIP ? 'session' : 'fallback',
    };
  }

  // ALWAYS prioritize Cloudflare headers first - they contain the real client IP
  // This overrides any session IP that might have been set by better-auth
  const cfIP = request.headers.get('cf-connecting-ip');
  if (cfIP) {
    return {
      ipAddress: cfIP,
      source: 'cf-connecting-ip',
    };
  }

  // Check session IP only if no Cloudflare header
  if (sessionIP) {
    return {
      ipAddress: sessionIP,
      source: 'session',
    };
  }

  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const ip = forwardedFor.split(',')[0]?.trim();
    if (ip) {
      return {
        ipAddress: ip,
        source: 'x-forwarded-for',
      };
    }
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return {
      ipAddress: realIP,
      source: 'x-real-ip',
    };
  }

  const clientIP = request.headers.get('x-client-ip');
  if (clientIP) {
    return {
      ipAddress: clientIP,
      source: 'x-client-ip',
    };
  }

  // Fallback for local development
  return {
    ipAddress: '127.0.0.1',
    source: 'fallback',
  };
}

/**
 * Determine if an IP address is a local/development IP
 */
function isLocalIP(ip: string | null): boolean {
  if (!ip) return true;

  return (
    ip.startsWith('127.') ||
    ip.startsWith('::1') ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    ip.startsWith('172.16.') ||
    ip === 'localhost'
  );
}

// Cached database reader

let geoIPReader: Reader<CityResponse> | null = null;

export type LocationData = {
  city?: string | null;
  region?: string | null;
  countryCode?: string | null; // ISO 2-letter code
  timezone?: string | null;
  ispName?: string | null;
  connectionType?: 'wifi' | 'cellular' | 'ethernet' | 'unknown' | null;
  cfDataCenter?: string;
  cfRay?: string;
  isSecureConnection?: boolean;
  usingCloudflareWarp?: boolean;
};

/**
 * Combined IP extraction and location resolution
 *
 * This streamlined function does both IP extraction and location resolution in one call
 * since they're always used together in session metadata creation.
 */
export async function resolveLocationAndIP(
  sessionIP: string | null | undefined,
  request?: Request | null,
): Promise<{
  ipAddress: string | null;
  source: string;
  locationData: LocationData;
}> {
  // Extract IP address from various sources
  const { ipAddress, source } = extractIPAddress(sessionIP, request);

  // For local development, return minimal data
  if (!ipAddress || isLocalIP(ipAddress)) {
    return {
      ipAddress,
      source,
      locationData: {
        city: 'Local Development',
        region: 'Localhost',
      },
    };
  }

  // Extract Cloudflare metadata
  const cloudflareData = extractCloudflareLocationData(request);

  // Try to get detailed location data
  try {
    const detailedLocation = await getDetailedLocationData(ipAddress);

    // Combine all available data
    return {
      ipAddress,
      source,
      locationData: {
        ...detailedLocation,
        ...cloudflareData, // This will only include fields that have values
      },
    };
  } catch (error) {
    authLogger.error({ err: error }, 'Failed to resolve location');

    return {
      ipAddress,
      source,
      locationData: cloudflareData.countryCode ? cloudflareData : {},
    };
  }
}

/**
 * Validate country code format (ISO 3166-1 alpha-2)
 */
export function isValidCountryCode(code: string | null): code is string {
  if (!code) return false;
  return /^[A-Z]{2}$/.test(code);
}

/**
 * Extract location data from Cloudflare headers
 */
function extractCloudflareLocationData(
  request?: Request | null,
): Partial<LocationData> {
  if (!request) return {};

  const result: Partial<LocationData> = {};

  // Country code
  const countryCode = request.headers.get('cf-ipcountry');
  if (countryCode && isValidCountryCode(countryCode)) {
    result.countryCode = countryCode;
  }

  // Ray ID and data center
  const cfRay = request.headers.get('cf-ray');
  if (cfRay) {
    result.cfRay = cfRay;
    // Extract data center from cf-ray (format: "requestId-datacenter")
    const dataCenter = cfRay.split('-')[1];
    if (dataCenter) {
      result.cfDataCenter = dataCenter;
    }
  }

  // Connection security
  const cfVisitor = request.headers.get('cf-visitor');
  if (cfVisitor) {
    try {
      const rawVisitor = JSON.parse(cfVisitor);
      const visitor = CloudflareVisitorSchema(rawVisitor);
      if (visitor instanceof type.errors) {
        // Invalid data, fall back to string check
        if (cfVisitor.includes('https')) {
          result.isSecureConnection = true;
        }
      } else if (visitor.scheme === 'https') {
        result.isSecureConnection = true;
      }
    } catch {
      // Fallback to checking the header value for 'https'
      if (cfVisitor.includes('https')) {
        result.isSecureConnection = true;
      }
    }
  }

  // WARP detection
  const cfWarpTagId = request.headers.get('cf-warp-tag-id');
  if (cfWarpTagId) {
    result.usingCloudflareWarp = true;
  }

  return result;
}

/**
 * Initialize MaxMind GeoLite2 database reader using geolite2-redist
 */
async function initializeGeoIPReader(): Promise<Reader<CityResponse>> {
  if (geoIPReader) {
    return geoIPReader;
  }

  try {
    // Dynamic import for geolite2-redist (ES module)
    const geolite2 = await import('geolite2-redist');

    // Use geolite2.open() method with type assertion to work around typing issues
    // This method handles database downloading and opening automatically
    const reader = await (geolite2 as any).open(
      'GeoLite2-City',
      (path: string) => maxmind.open<CityResponse>(path),
    );

    // Type assertion to ensure we get the correct reader type
    geoIPReader = reader as Reader<CityResponse>;

    return geoIPReader;
  } catch (error) {
    authLogger.error({ err: error }, 'Failed to initialize MaxMind database');
    throw new Error('Could not load GeoLite2 database');
  }
}

/**
 * Get detailed location data using MaxMind GeoLite2 database
 *
 * Much faster than API calls (up to 17,000% faster)
 * Works offline with auto-updating database from geolite2-redist
 * Falls back to API if database fails
 */
async function getDetailedLocationData(
  ipAddress: string,
): Promise<
  Omit<
    LocationData,
    'cfDataCenter' | 'cfRay' | 'isSecureConnection' | 'usingCloudflareWarp'
  >
> {
  try {
    const reader = await initializeGeoIPReader();
    const result = reader.get(ipAddress);

    if (!result) {
      throw new Error('No geolocation data found for IP');
    }

    // Extract location data from MaxMind response
    const city = result.city?.names?.en ?? null;
    const region = result.subdivisions?.[0]?.names?.en ?? null;
    const countryCode = result.country?.iso_code ?? null;
    const timezone = result.location?.time_zone ?? null;

    // MaxMind doesn't provide ISP data in the free GeoLite2-City database
    // For ISP data, you would need GeoLite2-ASN database
    return {
      city,
      region,
      countryCode,
      timezone,
      ispName: null, // Not available in City database
      connectionType: 'unknown', // Not available in City database
    };
  } catch (error) {
    authLogger.error(
      { err: error },
      'MaxMind geolocation lookup failed, falling back to API',
    );

    // Fallback to API approach
    return await getDetailedLocationDataAPI(ipAddress);
  }
}

/**
 * Fallback API-based geolocation for when MaxMind database fails
 */
async function getDetailedLocationDataAPI(
  ipAddress: string,
): Promise<
  Omit<
    LocationData,
    'cfDataCenter' | 'cfRay' | 'isSecureConnection' | 'usingCloudflareWarp'
  >
> {
  try {
    // Using ipapi.co free tier - no API key required for basic usage
    const response = await fetch(`https://ipapi.co/${ipAddress}/json/`, {
      headers: {
        'User-Agent': 'TanStack-Start-App/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const rawData = await response.json();
    const data = IPApiResponseSchema(rawData);

    if (data instanceof type.errors) {
      throw new TypeError(`Invalid API response: ${data.summary}`);
    }

    // Handle API error responses
    if (data.error) {
      throw new Error(`API Error: ${data.reason ?? 'Unknown error'}`);
    }

    return {
      city: data.city ?? null,
      region: data.region ?? null,
      countryCode: data.country_code ?? null,
      timezone: data.timezone ?? null,
      ispName: data.org ?? null, // Organization/ISP name
      connectionType: inferConnectionType(data.org ?? null),
    };
  } catch (error) {
    authLogger.error({ err: error }, 'IP geolocation API failed');
    throw error;
  }
}

/**
 * Infer connection type from ISP/organization name
 */
function inferConnectionType(
  orgName: string | null,
): LocationData['connectionType'] {
  if (!orgName) return 'unknown';

  const org = orgName.toLowerCase();

  if (
    org.includes('mobile') ||
    org.includes('cellular') ||
    org.includes('wireless')
  ) {
    return 'cellular';
  }

  if (
    org.includes('cable') ||
    org.includes('fiber') ||
    org.includes('broadband')
  ) {
    return 'ethernet';
  }

  return 'unknown';
}

/**
 * Get timezone from browser if available
 * (This would typically be done client-side and passed to server)
 */
export function getBrowserTimezone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return null;
  }
}
