/** @type {import('next').NextConfig} */
const nextConfig = { 
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        port: '',
        pathname: '/8.x/initials/**',
      },
    ],
  },

};

module.exports = nextConfig;
