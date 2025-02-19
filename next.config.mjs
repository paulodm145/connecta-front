/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
      ignoreDuringBuilds: true, // Ignora ESLint na build
    },
    typescript: {
      ignoreBuildErrors: true, // Ignora erros de TypeScript na build
    },
  };

export default nextConfig;
