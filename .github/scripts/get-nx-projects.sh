#!/bin/bash
set -e

# Get list of projects with a specific target
# Usage: ./get-nx-projects.sh <target>
# Example: ./get-nx-projects.sh lint

TARGET=${1:-lint}

# Use Nx to show projects and filter those that have the target
yarn nx show projects --with-target=$TARGET 2>/dev/null | jq -R -s -c 'split("\n") | map(select(length > 0))'
