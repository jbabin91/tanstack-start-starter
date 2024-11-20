import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { ModeToggle } from '@/components/mode-toggle';

export function Navbar() {
  const { t } = useTranslation();

  return (
    <div className="flex justify-between p-2">
      <div className="flex items-center gap-2">
        <Link className="[&.active]:font-bold" to="/">
          {t('navigation.home')}
        </Link>
        <Link className="[&.active]:font-bold" to="/about">
          {t('navigation.about')}
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
