/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
        reactRefresh: false, // disable fast refresh if it keeps throwing
    },
    swcMinify: true,

    // 👇 This tells Next.js to generate static HTML in the /out folder
    //output: 'export',

    // Configure webpack to handle Capacitor modules
    webpack: (config, { isServer }) => {
        if (!isServer) {
            // Exclude Capacitor modules from webpack bundling for client-side
            config.externals = config.externals || [];
            config.externals.push({
                '@capacitor/browser': 'commonjs @capacitor/browser',
                '@capacitor/core': 'commonjs @capacitor/core',
            });
        }
        return config;
    },
};
module.exports = nextConfig;
