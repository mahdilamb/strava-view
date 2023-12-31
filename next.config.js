/** @type {import('next').NextConfig} */

const nextConfig = {
    reactStrictMode: false,
    output: 'standalone',
    experimental: {
        serverActions: {
            bodySizeLimit: '2mb',
        },
    },
};

module.exports = nextConfig;
