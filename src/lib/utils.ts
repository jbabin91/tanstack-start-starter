import { type ClassValue, clsx } from 'clsx';
import Cookies from 'js-cookie';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class names
 * @param inputs - Class values
 * @returns Merged class names
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Set a cookie
 * @param name - Cookie name
 * @param value - Cookie value
 * @param options - Cookie options
 * @returns Cookie value
 */
export function setCookie(
  name: string,
  value: string,
  options?: {
    expires?: number | Date;
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  },
): string | undefined {
  return Cookies.set(name, value, options);
}

/**
 * Get a cookie
 * @param name - Cookie name
 * @returns Cookie value
 */
export function getCookie(name: string): string | undefined {
  return Cookies.get(name);
}

/**
 * Remove a cookie
 * @param name - Cookie name
 * @param options - Cookie options
 * @returns Cookie value
 */
export function removeCookie(
  name: string,
  options?: {
    path?: string;
    domain?: string;
  },
): void {
  return Cookies.remove(name, options);
}

/**
 * Get all cookies
 * @returns All cookies
 */
export function getAllCookies(): Record<string, string> {
  return Cookies.get();
}
