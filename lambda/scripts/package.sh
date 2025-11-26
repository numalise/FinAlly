#!/bin/bash

set -e

echo "=== Creating Deployment Package ==="

cd dist

# Create zip file
zip -r ../function.zip . -x "*.map" -q

cd ..

echo "✓ Package created: function.zip"
ls -lh function.zip
