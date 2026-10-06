import path from 'node:path';
import type { NextConfig } from 'next';
import { SECURITY_HEADERS } from './lib/security-headers';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // The Angular app's package-lock.json sits in the parent directory; pin the root to this project
  // so Turbopack doesn't infer the wrong workspace.
  turbopack: { root: path.resolve(process.cwd()) },
  async headers() {
    return [{ source: '/:path*', headers: SECURITY_HEADERS.map((header) => ({ ...header })) }];
  },
};

export default nextConfig;
