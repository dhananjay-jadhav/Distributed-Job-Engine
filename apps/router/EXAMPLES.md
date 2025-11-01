# Example GraphQL Queries for Apollo Router

This file contains example queries and mutations you can run against the Apollo Router supergraph at `http://localhost:4000`.

## Authentication Queries/Mutations

### Login (Get JWT Token)

```graphql
mutation Login {
  login(loginInput: { 
    email: "user@example.com", 
    password: "your-password" 
  }) {
    id
    email
  }
}
```

**Note:** After successful login, the JWT token will be set as a cookie. Include this cookie in subsequent requests for authenticated queries.

### Create User (Requires Authentication)

```graphql
mutation CreateUser {
  createUser(createUserInput: { 
    email: "newuser@example.com", 
    password: "secure-password" 
  }) {
    id
    email
  }
}
```

### Get User by ID (Requires Authentication)

```graphql
query GetUser {
  user(userId: "user-id-here") {
    id
    email
  }
}
```

## Jobs Queries/Mutations

### List All Jobs (Requires Authentication)

```graphql
query ListJobs {
  jobs {
    name
    description
  }
}
```

### List Jobs with Filter (Requires Authentication)

```graphql
query FilteredJobs {
  jobs(jobsFilter: { name: "Fibonacci" }) {
    name
    description
  }
}
```

### Execute a Job (Requires Authentication)

```graphql
mutation ExecuteJob {
  executeJob(jobName: "Fibonacci") {
    name
    description
  }
}
```

## Unified Queries (Federation)

One of the key benefits of Apollo Router is the ability to query multiple subgraphs in a single request:

### Combined Query

```graphql
query CombinedData {
  # From auth subgraph
  user(userId: "user-id") {
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

## Introspection Queries

### Get Full Schema

```graphql
query IntrospectionQuery {
  __schema {
    types {
      name
      kind
      description
    }
  }
}
```

### Get Available Types

```graphql
query GetTypes {
  __schema {
    queryType {
      name
      fields {
        name
        description
      }
    }
    mutationType {
      name
      fields {
        name
        description
      }
    }
  }
}
```

## Testing Tips

### Using cURL

```bash
# Login request
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { login(loginInput: { email: \"user@example.com\", password: \"password\" }) { id email } }"
  }'

# Authenticated request (include the JWT cookie)
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_JWT_TOKEN" \
  -d '{
    "query": "query { jobs { name description } }"
  }'
```

### Using Browser

1. Navigate to `http://localhost:4000`
2. The Apollo Router homepage will provide an interactive GraphQL explorer
3. Use the built-in documentation explorer to discover available queries and mutations
4. Try the example queries above in the explorer

### Using Apollo Studio

1. Go to [Apollo Studio Sandbox](https://studio.apollographql.com/sandbox)
2. Connect to `http://localhost:4000`
3. The schema will be automatically loaded
4. Use the visual query builder

## HTTP Headers

When making requests that require authentication, include the JWT token in the request headers:

**Using Authorization Header:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Using Cookie (if using cookie-based auth):**
```
Cookie: token=YOUR_JWT_TOKEN
```

## Response Examples

### Successful Login Response

```json
{
  "data": {
    "login": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com"
    }
  }
}
```

### Jobs List Response

```json
{
  "data": {
    "jobs": [
      {
        "name": "Fibonacci",
        "description": "Generate a Fibonacci sequence and store it in DB"
      },
      {
        "name": "HelloWorld",
        "description": "A simple hello world job"
      }
    ]
  }
}
```

### Error Response (Unauthorized)

```json
{
  "errors": [
    {
      "message": "Unauthorized",
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ]
}
```

## Advanced Queries

### Query with Variables

```graphql
query GetUserWithVar($userId: String!) {
  user(userId: $userId) {
    id
    email
  }
}
```

**Variables:**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Query with Aliases

```graphql
query MultipleUsers {
  firstUser: user(userId: "user-id-1") {
    id
    email
  }
  secondUser: user(userId: "user-id-2") {
    id
    email
  }
}
```

### Query with Fragments

```graphql
fragment UserFields on User {
  id
  email
}

query GetUsers {
  user(userId: "user-id") {
    ...UserFields
  }
}
```

## Monitoring and Debugging

### Check Router Health

```bash
curl http://localhost:8088/health
```

### View Router Metrics

The router exposes metrics at the health check endpoint. Monitor these for performance insights.

## Notes

- All job-related queries require authentication via JWT token
- User creation also requires authentication (only authenticated users can create new users)
- The router automatically handles query planning and routes requests to the appropriate subgraphs
- Responses are merged automatically when querying multiple subgraphs
