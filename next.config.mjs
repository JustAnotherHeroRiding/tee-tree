/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.mjs");



/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  images: {
    domains: ['images.clerk.dev',
    'img.clerk.com',
    'www.gravatar.com',
  "res.cloudinary.com"]
  },

  /**
   * If you have `experimental: { appDir: true }` set, then you must comment the below `i18n` config
   * out.
   *
   * @see https://github.com/vercel/next.js/issues/41980
   */
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  swcMinify: true,
};

const withBundleAnalyzerModule = await import("@next/bundle-analyzer");
const withBundleAnalyzer = withBundleAnalyzerModule.default({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: false
});
export default withBundleAnalyzer(config);
