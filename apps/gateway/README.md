# Apollo Gateway

This is the Apollo Gateway application that provides a unified GraphQL supergraph by combining multiple subgraphs using Apollo Federation v2.

## Overview

The gateway uses `IntrospectAndCompose` to dynamically fetch and compose schemas from the following subgraphs:

- **Auth Subgraph** (`http://localhost:3000/api/graphql`): Provides authentication and user management operations
- **Jobs Subgraph** (`http://localhost:3001/api/graphql`): Provides job execution and management operations

## Configuration

The gateway can be configured using environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `GATEWAY_PORT` | `4000` | Port on which the gateway runs |
| `AUTH_SUBGRAPH_URL` | `http://localhost:3000/api/graphql` | URL of the auth subgraph |
| `JOBS_SUBGRAPH_URL` | `http://localhost:3001/api/graphql` | URL of the jobs subgraph |

## Running the Gateway

### Prerequisites

Before starting the gateway, ensure both subgraph services are running:

1. Start the auth service:
   ```bash
   yarn nx serve auth-api
   ```

2. Start the jobs service:
   ```bash
   yarn nx serve jobs-api
   ```

### Start the Gateway

```bash
yarn nx serve gateway
# Gateway runs on http://localhost:4000/api/graphql
```

## Health Check

The gateway includes a health check endpoint that verifies connectivity to both subgraphs:

```bash
curl http://localhost:4000/health
```

This will return the health status of both the auth and jobs subgraphs.

## GraphQL Playground

Access the Apollo Sandbox at `http://localhost:4000/api/graphql` to explore and test the unified supergraph schema.

## Features

- **Automatic Schema Composition**: The gateway automatically fetches and composes schemas from all configured subgraphs
- **Health Monitoring**: Built-in health checks for all downstream services
- **Apollo Sandbox**: Interactive GraphQL playground for testing queries
- **Federation v2**: Uses the latest Apollo Federation specification for advanced schema composition

## Architecture

```
┌──────────┐
│  Client  │
└────┬─────┘
     │
     ▼
┌────────────────┐
│ Apollo Gateway │
│   Port: 4000   │
└────────┬───────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│  Auth  │ │  Jobs  │
│ :3000  │ │ :3001  │
└────────┘ └────────┘
```

## Building for Production

```bash
yarn nx build gateway
```

The compiled output will be available in `dist/apps/gateway/`.

## Troubleshooting

### Gateway fails to start

If the gateway fails to start with an error about service definitions:

1. Verify both auth-api and jobs-api services are running
2. Check that the subgraph URLs are correct in your `.env` file
3. Ensure the subgraphs are properly configured with Apollo Federation

### Subgraph not responding

If one of the subgraphs is not responding:

1. Check the health endpoint: `http://localhost:4000/health`
2. Verify the individual subgraph is accessible
3. Review the gateway logs for detailed error messages
