/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.scdn.co",
      },
      {
        protocol: "https",
        hostname: "**.spotifycdn.com",
      },
      { protocol: "https", hostname: "**.ytimg.com" },
      {
        protocol: "https",
        hostname: process.env.UPLOADTHING_APP_ID + ".ufs.sh",
        pathname: "/f/*",
      },
    ],
  },
};

export default config;
