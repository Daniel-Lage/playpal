export function storageKeyToCookieName(key: string) {
  return `playpal.${key.replaceAll(":", ".")}`;
}

export function getCookiePreferenceValue(
  cookieStore: { get(name: string): { value: string } | undefined },
  key: string,
) {
  return cookieStore.get(storageKeyToCookieName(key))?.value ?? null;
}
