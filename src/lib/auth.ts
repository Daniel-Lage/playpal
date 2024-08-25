import type { AuthOptions } from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt", // <-- make sure to use jwt here
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    jwt: async ({ token, account }) => {
      if (!!account && account.access_token) {
        // token.refreshToken = account.refresh_token; // <-- adding the refresh_token here
        token.accessToken = account.access_token; // <-- adding the access_token here
      }
      return token;
    },
  },
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID ?? '',
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET ?? '',
    }),
  ],
};
