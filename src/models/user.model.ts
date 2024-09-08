export interface SimplifiedUser {
  external_urls: { spotify: string };
  followers: { href: string | null; total: number };
  href: string;
  id: string;
  type: "user";
  uri: string;
  display_name: string;
}

export interface SpotifyUser extends SimplifiedUser {
  country: string;
  email: string;
  explicit_content: { filter_enabled: boolean; filter_locked: boolean };
  product: "premium" | "free" | "open";
}

declare module "next-auth" {
  interface Session {
    user: User;
  }
  interface User {
    providerAccountId: string;
  }
}
