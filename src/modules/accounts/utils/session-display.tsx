import type { ReactNode } from 'react';

import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import type { SessionMetadata } from '@/lib/db/schemas/session-metadata';

export type RiskIndicator = {
  icon: ReactNode;
  text: string;
  severity: 'high' | 'medium' | 'low';
};

/**
 * Get the appropriate device icon based on device type
 */
export function getDeviceIcon(deviceType?: string) {
  switch (deviceType?.toLowerCase()) {
    case 'mobile': {
      return <Icons.smartphone className="size-6" />;
    }
    case 'tablet': {
      return <Icons.tablet className="size-6" />;
    }
    case 'desktop': {
      return <Icons.monitor className="size-6" />;
    }
    default: {
      return <Icons.globe className="size-6" />;
    }
  }
}

/**
 * Get display name for device, prioritizing specific device name over generic type
 */
export function getDeviceDisplayName(
  deviceType?: string,
  deviceName?: string | null,
) {
  // Use specific device name if available
  if (deviceName) {
    return deviceName;
  }

  // Fall back to generic device type names
  switch (deviceType?.toLowerCase()) {
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

/**
 * Get security badge component based on security score
 */
export function getSecurityBadge(score?: number) {
  if (!score) return null;

  if (score >= 80) {
    return (
      <Badge className="flex items-center gap-1" variant="default">
        <Icons.shield className="size-3" />
        Secure
      </Badge>
    );
  }

  if (score >= 60) {
    return (
      <Badge className="flex items-center gap-1" variant="secondary">
        <Icons.shield className="size-3" />
        Moderate
      </Badge>
    );
  }

  return (
    <Badge className="flex items-center gap-1" variant="error">
      <Icons.alertCircle className="size-3" />
      Low Security
    </Badge>
  );
}

/**
 * Analyze session metadata and return array of security risk indicators
 */
export function getRiskIndicators(
  metadata?: SessionMetadata | null,
): RiskIndicator[] {
  const risks: RiskIndicator[] = [];

  if (!metadata) return risks;

  // Security score based risks
  if (metadata.securityScore && metadata.securityScore < 40) {
    risks.push({
      icon: <Icons.alertTriangle className="size-3" />,
      text: 'Very low security score',
      severity: 'high',
    });
  }

  // Suspicious activity
  if (
    metadata.suspiciousActivityCount &&
    metadata.suspiciousActivityCount > 0
  ) {
    risks.push({
      icon: <Icons.ban className="size-3" />,
      text: `${metadata.suspiciousActivityCount} suspicious ${metadata.suspiciousActivityCount === 1 ? 'activity' : 'activities'}`,
      severity: 'high',
    });
  }

  // Non-secure connection
  if (metadata.isSecureConnection === false) {
    risks.push({
      icon: <Icons.alertCircle className="size-3" />,
      text: 'Insecure HTTP connection',
      severity: 'medium',
    });
  }

  // Long inactive sessions (over 30 days)
  if (metadata.lastActivityAt) {
    const lastActivity = new Date(metadata.lastActivityAt);
    const daysSinceActivity = Math.floor(
      (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysSinceActivity > 30) {
      risks.push({
        icon: <Icons.clock className="size-3" />,
        text: `Inactive for ${daysSinceActivity} days`,
        severity: 'low',
      });
    }
  }

  return risks;
}

/**
 * Format location string from session metadata
 */
export function formatLocation(metadata?: SessionMetadata | null): string {
  if (!metadata) return 'Unknown location';

  if (metadata.city && metadata.region && metadata.countryCode) {
    return `${metadata.city}, ${metadata.region}, ${metadata.countryCode.toUpperCase()}`;
  }

  if (metadata.city && metadata.region) {
    return `${metadata.city}, ${metadata.region}`;
  }

  if (metadata.countryCode) {
    return metadata.countryCode.toUpperCase();
  }

  return 'Unknown location';
}

/**
 * Check if session has technical details worth showing
 */
export function hasTechnicalDetails(
  metadata?: SessionMetadata | null,
): boolean {
  if (!metadata) return false;

  return Boolean(
    Boolean(metadata.cfDataCenter) ||
      Boolean(metadata.connectionType) ||
      metadata.isSecureConnection !== null ||
      Boolean(metadata.usingCloudflareWarp),
  );
}

/**
 * Format session duration in human-readable format
 */
export function formatSessionDuration(seconds?: number | null): string | null {
  if (!seconds || seconds <= 0) return null;

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}
