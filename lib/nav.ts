/** Mirrors Angular's routerLinkActive: Home matches exactly; other links match their whole subtree. */
export function isActiveLink(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}
