import { useEffect, useState } from 'react';

export function TailwindIndicator() {
  const [dimensions, setDimensions] = useState({ height: 0, width: 0 });

  useEffect(() => {
    function updateDimensions() {
      setDimensions({
        height: window.innerHeight,
        width: window.innerWidth,
      });
    }

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  const { width, height } = dimensions;

  if (process.env.NODE_ENV === 'production') return null;

  return (
    <div className="fixed bottom-12 left-2 z-50 flex items-center space-x-2 rounded-full bg-gray-800 px-2.5 py-1 font-mono text-xs font-medium text-white dark:bg-white dark:text-black">
      <span>
        {width.toLocaleString()} x {height.toLocaleString()}
      </span>
      <div className="h-4 w-px bg-white dark:bg-gray-800" />
      <span className="sm:hidden">XS</span>
      <span className="hidden sm:inline md:hidden">SM</span>
      <span className="hidden md:inline lg:hidden">MD</span>
      <span className="hidden lg:inline xl:hidden">LG</span>
      <span className="hidden xl:inline 2xl:hidden">XL</span>
      <span className="hidden 2xl:inline">2XL</span>
    </div>
  );
}
