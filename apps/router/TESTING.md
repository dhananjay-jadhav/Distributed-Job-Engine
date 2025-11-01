# Apollo Router Testing & Validation Guide

This document provides testing procedures to validate the Apollo Router supergraph setup.

## Pre-requisites Checklist

Before testing, ensure:

- [ ] Docker and Docker Compose are installed
- [ ] Node.js v20+ is installed
- [ ] Yarn v4.10.3+ is installed
- [ ] Apollo Rover CLI is installed (`rover --version`)
- [ ] Dependencies are installed (`yarn install`)
- [ ] PostgreSQL is running (`docker compose up -d postgres`)
- [ ] Database migrations are completed (`yarn auth-migrate`)
- [ ] Apache Pulsar is running (`docker compose up -d pulsar`)

## Testing Procedures

### 1. Service Health Checks

#### Test Auth Service

```bash
# Start auth service
yarn nx serve auth-api

# In another terminal, check health
curl http://localhost:3000/api/health
```

**Expected Response:**
```json
{"status":"ok","info":{"prisma":{"status":"up"},"auth-controller":{"status":"up"}},"error":{},"details":{"prisma":{"status":"up"},"auth-controller":{"status":"up"}}}
```

#### Test Jobs Service

```bash
# Start jobs service
yarn nx serve jobs-api

# Check health
curl http://localhost:3001/api/health
```

**Expected Response:**
```json
{"status":"ok","info":{"jobs":{"status":"up"}},"error":{},"details":{"jobs":{"status":"up"}}}
```

### 2. Subgraph Schema Validation

#### Verify Auth Schema

```bash
cat apps/auth-api/src/schema.gql
```

**Expected Content:** Should include User type, login, createUser mutations, and user query.

#### Verify Jobs Schema

```bash
cat apps/jobs-api/src/schema.gql
```

**Expected Content:** Should include Job type, jobs query, and executeJob mutation.

### 3. Supergraph Composition

#### Compose Schema

```bash
yarn router:compose
```

**Expected Output:**
```
✅ Supergraph schema successfully composed!
📍 Output: /path/to/apps/router/supergraph-schema.graphql
```

#### Verify Supergraph Schema

```bash
cat apps/router/supergraph-schema.graphql | head -20
```

**Expected:** Should contain:
- Federation directives (@join, @link)
- Both AUTH and JOBS graphs defined
- Query and Mutation types

### 4. Router Container Build

#### Build Router Image

```bash
yarn router:build
```

**Expected:** Docker image builds successfully without errors.

#### Verify Image

```bash
docker images | grep apollo-router
```

**Expected:** Shows the apollo-router image.

### 5. Router Startup

#### Start Router

```bash
yarn router:start
```

**Expected Logs:**
```
apollo-router  | ... Apollo Router starting ...
apollo-router  | ... Listening on 0.0.0.0:4000
```

#### Check Router Health

```bash
curl http://localhost:8088/health
```

**Expected Response:**
```
ok
```

### 6. GraphQL API Testing

#### Test Introspection

```bash
curl -X POST http://localhost:4000 \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __schema { queryType { name } } }"}'
```

**Expected Response:**
```json
{
  "data": {
    "__schema": {
      "queryType": {
        "name": "Query"
      }
    }
  }
}
```

#### Test Login Mutation (Auth Subgraph)

```bash
curl -X POST http://localhost:4000 \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { login(loginInput: { email: \"test@example.com\", password: \"password\" }) { id email } }"
  }'
```

**Expected:** Returns user data or authentication error (depending on whether user exists).

#### Test Jobs Query (Jobs Subgraph)

First, create a user and login to get a JWT token, then:

```bash
curl -X POST http://localhost:4000 \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_JWT_TOKEN" \
  -d '{
    "query": "query { jobs { name description } }"
  }'
```

**Expected Response:**
```json
{
  "data": {
    "jobs": [
      {
        "name": "Fibonacci",
        "description": "Generate a Fibonacci sequence and store it in DB"
      }
    ]
  }
}
```

#### Test Unified Query (Federation)

```bash
curl -X POST http://localhost:4000 \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_JWT_TOKEN" \
  -d '{
    "query": "query { user(userId: \"USER_ID\") { id email } jobs { name } }"
  }'
```

**Expected:** Returns data from both auth and jobs subgraphs in a single response.

### 7. Browser Testing

#### Test GraphQL Explorer

