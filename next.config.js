/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,

    // 👇 This tells Next.js to generate static HTML in the /out folder
    output: 'export',
};
module.exports = nextConfig;
