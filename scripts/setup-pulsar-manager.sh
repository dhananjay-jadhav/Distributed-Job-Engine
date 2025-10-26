#!/bin/bash

# Script to setup Pulsar Manager admin user
# This script creates a default admin user for Pulsar Manager
# Default credentials: admin / apachepulsar

echo "Setting up Pulsar Manager admin user..."

# Wait for Pulsar Manager to be ready
echo "Waiting for Pulsar Manager to start..."
MAX_RETRIES=30
RETRY_COUNT=0

while ! curl -s http://localhost:7750/pulsar-manager/csrf-token > /dev/null; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        echo "ERROR: Pulsar Manager did not start within expected time"
        echo "Please ensure docker-compose is running: docker-compose up -d"
        exit 1
    fi
    echo "Waiting... (attempt $RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
done

echo "Pulsar Manager is ready!"

# Get CSRF token
CSRF_TOKEN=$(curl -s http://localhost:7750/pulsar-manager/csrf-token)

if [ -z "$CSRF_TOKEN" ]; then
    echo "ERROR: Failed to get CSRF token"
    exit 1
fi

echo "Creating admin user..."

# Create admin user
RESPONSE=$(curl -s -w "\n%{http_code}" -H "X-XSRF-TOKEN: $CSRF_TOKEN" \
     -H "Cookie: XSRF-TOKEN=$CSRF_TOKEN" \
     -H "Content-Type: application/json" \
     -X PUT http://localhost:7750/pulsar-manager/users/superuser \
     -d '{"name":"admin","password":"apachepulsar","description":"Default admin user","email":"admin@pulsar.apache.org"}')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "204" ]; then
    echo "✅ Success! Admin user created."
    echo ""
    echo "Pulsar Manager Login Credentials:"
    echo "=================================="
    echo "URL:      http://localhost:9527"
    echo "Username: admin"
    echo "Password: apachepulsar"
    echo "=================================="
else
    echo "⚠️  Warning: Received HTTP code $HTTP_CODE"
    echo "Response: $BODY"
    echo ""
    echo "The admin user might already exist or there was an error."
    echo "Try logging in with:"
    echo "  Username: admin"
    echo "  Password: apachepulsar"
fi