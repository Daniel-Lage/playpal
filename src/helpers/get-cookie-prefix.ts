export function getCookiePrefix(sessionUserId: string | undefined): string {
  return sessionUserId ? `playpal.${sessionUserId}.` : "playpal.";
}
