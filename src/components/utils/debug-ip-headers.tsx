import { useQuery } from '@tanstack/react-query';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { resolveLocationAndIP } from '@/lib/auth/utils/location-resolver';

const debugIPHeaders = createServerFn({ method: 'GET' }).handler(async () => {
  const request = getRequest();

  // All headers we use for IP tracking and location resolution
  const TRACKED_HEADERS = [
    // IP extraction headers
    'cf-connecting-ip',
    'x-forwarded-for',
    'x-real-ip',
    'x-client-ip',
    // Cloudflare location/security headers
    'cf-ipcountry',
    'cf-ray',
    'cf-visitor',
    'cf-warp-tag-id',
    // Additional proxy headers (for debugging)
    'x-forwarded-proto',
    'x-forwarded-host',
  ] as const;

  const headers: Record<string, string> = {};
  for (const [key, value] of request.headers.entries()) {
    if (TRACKED_HEADERS.includes(key.toLowerCase() as any)) {
      headers[key] = value;
    }
  }

  // Get what our extraction function returns
  const { ipAddress, source } = await resolveLocationAndIP(null, request);

  return {
    allHeaderCount: [...request.headers.keys()].length,
    extraction: { ipAddress, source },
    headers,
  };
});

export function DebugIPHeaders() {
  // TODO: Remove this component once IP tracking is verified in production
  const { data, isLoading, error } = useQuery({
    queryKey: ['debug-ip-headers'],
    queryFn: () => debugIPHeaders(),
  });

  if (isLoading)
    return <div className="text-muted-foreground">Loading headers...</div>;
  if (error)
    return <div className="text-destructive">Error: {String(error)}</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          IP Debug Info
          <Badge variant="secondary">
            {data?.allHeaderCount} total headers
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="mb-2 font-medium">Current Extraction Result:</h4>
          <pre className="bg-muted overflow-x-auto rounded-md border p-3 text-sm">
            {JSON.stringify(data?.extraction, null, 2)}
          </pre>
        </div>

        <div>
          <h4 className="mb-2 font-medium">Available IP-related Headers:</h4>
          {Object.keys(data?.headers ?? {}).length > 0 ? (
            <pre className="bg-muted max-h-64 overflow-auto rounded-md border p-3 text-sm">
              {JSON.stringify(data?.headers, null, 2)}
            </pre>
          ) : (
            <div className="bg-muted/50 text-muted-foreground rounded-md border p-4 text-center text-sm">
              No IP-related headers found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
