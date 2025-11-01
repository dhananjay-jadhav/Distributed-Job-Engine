# Apollo Router - Supergraph Gateway

This directory contains the configuration and setup for the Apollo Router, which serves as the supergraph gateway for the Distributed Job Engine's federated GraphQL architecture.

## Overview

The Apollo Router is a high-performance GraphQL gateway written in Rust that acts as the unified entry point for multiple GraphQL subgraphs:

- **Auth Service** (port 3000): Handles authentication, user management
- **Jobs Service** (port 3001): Handles job discovery and execution

The router composes these services into a single unified GraphQL API accessible at **port 4000**.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Client Application                 │
│              (Web/Mobile/API Consumer)               │
└────────────────────┬────────────────────────────────┘
                     │
                     │ GraphQL Queries
                     │ Port: 4000
                     ▼
        ┌────────────────────────────┐
        │     Apollo Router          │
        │     (Supergraph)           │
        │  - Query Planning          │
        │  - Federation              │
        │  - Response Merging        │
        └─────────┬────────┬─────────┘
                  │        │
         ┌────────┘        └────────┐
         │                          │
         ▼                          ▼
┌──────────────────┐      ┌──────────────────┐
│  Auth Subgraph   │      │  Jobs Subgraph   │
│   Port: 3000     │      │   Port: 3001     │
│                  │      │                  │
│ - login()        │      │ - jobs()         │
│ - createUser()   │      │ - executeJob()   │
│ - user()         │      │                  │
└──────────────────┘      └──────────────────┘
```

## Files

- **`router.yaml`**: Apollo Router configuration file
  - Defines subgraph endpoints
  - Configures CORS, headers, health checks
  - Sets up telemetry and logging

- **`Dockerfile`**: Docker image for the Apollo Router
  - Based on official Apollo Router image
  - Includes configuration and supergraph schema

- **`compose-supergraph.sh`**: Script to compose the supergraph schema
  - Uses Apollo Rover CLI
  - Combines subgraph schemas into a single supergraph schema
  - Outputs `supergraph-schema.graphql`

- **`supergraph-schema.graphql`**: Composed supergraph schema (generated)
  - Combined schema from all subgraphs
  - Used by the router at runtime

## Prerequisites

To work with the Apollo Router, you need:

1. **Docker** (for running the router in a container)
2. **Apollo Rover CLI** (for composing the supergraph schema)

### Installing Rover CLI

**Recommended (via curl):**
```bash
curl -sSL https://rover.apollo.dev/nix/latest | sh
```

**Alternative (via npm):**
```bash
npm install -g @apollo/rover
```

**Verify installation:**
```bash
rover --version
```

## Setup Instructions

### 1. Start the Subgraph Services

Before starting the router, ensure both subgraph services are running:

```bash
# Start PostgreSQL and other dependencies
docker compose up -d postgres pulsar

# Run database migrations
yarn auth-migrate

# Start auth service (in one terminal)
yarn nx serve auth-api

# Start jobs service (in another terminal)
yarn nx serve jobs-api
```

### 2. Compose the Supergraph Schema

Run the composition script to generate the supergraph schema:

```bash
cd apps/router
./compose-supergraph.sh
```

This will:
- Check for Rover CLI installation
- Locate the subgraph schemas
- Compose them into a single `supergraph-schema.graphql`
- Validate the composition

### 3. Start the Apollo Router

**Option A: Using Docker Compose (Recommended)**

```bash
# From the project root
docker compose up router
```

The router will be available at: **http://localhost:4000**

**Option B: Using Docker directly**

```bash
cd apps/router
docker build -t apollo-router .
docker run -p 4000:4000 -p 8088:8088 \
  -v $(pwd)/supergraph-schema.graphql:/dist/config/supergraph-schema.graphql \
  apollo-router
```

**Option C: Using Rover directly (for development)**

```bash
cd apps/router
rover dev \
  --supergraph-config supergraph.yaml \
  --router-config router.yaml
```

### 4. Verify the Router

**Health Check:**
```bash
curl http://localhost:8088/health
```

**GraphQL Playground:**
Open your browser and navigate to:
```
http://localhost:4000
```

**Example Query:**
```graphql
query {
  # From auth subgraph
  user(userId: "your-user-id") {
    id
    email
  }
  
  # From jobs subgraph
  jobs {
    name
    description
  }
}
```

## Configuration

### Configuration Files

Two router configuration files are provided:

1. **`router.yaml`** - Development configuration
   - Introspection enabled for easier debugging
   - Propagates all headers for convenience
   - Homepage/playground enabled
   - Suitable for local development

2. **`router.production.yaml`** - Production configuration
   - Introspection disabled for security
   - Explicitly lists allowed headers (authorization, cookie, etc.)
   - Homepage disabled
   - Query limits configured
   - Rate limiting examples included
   - Use this for staging/production deployments

To use the production config:
```bash
# In Dockerfile or docker-compose
ENV APOLLO_ROUTER_CONFIG_PATH=/dist/config/router.production.yaml
```

### Subgraph Endpoints

The router is configured to connect to:

- **Auth Service**: `http://auth-api:3000/api/graphql`
  - Uses service name `auth-api` for Docker networking
  - Falls back to `http://localhost:3000/api/graphql` for local development