1. Open browser: `http://localhost:4000`
2. **Expected:** Apollo Router homepage loads
3. Click "Query your server"
4. **Expected:** Interactive GraphQL explorer opens
5. Try example queries from EXAMPLES.md

#### Test CORS

1. Open browser console
2. Run:
```javascript
fetch('http://localhost:4000', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: '{ __typename }' })
})
.then(r => r.json())
.then(console.log)
```

**Expected:** No CORS errors, response data logged.

### 8. Error Handling Tests

#### Test Invalid Query

```bash
curl -X POST http://localhost:4000 \
  -H "Content-Type: application/json" \
  -d '{"query":"query { invalidField }"}'
```

**Expected:** Error response with appropriate GraphQL error message.

#### Test Subgraph Down

1. Stop auth-api service
2. Try a query that requires auth subgraph
3. **Expected:** Error indicating subgraph is unavailable

#### Test Authentication Failure

```bash
curl -X POST http://localhost:4000 \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { jobs { name } }"
  }'
```

**Expected:** Unauthorized error (since no JWT token provided).

### 9. Performance Testing

#### Response Time

```bash
time curl -X POST http://localhost:4000 \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __typename }"}'
```

**Expected:** Response time < 100ms for simple queries.

#### Concurrent Requests

```bash
# Install Apache Bench if not already installed
# sudo apt-get install apache2-utils

ab -n 100 -c 10 \
  -p query.json \
  -T "application/json" \
  http://localhost:4000/
```

**Expected:** All requests complete successfully.

### 10. Development Workflow Test

#### Schema Update Workflow

1. Modify a GraphQL resolver in auth-api or jobs-api
2. Restart the modified service
3. Run: `yarn router:compose`
4. Run: `yarn router:restart`
5. Verify changes are reflected in router

**Expected:** New schema changes available through router.

## Validation Checklist

After completing all tests, verify:

- [ ] All services start without errors
- [ ] Health checks pass for all services
- [ ] Supergraph schema composes successfully
- [ ] Router container builds and starts
- [ ] Introspection queries work
- [ ] Auth subgraph queries work
- [ ] Jobs subgraph queries work
- [ ] Unified queries work (federation)
- [ ] Authentication is enforced
- [ ] CORS is configured correctly
- [ ] Error handling works properly
- [ ] Browser interface works
- [ ] Performance is acceptable

## Troubleshooting

### Router fails to start

**Check logs:**
```bash
yarn router:logs
```

**Common issues:**
- Supergraph schema file missing or invalid
- Subgraphs not accessible
- Port 4000 already in use

**Solutions:**
- Re-run `yarn router:compose`
- Verify subgraphs are running
- Change port in router.yaml and docker-compose.yaml

### Subgraph connection errors

**Check network connectivity:**
```bash
docker compose exec router ping auth-api
docker compose exec router ping jobs-api
```

**Solution:** Verify `extra_hosts` configuration in docker-compose.yaml.

### Schema composition fails

**Check schema files exist:**
```bash
ls -la apps/auth-api/src/schema.gql
ls -la apps/jobs-api/src/schema.gql
```

**Solution:** Build services first: `yarn nx build auth-api && yarn nx build jobs-api`

## Automated Testing

### Integration Test Script

Create `apps/router/test-router.sh`:

```bash
#!/bin/bash
set -e

echo "Testing Apollo Router..."

# Test health
echo "1. Testing router health..."
curl -f http://localhost:8088/health || exit 1

# Test introspection
echo "2. Testing introspection..."
curl -f -X POST http://localhost:4000 \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __schema { queryType { name } } }"}' || exit 1

echo "All tests passed!"
```

### CI/CD Integration

Add to `.github/workflows/ci.yml`:

```yaml
- name: Test Apollo Router
  run: |
    yarn router:compose
    docker compose up -d router
    sleep 10
    ./apps/router/test-router.sh
```

## Success Criteria

The Apollo Router setup is considered successful when:

1. ✅ Router starts and responds to health checks
2. ✅ Supergraph schema includes all subgraphs
3. ✅ Individual subgraph queries work through router
4. ✅ Federated queries combining multiple subgraphs work
5. ✅ Authentication is properly enforced
6. ✅ CORS configuration allows expected origins
7. ✅ Error handling provides clear messages
8. ✅ Performance meets requirements
9. ✅ Documentation is clear and complete
10. ✅ Development workflow is streamlined

## Next Steps

After validation:

1. Configure production settings in router.yaml
2. Set up monitoring and alerting
3. Configure CI/CD pipelines
4. Document team workflows
5. Plan for scaling and high availability
