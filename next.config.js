/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  webpack: (config, { isServer }) => {
    // Handle Radix UI and other problematic packages
    config.externals = [...(config.externals || [])];
    
    // Optimize chunk configuration
    config.optimization.splitChunks = {
      ...config.optimization.splitChunks,
      cacheGroups: {
        ...config.optimization.splitChunks.cacheGroups,
        radixUI: {
          test: /[\\/]node_modules[\\/](@radix-ui)[\\/]/,
          name: 'vendor-radix-ui',
          priority: 30,
          reuseExistingChunk: true,
          chunks: 'all',
        },
      },
    };
    
    return config;
  },
};

module.exports = nextConfig;
