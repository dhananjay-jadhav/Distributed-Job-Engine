# Apollo Router Quick Start Guide

This guide will help you quickly set up and run the Apollo Router supergraph for the Distributed Job Engine.

## What is Apollo Router?

Apollo Router is a high-performance GraphQL gateway that unifies multiple GraphQL services (subgraphs) into a single, cohesive API (supergraph). Instead of calling each service separately, clients can make a single request to the router, which intelligently routes and combines data from all subgraphs.

## Quick Start

### Step 1: Start Dependencies

```bash
# Start PostgreSQL and Apache Pulsar
docker compose up -d postgres pulsar

# Run database migrations
yarn auth-migrate
```

### Step 2: Start Subgraph Services

Open two terminal windows:

**Terminal 1 - Auth Service:**
```bash
yarn nx serve auth-api
```

**Terminal 2 - Jobs Service:**
```bash
yarn nx serve jobs-api
```

Wait for both services to start successfully. You should see messages like:
```
🚀 Application is running on: http://localhost:3000/api
🚀 Application is running on: http://localhost:3001/api
```

### Step 3: Install Rover CLI

The Rover CLI is needed to compose the supergraph schema.

**Quick install (recommended):**
```bash
curl -sSL https://rover.apollo.dev/nix/latest | sh
```

**Alternative (via yarn):**
```bash
yarn global add @apollo/rover
```

**Verify installation:**
```bash
rover --version
```

### Step 4: Compose the Supergraph Schema

```bash
cd apps/router
./compose-supergraph.sh
```

This script will:
1. Check that Rover CLI is installed
2. Find the subgraph schemas from auth-api and jobs-api
3. Compose them into a single `supergraph-schema.graphql`
4. Validate the composition

You should see output like:
```
✅ Supergraph schema successfully composed!
📍 Output: /path/to/apps/router/supergraph-schema.graphql
```

### Step 5: Start the Apollo Router

**Terminal 3 - Apollo Router:**
```bash
cd ../..  # back to project root
docker compose up router
```

The router will start on **port 4000**.

### Step 6: Test the Supergraph

Open your browser and navigate to:
```
http://localhost:4000
```

You'll see the Apollo Router homepage with an interactive GraphQL explorer.

**Try this example query:**
```graphql
query {
  jobs {
    name
    description
  }
}
```

Note: Some queries may require authentication. First login to get a JWT token:

```graphql
mutation {
  login(loginInput: { email: "test@example.com", password: "password" }) {
    id
    email
  }
}
```

## Architecture Flow

```
Client Request
     │
     ▼
Apollo Router (port 4000)
     │
     ├──────────────┬──────────────┐
     │              │              │
     ▼              ▼              ▼
Auth Service   Jobs Service   Future Services
(port 3000)    (port 3001)
     │              │
     ▼              ▼
  Database      Pulsar
```

## Common Issues

### Issue: "Rover CLI is not installed"
**Solution:** Install Rover using the commands in Step 3 above.

### Issue: "Schema not found"
**Solution:** Make sure both auth-api and jobs-api services are built:
```bash
yarn nx build auth-api
yarn nx build jobs-api
```

### Issue: Router can't connect to subgraphs
**Solution:** 
1. Verify both services are running on ports 3000 and 3001
2. Check that `extra_hosts` in docker-compose.yaml is configured correctly
3. On Linux, you may need to use `host.docker.internal` instead of `host-gateway`

### Issue: "Connection refused" when starting router
**Solution:** Make sure auth-api and jobs-api are running before starting the router.

## Development Workflow

When you make changes to your GraphQL schemas:

1. **Update your code** in auth-api or jobs-api
2. **Restart the service** that changed
3. **Re-compose the supergraph:**
   ```bash
   cd apps/router
   ./compose-supergraph.sh
   ```
4. **Restart the router:**
   ```bash
   docker compose restart router
   ```

## Production Deployment

For production, you'll want to:

1. **Disable introspection** in `router.yaml`:
   ```yaml
   supergraph:
     introspection: false
   ```

2. **Configure proper CORS** in `router.yaml`

3. **Set up health checks** for monitoring

4. **Use managed federation** with Apollo Studio (optional)

5. **Deploy behind a load balancer**

## Next Steps

- Read the full [Router README](./README.md) for advanced configuration
- Explore the [Apollo Router documentation](https://www.apollographql.com/docs/router/)
- Learn about [GraphQL Federation](https://www.apollographql.com/docs/federation/)

## Support

If you encounter any issues:
1. Check the router logs: `docker compose logs router`
2. Verify subgraph health: 
   - `curl http://localhost:3000/api/health`
   - `curl http://localhost:3001/api/health`
3. Check the main README troubleshooting section
