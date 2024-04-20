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
      {
        protocol: 'https',
        hostname: 'zcucbewoxamghschzbui.supabase.co',
        port: '',
        pathname: '/storage/v1/object/sign/image-post/**',
      },
     
    ],
  },

};

module.exports = nextConfig;
