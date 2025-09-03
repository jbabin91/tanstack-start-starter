/**
 * Location Resolution Utilities
 *
 * Handles IP geolocation and location data extraction
 * for session metadata using MaxMind GeoLite2 database.
 */

import maxmind, { type CityResponse, type Reader } from 'maxmind';

import { isLocalIP } from './ip-extraction';

// Cached database reader

let geoIPReader: Reader<CityResponse> | null = null;

export type LocationData = {
  city: string | null;
  region: string | null;
  countryCode: string | null; // ISO 2-letter code
  timezone: string | null;
  ispName: string | null;
  connectionType: 'wifi' | 'cellular' | 'ethernet' | 'unknown' | null;
};

/**
 * Resolve location data from IP address and request headers
 *
 * Uses Cloudflare headers when available, falls back to IP geolocation API
 * Production-ready approach that works in any deployment environment
 */
export async function resolveLocationFromIP(
  ipAddress: string | null,
  request?: Request | null,
): Promise<LocationData> {
  // Debug logging to see what IP we're getting
  console.log(
    'Location resolver received IP:',
    ipAddress,
    'isLocal:',
    isLocalIP(ipAddress),
  );

  if (!ipAddress || isLocalIP(ipAddress)) {
    return {
      city: 'Local Development',
      region: 'Localhost',
      countryCode: null,
      timezone: null,
      ispName: null,
      connectionType: null,
    };
  }

  // First, try to get data from Cloudflare headers
  const cloudflareData = extractCloudflareLocationData(request);

  // If we have Cloudflare country, try to get more detailed location
  if (cloudflareData.countryCode) {
    try {
      const detailedLocation = await getDetailedLocationData(ipAddress);

      // Combine Cloudflare data with detailed location
      return {
        countryCode: cloudflareData.countryCode,
        city: detailedLocation.city,
        region: detailedLocation.region,
        timezone: detailedLocation.timezone,
        ispName: detailedLocation.ispName,
        connectionType: detailedLocation.connectionType,
      };
    } catch (error) {
      console.warn(
        'Failed to get detailed location, using Cloudflare data only:',
        error,
      );

      // Fall back to just Cloudflare data
      return {
        countryCode: cloudflareData.countryCode,
        city: 'Unknown City',
        region: 'Unknown Region',
        timezone: null,
        ispName: null,
        connectionType: null,
      };
    }
  }

  // No Cloudflare data, try IP geolocation service directly
  try {
    return await getDetailedLocationData(ipAddress);
  } catch (error) {
    console.error('Failed to resolve location:', error);
    return getUnknownLocation();
  }
}

/**
 * Get placeholder location data for unknown locations
 */
function getUnknownLocation(): LocationData {
  return {
    city: 'Unknown City',
    region: 'Unknown Region',
    countryCode: null,
    timezone: null,
    ispName: null,
    connectionType: null,
  };
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
  if (!request) {
    return {};
  }

  const countryCode = request.headers.get('cf-ipcountry');

  return {
    countryCode:
      countryCode && isValidCountryCode(countryCode) ? countryCode : null,
  };
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

    console.log('MaxMind GeoLite2 database initialized successfully');
    return geoIPReader;
  } catch (error) {
    console.error('Failed to initialize MaxMind database:', error);
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
): Promise<LocationData> {
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
    console.error(
      'MaxMind geolocation lookup failed, falling back to API:',
      error,
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
): Promise<LocationData> {
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

    const data = await response.json();

    // Handle API error responses
    if (data.error) {
      throw new Error(`API Error: ${data.reason ?? data.error}`);
    }

    return {
      city: data.city ?? null,
      region: data.region ?? null,
      countryCode: data.country_code ?? null,
      timezone: data.timezone ?? null,
      ispName: data.org ?? null, // Organization/ISP name
      connectionType: inferConnectionType(data.org),
    };
  } catch (error) {
    console.error('IP geolocation API failed:', error);
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
