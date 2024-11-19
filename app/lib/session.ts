import { type Simplify } from 'type-fest';
import { useSession } from 'vinxi/http';

import { type I18nSession } from '@/lib/i18n.ts';

type VinxiSession = Simplify<Partial<I18nSession>>;

export const getVinxiSessionHelper = () => {
  return useSession<VinxiSession>({
    name: 'vinxi-session',
    password: process.env.APP_SECRET,
  });
};
