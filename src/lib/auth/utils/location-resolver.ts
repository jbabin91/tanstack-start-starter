/**
 * Location Resolution Utilities
 *
 * Handles IP geolocation and location data extraction
 * for session metadata.
 */

import { isLocalIP } from './ip-extraction';

export type LocationData = {
  city: string | null;
  region: string | null;
  countryCode: string | null; // ISO 2-letter code
  timezone: string | null;
  ispName: string | null;
  connectionType: 'wifi' | 'cellular' | 'ethernet' | 'unknown' | null;
};

/**
 * Resolve location data from IP address
 *
 * Currently provides placeholder data for development.
 * In production, integrate with services like:
 * - MaxMind GeoLite2
 * - IPinfo
 * - ipapi
 * - ipgeolocation
 */
export function resolveLocationFromIP(ipAddress: string | null): LocationData {
  if (!ipAddress || isLocalIP(ipAddress)) {
    return {
      city: 'Local Development',
      region: 'Localhost',
      countryCode: null, // Don't use fake country codes
      timezone: null,
      ispName: null,
      connectionType: null,
    };
  }

  // For production, you would call an IP geolocation service here
  // Example with a hypothetical service:
  /*
  try {
    const response = await fetch(`https://api.ipgeolocation.io/ipgeo?apiKey=${API_KEY}&ip=${ipAddress}`);
    const data = await response.json();

    return {
      city: data.city,
      region: data.state_prov,
      countryCode: data.country_code2,
      timezone: data.time_zone.name,
      ispName: data.isp,
      connectionType: data.connection_type,
    };
  } catch (error) {
    console.error('Failed to resolve location:', error);
    return getUnknownLocation();
  }
  */

  return getUnknownLocation();
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
