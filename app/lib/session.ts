import { useSession } from 'vinxi/http';

export const getVinxiSessionHelper = () => {
  return useSession({
    name: 'vinxi-session',
    password: process.env.APP_SECRET,
  });
};
