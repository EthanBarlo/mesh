import { createMDX } from 'fumadocs-mdx/next';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // Emit a self-contained server bundle for the Docker runtime stage.
  output: 'standalone',
  // The app lives in apps/docs but its content + lockfile resolution span the
  // repo root (it reads ../../docs), so trace files from the repo root.
  outputFileTracingRoot: path.join(__dirname, '../../'),
};

export default withMDX(config);
