/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
        reactRefresh: false, // disable fast refresh if it keeps throwing
    },
    swcMinify: true,

    // 👇 This tells Next.js to generate static HTML in the /out folder
    //output: 'export',
};
module.exports = nextConfig;
