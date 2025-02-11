import { createFileRoute, Link, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_layout/_layout-2')({
  component: LayoutComponent,
});

function LayoutComponent() {
  return (
    <div>
      <div>I&apos;m a nested layout</div>
      <div className="flex gap-2">
        <Link
          activeProps={{
            className: 'font-bold',
          }}
          to="/layout-a"
        >
          Layout A
        </Link>
        <Link
          activeProps={{
            className: 'font-bold',
          }}
          to="/layout-b"
        >
          Layout B
        </Link>
      </div>
      <div>
        <Outlet />
      </div>
    </div>
  );
}
