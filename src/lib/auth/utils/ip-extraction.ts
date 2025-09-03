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
export function extractIPAddress(
  sessionIP: string | null | undefined,
  request?: Request | null,
): IPExtractionResult {
  // First check if session already has IP
  if (sessionIP) {
    return {
      ipAddress: sessionIP,
      source: 'session',
    };
  }

  if (!request) {
    return {
      ipAddress: '127.0.0.1',
      source: 'fallback',
    };
  }

  // Try various proxy headers in order of preference
  // Prioritize Cloudflare headers first as they contain the real client IP
  const cfIP = request.headers.get('cf-connecting-ip');
  if (cfIP) {
    return {
      ipAddress: cfIP,
      source: 'cf-connecting-ip',
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
export function isLocalIP(ip: string | null): boolean {
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
