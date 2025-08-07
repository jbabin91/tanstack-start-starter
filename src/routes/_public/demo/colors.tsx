import { createFileRoute } from '@tanstack/react-router';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/_public/demo/colors')({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: 'Color System Demo - Dev Only' }],
  }),
});

function RouteComponent() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold">Color System Demo</h1>
        <p className="text-muted-foreground">
          Showcasing the semantic colors in your design system
        </p>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Alert Components</h2>
          <div className="space-y-4">
            <Alert>
              <AlertTitle>Default Alert</AlertTitle>
              <AlertDescription>
                This is a default alert using the base colors.
              </AlertDescription>
            </Alert>

            <Alert variant="success">
              <AlertTitle>Success Alert</AlertTitle>
              <AlertDescription>
                This is a success alert - great for positive feedback!
              </AlertDescription>
            </Alert>

            <Alert variant="warning">
              <AlertTitle>Warning Alert</AlertTitle>
              <AlertDescription>
                This is a warning alert - use for caution messages.
              </AlertDescription>
            </Alert>

            <Alert variant="error">
              <AlertTitle>Error Alert</AlertTitle>
              <AlertDescription>
                This is an error alert - for error actions and errors.
              </AlertDescription>
            </Alert>

            <Alert variant="info">
              <AlertTitle>Info Alert</AlertTitle>
              <AlertDescription>
                This is an info alert - perfect for informational messages.
              </AlertDescription>
            </Alert>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">Color Swatches</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border p-4">
              <div className="bg-primary mb-2 h-12 w-full rounded"></div>
              <h3 className="text-primary font-semibold">Primary</h3>
              <p className="text-muted-foreground text-sm">Brand color</p>
            </div>

            <div className="rounded-lg border p-4">
              <div className="bg-secondary mb-2 h-12 w-full rounded"></div>
              <h3 className="text-secondary-foreground font-semibold">
                Secondary
              </h3>
              <p className="text-muted-foreground text-sm">Secondary brand</p>
            </div>

            <div className="rounded-lg border p-4">
              <div className="bg-success mb-2 h-12 w-full rounded"></div>
              <h3 className="text-success font-semibold">Success</h3>
              <p className="text-muted-foreground text-sm">Positive actions</p>
            </div>

            <div className="rounded-lg border p-4">
              <div className="bg-warning mb-2 h-12 w-full rounded"></div>
              <h3 className="text-warning font-semibold">Warning</h3>
              <p className="text-muted-foreground text-sm">Caution messages</p>
            </div>

            <div className="rounded-lg border p-4">
              <div className="bg-error mb-2 h-12 w-full rounded"></div>
              <h3 className="text-error font-semibold">Error</h3>
              <p className="text-muted-foreground text-sm">Errors & dangers</p>
            </div>

            <div className="rounded-lg border p-4">
              <div className="bg-info mb-2 h-12 w-full rounded"></div>
              <h3 className="text-info font-semibold">Info</h3>
              <p className="text-muted-foreground text-sm">Information</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">Usage Examples</h2>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button color="primary">Primary Button</Button>
              <Button color="secondary">Secondary Button</Button>
              <Button color="success">Success Button</Button>
              <Button color="warning">Warning Button</Button>
              <Button color="error">Destructive Button</Button>
              <Button color="info">Info Button</Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="bg-success h-3 w-3 rounded-full"></div>
                <span className="text-success">Online</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-warning h-3 w-3 rounded-full"></div>
                <span className="text-warning">Away</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-error h-3 w-3 rounded-full"></div>
                <span className="text-error">Offline</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-info h-3 w-3 rounded-full"></div>
                <span className="text-info">Busy</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
