/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["viem", "wagmi", "@rainbow-me/rainbowkit"],
  exclude: ["backend", "contracts"],
};

module.exports = nextConfig;
