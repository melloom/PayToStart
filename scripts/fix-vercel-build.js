#!/usr/bin/env node

/**
 * Fix for Vercel build error: ENOENT client-reference-manifest.js
 * This script creates an empty manifest file if it doesn't exist
 * to prevent Vercel's trace phase from failing
 */

const fs = require('fs');
const path = require('path');

// Try multiple possible paths (local and Vercel)
const possiblePaths = [
  path.join(process.cwd(), '.next', 'server', 'app', '(dashboard)', 'page_client-reference-manifest.js'),
  path.join(process.cwd(), '.next', 'server', 'app', '(dashboard)', 'page_client-reference-manifest.js'),
  // Vercel might use a different base path
  path.join('/vercel/path0', '.next', 'server', 'app', '(dashboard)', 'page_client-reference-manifest.js'),
];

for (const manifestPath of possiblePaths) {
  try {
    // Create directory if it doesn't exist
    const manifestDir = path.dirname(manifestPath);
    if (!fs.existsSync(manifestDir)) {
      fs.mkdirSync(manifestDir, { recursive: true });
    }

    // Create empty manifest file if it doesn't exist
    if (!fs.existsSync(manifestPath)) {
      fs.writeFileSync(manifestPath, 'module.exports = {};\n');
      console.log(`Created empty client-reference-manifest.js file at ${manifestPath}`);
    } else {
      console.log(`Manifest file already exists at ${manifestPath}`);
    }
  } catch (error) {
    // Ignore errors for paths that don't exist (like Vercel path on local)
    if (error.code !== 'ENOENT' && !error.message.includes('vercel')) {
      console.warn(`Warning: Could not create manifest at ${manifestPath}:`, error.message);
    }
  }
}

