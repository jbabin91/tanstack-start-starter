/* eslint-disable sort-keys-fix/sort-keys-fix */
import { BsDiscord, BsGithub } from 'react-icons/bs';
import { FcGoogle } from 'react-icons/fc';
import { type IconBaseProps, type IconType } from 'react-icons/lib';

import { type InferAuthOptions } from '@/lib/auth.ts';
import { type ExtractUnionStrict } from '@/lib/utils.ts';

export type SocialProviderId = InferAuthOptions<'signInSocial'>['body']['provider'];

export type SupportedSocialProviderId = ExtractUnionStrict<
  SocialProviderId,
  'discord' | 'github' | 'google'
>;

export type SocialProvider = {
  id: SupportedSocialProviderId;
  name: string;
  icon: IconType;
  size: IconBaseProps['size'];
  logoColor: IconBaseProps['color'];
  textColor: string;
  backgroundColor: string;
};

export const socialProviders: SocialProvider[] = [
  {
    id: 'google',
    name: 'Google',
    icon: FcGoogle,
    size: 20,
    logoColor: undefined,
    textColor: '#000',
    backgroundColor: '#fff',
  },
  {
    id: 'discord',
    name: 'Discord',
    icon: BsDiscord,
    size: 20,
    logoColor: '#fff',
    textColor: '#fff',
    backgroundColor: '#5865f2',
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: BsGithub,
    size: 20,
    logoColor: '#fff',
    textColor: '#fff',
    backgroundColor: '#333',
  },
];
