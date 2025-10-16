#!/bin/bash

# Helper script to test GraphQL queries against Apollo Router
# Usage: ./test-queries.sh [query_name] [jwt_token]

ROUTER_URL="http://localhost:4000"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Apollo Router GraphQL Query Tester${NC}"
echo "===================================="
echo ""

# Function to make GraphQL request
graphql_query() {
    local query="$1"
    local token="$2"
    
    if [ -z "$token" ]; then
        curl --silent --request POST \
            --header 'content-type: application/json' \
            --url "$ROUTER_URL" \
            --data "{\"query\":\"$query\"}" | jq '.'
    else
        curl --silent --request POST \
            --header 'content-type: application/json' \
            --header "Authorization: Bearer $token" \
            --url "$ROUTER_URL" \
            --data "{\"query\":\"$query\"}" | jq '.'
    fi
}

case "$1" in
    "login")
        echo -e "${GREEN}Running Login Mutation...${NC}"
        EMAIL="${2:-admin@example.com}"
        PASSWORD="${3:-admin123}"
        graphql_query "mutation { login(loginInput: { email: \\\"$EMAIL\\\", password: \\\"$PASSWORD\\\" }) { id email } }"
        ;;
    
    "jobs")
        echo -e "${GREEN}Listing Jobs...${NC}"
        TOKEN="$2"
        graphql_query "query { jobs { name description } }" "$TOKEN"
        ;;
    
    "execute")
        echo -e "${GREEN}Executing Job...${NC}"
        JOB_NAME="${2:-Fibonacci}"
        TOKEN="$3"
        graphql_query "mutation { executeJob(jobName: \\\"$JOB_NAME\\\") }" "$TOKEN"
        ;;
    
    "user")
        echo -e "${GREEN}Getting User...${NC}"
        USER_ID="$2"
        TOKEN="$3"
        graphql_query "query { user(userId: \\\"$USER_ID\\\") { id email } }" "$TOKEN"
        ;;
    
    "introspection")
        echo -e "${GREEN}Running Introspection Query...${NC}"
        graphql_query "query { __schema { types { name } } }"
        ;;
    
    *)
        echo -e "${RED}Usage:${NC}"
        echo "  ./test-queries.sh login [email] [password]"
        echo "  ./test-queries.sh jobs [jwt_token]"
        echo "  ./test-queries.sh execute [job_name] [jwt_token]"
        echo "  ./test-queries.sh user [user_id] [jwt_token]"
        echo "  ./test-queries.sh introspection"
        echo ""
        echo -e "${BLUE}Examples:${NC}"
        echo "  ./test-queries.sh login admin@example.com admin123"
        echo "  ./test-queries.sh jobs eyJhbGc..."
        echo "  ./test-queries.sh execute Fibonacci eyJhbGc..."
        exit 1
        ;;
esac
