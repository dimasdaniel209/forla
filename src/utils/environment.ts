export type AppEnvironment = 'production' | 'development';

export const DEV_PATH_TOKEN = 'dev2409';

/**
 * Detect current environment based on URL path, query params, or hash.
 * - If path contains /dev2409 or query ?dev2409 or hash #/dev2409, it activates Development mode
 * - Otherwise defaults to Production mode
 */
export function getCurrentEnvironment(): AppEnvironment {
  if (typeof window === 'undefined') return 'production';
  
  const pathname = window.location.pathname.toLowerCase();
  const search = window.location.search.toLowerCase();
  const hash = window.location.hash.toLowerCase();

  // Support /dev2409, /forla/dev2409, /#/dev2409, ?dev2409, ?dev2409=true, ?env=dev, ?env=development
  if (
    pathname.includes(DEV_PATH_TOKEN) ||
    hash.includes(DEV_PATH_TOKEN) ||
    search.includes(DEV_PATH_TOKEN) ||
    search.includes('env=dev') ||
    search.includes('env=development')
  ) {
    return 'development';
  }

  return 'production';
}

/**
 * Return navigation URL to switch environment
 * Uses query parameter format (?dev2409) which is 100% compatible with GitHub Pages static hosting.
 */
export function getEnvironmentUrl(targetEnv: AppEnvironment): string {
  if (typeof window === 'undefined') return '/';
  
  const url = new URL(window.location.href);
  
  if (targetEnv === 'development') {
    // Set ?dev2409 parameter (safe for GitHub Pages SPAs)
    url.searchParams.set(DEV_PATH_TOKEN, 'true');
  } else {
    // Production: strip out dev tokens and queries
    url.pathname = url.pathname.replace(new RegExp(`/${DEV_PATH_TOKEN}/?`, 'gi'), '/');
    if (url.pathname === '') url.pathname = '/';
    url.searchParams.delete(DEV_PATH_TOKEN);
    url.searchParams.delete('env');
    url.hash = '';
  }

  return url.toString();
}
