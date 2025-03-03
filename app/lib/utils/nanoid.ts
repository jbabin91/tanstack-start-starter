import { customAlphabet } from 'nanoid';

export function nanoId(length = 14) {
  const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';
  return customAlphabet(alphabet, length)();
}
