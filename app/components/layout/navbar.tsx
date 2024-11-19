import { Link } from '@tanstack/react-router';
import { useTranslations } from 'use-intl';

import { ModeToggle } from '@/components/mode-toggle.tsx';

export function Navbar() {
  const t = useTranslations('navigation');

  return (
    <div className="flex justify-between p-2">
      <div className="flex items-center gap-2">
        <Link className="[&.active]:font-bold" to="/">
          {t('home')}
        </Link>
        <Link className="[&.active]:font-bold" to="/about">
          About
        </Link>
        <Link className="[&.active]:font-bold" to="/todo">
          Todo
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <Link className="[&.active]:font-bold" to="/sign-in">
          Sign In
        </Link>
        <Link className="[&.active]:font-bold" to="/sign-up">
          Sign Up
        </Link>
        <ModeToggle />
      </div>
    </div>
  );
}
