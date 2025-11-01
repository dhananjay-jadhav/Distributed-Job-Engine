#!/bin/bash

# Script to compose the supergraph schema from subgraphs
# This requires the Rover CLI tool from Apollo

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_FILE="${SCRIPT_DIR}/supergraph-schema.graphql"

echo "🚀 Composing supergraph schema..."
echo "-----------------------------------"

# Check if rover is installed
if ! command -v rover &> /dev/null; then
    echo "❌ Error: Rover CLI is not installed"
    echo "Please install Rover: https://www.apollographql.com/docs/rover/getting-started"
    echo ""
    echo "Recommended installation (curl):"
    echo "  curl -sSL https://rover.apollo.dev/nix/latest | sh"
    echo ""
    echo "Alternative (npm):"
    echo "  npm install -g @apollo/rover"
    exit 1
fi

echo "✅ Rover CLI found: $(rover --version)"
echo ""

# Define subgraph schemas
AUTH_SCHEMA="${SCRIPT_DIR}/../auth-api/src/schema.gql"
JOBS_SCHEMA="${SCRIPT_DIR}/../jobs-api/src/schema.gql"

# Check if schema files exist
if [ ! -f "$AUTH_SCHEMA" ]; then
    echo "❌ Error: Auth schema not found at $AUTH_SCHEMA"
    echo "Please build the auth-api service first: yarn nx build auth-api"
    exit 1
fi

if [ ! -f "$JOBS_SCHEMA" ]; then
    echo "❌ Error: Jobs schema not found at $JOBS_SCHEMA"
    echo "Please build the jobs-api service first: yarn nx build jobs-api"
    exit 1
fi

echo "📄 Found subgraph schemas:"
echo "  - Auth: $AUTH_SCHEMA"
echo "  - Jobs: $JOBS_SCHEMA"
echo ""

# Create a temporary supergraph config file
# Using mktemp with template for better cross-platform compatibility
TEMP_CONFIG=$(mktemp -t compose-supergraph.XXXXXX)
cat > "$TEMP_CONFIG" << EOF
federation_version: =2.11.2
subgraphs:
  auth:
    routing_url: http://auth-api:3000/api/graphql
    schema:
      file: ${AUTH_SCHEMA}
  jobs:
    routing_url: http://jobs-api:3001/api/graphql
    schema:
      file: ${JOBS_SCHEMA}
EOF

echo "📝 Temporary config created at: $TEMP_CONFIG"
echo ""

# Compose the supergraph schema
echo "🔧 Running rover supergraph compose..."
if rover supergraph compose --config "$TEMP_CONFIG" > "$OUTPUT_FILE"; then
    echo ""
    echo "✅ Supergraph schema successfully composed!"
    echo "📍 Output: $OUTPUT_FILE"
    echo ""
    echo "Schema stats:"
    echo "  - Size: $(wc -c < "$OUTPUT_FILE" | xargs) bytes"
    echo "  - Lines: $(wc -l < "$OUTPUT_FILE" | xargs) lines"
    echo ""
    echo "You can now start the Apollo Router with:"
    echo "  docker compose up router"
else
    echo ""
    echo "❌ Error: Failed to compose supergraph schema"
    rm -f "$TEMP_CONFIG"
    exit 1
fi

# Cleanup
rm -f "$TEMP_CONFIG"

echo "🎉 Done!"
