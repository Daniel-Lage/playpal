/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  images: {
    remotePatterns: [
      // spotify images
      {
        protocol: "https",
        hostname: "**.scdn.co",
      },
      {
        protocol: "https",
        hostname: "**.spotifycdn.com",
      },

      // youtube images
      { protocol: "https", hostname: "**.ytimg.com" },

      // uploadthing images
      {
        protocol: "https",
        hostname: process.env.UPLOADTHING_APP_ID + ".ufs.sh",
        pathname: "/f/*",
      },

      //
      {
        protocol: "https",
        hostname: "playpal-fm.vercel.app",
      },

      {
        protocol: "http",
        hostname: "localhost",
      }
    ],
  },
};

export default config;
