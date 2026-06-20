/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    // Static export cannot use Next's image optimization server.
    unoptimized: true,
  },
};

export default nextConfig;
