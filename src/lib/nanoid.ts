import { customAlphabet } from 'nanoid';

export const nanoid = customAlphabet(
  'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789',
  21,
);
