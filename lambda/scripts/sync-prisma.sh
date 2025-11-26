#!/bin/bash
# Sync Prisma schema from database/ to lambda/

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

SOURCE="$PROJECT_ROOT/database/prisma/schema.prisma"
TARGET="$PROJECT_ROOT/lambda/prisma/schema.prisma"

if [ ! -f "$SOURCE" ]; then
  echo "Error: Source schema not found at $SOURCE"
  exit 1
fi

echo "Syncing Prisma schema..."
echo "  From: $SOURCE"
echo "  To:   $TARGET"

cp "$SOURCE" "$TARGET"

echo "✓ Prisma schema synced"
