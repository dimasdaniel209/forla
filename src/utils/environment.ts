export type AppEnvironment = 'production' | 'development';

export const DEV_PATH_TOKEN = 'dev2409';

/**
 * Detect current environment based on URL path or query params
 * - If path contains /dev2409 or query ?env=dev or ?dev2409, it activates Development mode
 * - Otherwise defaults to Production mode
 */
export function getCurrentEnvironment(): AppEnvironment {
  if (typeof window === 'undefined') return 'production';
  
  const pathname = window.location.pathname.toLowerCase();
  const search = window.location.search.toLowerCase();

  // Support /dev2409, /dev2409/, /#/dev2409, ?dev2409, ?env=dev, ?env=development
  if (
    pathname.includes(`/${DEV_PATH_TOKEN}`) ||
    window.location.hash.toLowerCase().includes(DEV_PATH_TOKEN) ||
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
 */
export function getEnvironmentUrl(targetEnv: AppEnvironment): string {
  if (typeof window === 'undefined') return '/';
  
  const url = new URL(window.location.href);
  
  if (targetEnv === 'development') {
    // If path does not already have /dev2409, set it
    if (!url.pathname.includes(`/${DEV_PATH_TOKEN}`)) {
      url.pathname = `/${DEV_PATH_TOKEN}`;
    }
  } else {
    // Production: strip out /dev2409 and dev query params
    url.pathname = url.pathname.replace(new RegExp(`/${DEV_PATH_TOKEN}/?`, 'gi'), '/');
    if (url.pathname === '') url.pathname = '/';
    url.searchParams.delete(DEV_PATH_TOKEN);
    url.searchParams.delete('env');
  }

  return url.toString();
}
