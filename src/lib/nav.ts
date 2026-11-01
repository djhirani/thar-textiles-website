import { navigation } from "./content";

/** Home is listed first so the way back is always obvious. */
export const primaryNavigation = [{ label: "Home", href: "/" }, ...navigation];

/** Exact match for Home; section match for everything else. */
export function isCurrentRoute(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href.replace(/\/$/, ""));
}
