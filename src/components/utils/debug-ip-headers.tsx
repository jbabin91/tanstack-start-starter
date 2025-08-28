import { useQuery } from '@tanstack/react-query';
import { createServerFn } from '@tanstack/react-start';
import { getWebRequest } from '@tanstack/react-start/server';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { extractIPAddress } from '@/lib/auth/utils/ip-extraction';

const debugIPHeaders = createServerFn({ method: 'GET' }).handler(() => {
  const request = getWebRequest();

  const headers: Record<string, string> = {};
  for (const [key, value] of request.headers.entries()) {
    // Only include headers that might contain IP info
    if (
      key.toLowerCase().includes('forward') ||
      key.toLowerCase().includes('real') ||
      key.toLowerCase().includes('client') ||
      key.toLowerCase().includes('cf-') ||
      key.toLowerCase().includes('x-') ||
      key.toLowerCase().includes('remote')
    ) {
      headers[key] = value;
    }
  }

  // Get what our extraction function returns
  const extraction = extractIPAddress(null, request);

  return {
    headers,
    extraction,
    allHeaderCount: [...request.headers.keys()].length,
  };
});

export function DebugIPHeaders() {
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
