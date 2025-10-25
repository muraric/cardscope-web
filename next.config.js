/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    
    // Explicitly disable static export for API routes
    output: undefined,
};
module.exports = nextConfig;
