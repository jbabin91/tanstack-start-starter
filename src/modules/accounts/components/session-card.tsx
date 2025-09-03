import { RelativeTime } from '@/components/datetime';
import { Icons } from '@/components/icons';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { SessionWithDetails } from '@/modules/accounts/api/get-sessions';
import {
  formatLocation,
  formatSessionDuration,
  getDeviceDisplayName,
  getDeviceIcon,
  getRiskIndicators,
  getSecurityBadge,
  hasTechnicalDetails,
} from '@/modules/accounts/utils/session-display';

type SessionCardProps = {
  session: SessionWithDetails;
  isCurrentSession: boolean;
  onRevoke: (sessionId: string) => Promise<void>;
};

export function SessionCard({
  session,
  isCurrentSession,
  onRevoke,
}: SessionCardProps) {
  const metadata = session.metadata;

  const riskIndicators = getRiskIndicators(metadata);

  return (
    <Card className={isCurrentSession ? 'border-primary' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getDeviceIcon(metadata?.deviceType)}
            <div>
              <CardTitle className="text-base">
                {getDeviceDisplayName(
                  metadata?.deviceType,
                  metadata?.deviceName,
                )}
                {isCurrentSession && (
                  <Badge className="ml-2" variant="outline">
                    Current
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-sm">
                {metadata?.browserName && metadata?.osName
                  ? `${metadata.browserName} on ${metadata.osName}`
                  : (metadata?.browserName ??
                    metadata?.osName ??
                    'Unknown browser/OS')}
                {metadata?.browserVersion && (
                  <span className="text-muted-foreground text-xs">
                    {' '}
                    v{metadata.browserVersion}
                  </span>
                )}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getSecurityBadge(metadata?.securityScore)}
            {metadata?.isTrustedDevice && (
              <Badge variant="secondary">Trusted</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Location</p>
            <p className="font-medium">{formatLocation(metadata)}</p>
            {metadata?.timezone && (
              <p className="text-muted-foreground text-xs">
                {metadata.timezone}
              </p>
            )}
          </div>
          <div>
            <p className="text-muted-foreground">IP Address</p>
            <p className="font-medium">{session.ipAddress ?? 'Unknown'}</p>
            {metadata?.ispName && (
              <p className="text-muted-foreground text-xs">
                {metadata.ispName}
              </p>
            )}
          </div>
          <div>
            <p className="text-muted-foreground">Last Activity</p>
            {metadata?.lastActivityAt ? (
              <RelativeTime
                className="font-medium"
                date={new Date(metadata.lastActivityAt)}
              />
            ) : (
              <p className="font-medium">Unknown</p>
            )}
            {metadata?.lastPageVisited && (
              <p className="text-muted-foreground truncate text-xs">
                {metadata.lastPageVisited}
              </p>
            )}
          </div>
          <div>
            <p className="text-muted-foreground">Created</p>
            <RelativeTime
              className="font-medium"
              date={new Date(session.createdAt)}
            />
            {formatSessionDuration(metadata?.sessionDurationSeconds) && (
              <p className="text-muted-foreground text-xs">
                {formatSessionDuration(metadata?.sessionDurationSeconds)} active
              </p>
            )}
          </div>
        </div>

        {/* Enhanced technical details - collapsible */}
        {hasTechnicalDetails(metadata) && (
          <details className="text-xs">
            <summary className="text-muted-foreground hover:text-foreground cursor-pointer">
              Technical Details
            </summary>
            <div className="bg-muted/30 mt-2 grid grid-cols-2 gap-2 rounded-md p-3">
              {metadata?.cfDataCenter && (
                <div>
                  <p className="text-muted-foreground">Data Center</p>
                  <p className="font-medium">{metadata.cfDataCenter}</p>
                </div>
              )}
              {metadata?.connectionType &&
                metadata.connectionType !== 'unknown' && (
                  <div>
                    <p className="text-muted-foreground">Connection</p>
                    <p className="font-medium capitalize">
                      {metadata.connectionType}
                    </p>
                  </div>
                )}
              {metadata?.isSecureConnection !== null && (
                <div>
                  <p className="text-muted-foreground">Protocol</p>
                  <p className="font-medium">
                    {metadata?.isSecureConnection ? 'HTTPS' : 'HTTP'}
                  </p>
                </div>
              )}
              {metadata?.usingCloudflareWarp && (
                <div>
                  <p className="text-muted-foreground">Privacy</p>
                  <p className="flex items-center gap-1 font-medium">
                    <Icons.shield className="size-3" />
                    Cloudflare WARP
                  </p>
                </div>
              )}
              {metadata?.pageViewsCount !== undefined &&
                metadata.pageViewsCount > 0 && (
                  <div>
                    <p className="text-muted-foreground">Page Views</p>
                    <p className="font-medium">
                      {metadata.pageViewsCount.toLocaleString()}
                    </p>
                  </div>
                )}
              {metadata?.requestsCount !== undefined &&
                metadata.requestsCount > 0 && (
                  <div>
                    <p className="text-muted-foreground">Requests</p>
                    <p className="font-medium">
                      {metadata.requestsCount.toLocaleString()}
                    </p>
                  </div>
                )}
            </div>
          </details>
        )}

        {/* Security risk indicators */}
        {riskIndicators.length > 0 && (
          <div className="border-destructive bg-destructive/10 space-y-2 rounded-md border-l-4 p-3">
            <p className="text-destructive-foreground flex items-center gap-1 text-sm font-medium">
              <Icons.alertTriangle className="size-4" />
              Security Alerts
            </p>
            <ul className="text-muted-foreground space-y-1 text-xs">
              {riskIndicators.map((risk) => (
                <li key={risk.text} className="flex items-center gap-2">
                  {risk.icon}
                  {risk.text}
                </li>
              ))}
            </ul>
          </div>
        )}

        {!isCurrentSession && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="w-full" color="error" size="sm">
                Revoke Session
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Revoke Session?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will immediately sign out this device. You&apos;ll need
                  to sign in again on that device to access your account.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-error text-error-foreground hover:bg-error/90"
                  onClick={() => onRevoke(session.id)}
                >
                  Revoke Session
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardContent>
    </Card>
  );
}