- **Jobs Service**: `http://jobs-api:3001/api/graphql`
  - Uses service name `jobs-api` for Docker networking
  - Falls back to `http://localhost:3001/api/graphql` for local development

### Port Configuration

- **Router GraphQL API**: `4000`
- **Router Health Check**: `8088`
- **Auth Subgraph**: `3000`
- **Jobs Subgraph**: `3001`

### CORS Configuration

By default, the router allows:
- Apollo Studio (`https://studio.apollographql.com`)
- Credentials in requests

To add more origins, edit `router.yaml`:

```yaml
cors:
  origins:
    - https://studio.apollographql.com
    - http://localhost:3000
    - https://your-app.com
  allow_credentials: true
```

### Headers Propagation

**Development (`router.yaml`):**
All headers from client requests are automatically propagated to subgraphs for ease of testing.

**Production (`router.production.yaml`):**
Only specific headers are propagated for security:
- `authorization` - JWT/Bearer tokens
- `cookie` - Session cookies
- `x-request-id` - Request tracking
- `x-forwarded-for` - Client IP forwarding

To add more headers in production, update `router.production.yaml`:
```yaml
headers:
  all:
    request:
      - propagate:
          named: "your-header-name"
```

## Development Workflow

### Making Schema Changes

1. Update your subgraph schemas (in `auth-api` or `jobs-api`)
2. Rebuild the affected service to regenerate schema files
3. Re-compose the supergraph:
   ```bash
   cd apps/router
   ./compose-supergraph.sh
   ```
4. Restart the router:
   ```bash
   docker compose restart router
   ```

### Adding New Subgraphs

1. Add the subgraph configuration to `router.yaml`:
   ```yaml
   subgraphs:
     new-service:
       routing_url: http://new-service:3002/api/graphql
       health_check:
         enabled: true
         path: /api/health
   ```

2. Update the composition script to include the new schema
3. Re-compose the supergraph
4. Restart the router

## Monitoring and Observability

### Health Checks

The router performs automatic health checks on all subgraphs:
- **Interval**: 10 seconds
- **Timeout**: 5 seconds
- **Endpoint**: `/api/health`

### Logging

Logs are output in JSON format to stdout. Configure log level in `router.yaml`:

```yaml
telemetry:
  exporters:
    logging:
      stdout:
        enabled: true
        format: json
```

### Metrics

The router exposes Prometheus-compatible metrics. To enable:

```yaml
telemetry:
  exporters:
    metrics:
      prometheus:
        enabled: true
        listen: 0.0.0.0:9090
        path: /metrics
```

## Troubleshooting

### Router fails to start

**Check subgraph availability:**
```bash
curl http://localhost:3000/api/health
curl http://localhost:3001/api/health
```

**Verify supergraph schema:**
```bash
cat apps/router/supergraph-schema.graphql
```

**Check router logs:**
```bash
docker compose logs router
```

### Composition fails

**Ensure subgraphs are properly federated:**
- Check that resolvers use `@apollo/subgraph` decorators
- Verify federation version is v2
- Look for federation directives in schemas

**Check schema files exist:**
```bash
ls -la apps/auth-api/src/schema.gql
ls -la apps/jobs-api/src/schema.gql
```

### Query fails with subgraph error

**Enable debug mode:**
```yaml
supergraph:
  introspection: true
  
telemetry:
  exporters:
    logging:
      stdout:
        enabled: true
```

**Test subgraph directly:**
```bash
curl -X POST http://localhost:3000/api/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query { __typename }"}'
```

## Performance Tips

1. **Enable caching** for static queries
2. **Use persisted queries** for production
3. **Configure connection pooling** for subgraphs
4. **Monitor response times** and optimize slow subgraphs
5. **Use DataLoader** pattern in subgraphs to prevent N+1 queries

## Production Considerations

### Security

- **Disable introspection** in production:
  ```yaml
  supergraph:
    introspection: false
  ```

- **Configure rate limiting**:
  ```yaml
  traffic_shaping:
    global:
      max_requests_per_second: 1000
  ```

- **Use HTTPS** and proper TLS configuration

### Deployment

- Deploy router behind a CDN/load balancer
- Use container orchestration (Kubernetes, ECS, etc.)
- Configure horizontal scaling based on traffic
- Set up proper health checks and readiness probes

### Monitoring

- Integrate with APM tools (New Relic, DataDog, etc.)
- Set up alerts for error rates and latency
- Monitor subgraph health and availability
- Track query performance and optimization opportunities

## Resources

- [Apollo Router Documentation](https://www.apollographql.com/docs/router/)
- [Apollo Federation Documentation](https://www.apollographql.com/docs/federation/)
- [Rover CLI Documentation](https://www.apollographql.com/docs/rover/)
- [GraphQL Best Practices](https://www.apollographql.com/docs/apollo-server/performance/best-practices/)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Apollo Router logs
3. Consult Apollo documentation
4. Open an issue in the project repository
