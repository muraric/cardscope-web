/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    
    // Use standalone output for Capacitor
    output: 'standalone',
};
module.exports = nextConfig;
