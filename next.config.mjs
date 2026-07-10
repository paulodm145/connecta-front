/** @type {import('next').NextConfig} */
const nextConfig = {
    // Evita a dupla montagem dos componentes em desenvolvimento (Strict Mode),
    // que disparava duas vezes cada requisição de carga das listagens.
    reactStrictMode: false,
    eslint: {
      ignoreDuringBuilds: true, // Ignora ESLint na build
    },
    typescript: {
      ignoreBuildErrors: true, // Ignora erros de TypeScript na build
    },
  };

export default nextConfig;
