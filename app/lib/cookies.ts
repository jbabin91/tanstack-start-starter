import Cookies from 'js-cookie';

export function setCookie(name: string, value: string, maxAge?: number) {
  Cookies.set(name, value, {
    path: '/',
    ...(maxAge && { expires: maxAge / (60 * 60 * 24) }), // Convert seconds to days
  });
}
