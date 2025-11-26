#!/bin/bash

set -e

echo "=== Building Lambda Function ==="

# Sync Prisma schema
./scripts/sync-prisma.sh

# Clean previous build
rm -rf dist function.zip

# Generate Prisma Client
echo "Generating Prisma Client..."
npm run prisma:generate

# Create dist directory
mkdir -p dist

# Build TypeScript with esbuild
echo "Compiling TypeScript..."
npm run build

# Create minimal package.json for Lambda (ES Module support)
echo "Creating Lambda package.json..."
cat > dist/package.json << 'PKGJSON'
{
  "type": "module"
}
PKGJSON

# Copy Prisma runtime files
echo "Copying Prisma files..."
mkdir -p dist/node_modules/.prisma/client
cp -r node_modules/.prisma/client/* dist/node_modules/.prisma/client/
mkdir -p dist/node_modules/@prisma/client
cp -r node_modules/@prisma/client/* dist/node_modules/@prisma/client/

echo "✓ Build complete"
