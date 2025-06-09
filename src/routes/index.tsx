import { useState } from 'react';

import viteLogo from '/vite.svg';
import reactLogo from '@/assets/react.svg';
import { CenteredLayout } from '@/components/layouts/centered-layout';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute({
  component: RouteComponent,
});

function RouteComponent() {
  const [count, setCount] = useState(0);

  return (
    <CenteredLayout>
      <div className="flex items-center justify-center">
        <a href="https://vite.dev" rel="noreferrer" target="_blank">
          <img alt="Vite logo" className="logo" src={viteLogo} />
        </a>
        <a href="https://react.dev" rel="noreferrer" target="_blank">
          <img alt="React logo" className="logo react" src={reactLogo} />
        </a>
      </div>
      <h1 className="text-5xl font-semibold">Vite + React</h1>
      <div className="flex flex-col items-center justify-center gap-2 p-[1.5em]">
        <Button
          onClick={() => {
            setCount((count) => count + 1);
          }}
        >
          count is {count}
        </Button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="text-[#888]">
        Click on the Vite and React logos to learn more
      </p>
    </CenteredLayout>
  );
}
