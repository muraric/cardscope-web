/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,

    // Prevent trailing slash redirects that break Apple Sign-In POST callbacks
    trailingSlash: false,
    skipTrailingSlashRedirect: true,

    // For web/Vercel: use standalone (supports API routes)
    // For mobile/Capacitor: use export (static files for bundling)
    // Set BUILD_FOR_MOBILE=true to build for mobile
    //
    // ⚠️ NOTE: Static export requires no API routes. Since mobile uses Capacitor
    // Google Auth plugin (not NextAuth API routes), this should work fine.
    // If build fails, you may need to use server.url in capacitor.config.ts instead.
    output: process.env.BUILD_FOR_MOBILE === 'true' ? 'export' : 'standalone',

    // When building for mobile, output to 'dist' directory to match Capacitor webDir
    ...(process.env.BUILD_FOR_MOBILE === 'true' && {
        distDir: 'dist',
    }),
};
module.exports = nextConfig;
