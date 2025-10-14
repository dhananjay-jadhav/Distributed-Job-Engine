# Copilot Instructions for Distributed Job Engine

## Project Overview

This is a distributed job processing engine built with modern TypeScript technologies. It uses a microservices architecture with NestJS, GraphQL Federation, gRPC, and PostgreSQL.

## Technology Stack

- **Backend Framework**: NestJS
- **Monorepo Tool**: Nx
- **API**: GraphQL with Apollo Federation v2
- **Authentication**: JWT with Passport
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Communication**: gRPC with Protocol Buffers
- **Logging**: Pino (nestjs-pino)
- **Monitoring**: New Relic
- **Language**: TypeScript
- **Container Orchestration**: Docker Compose, Kubernetes
- **Testing**: Jest
- **Package Manager**: Yarn v4.10.3

## Project Structure

```
├── apps/
│   ├── auth/                 # Authentication service (GraphQL + gRPC)
│   ├── auth-e2e/            # E2E tests for auth service
│   ├── jobs/                # Jobs service (GraphQL)
│   └── jobs-e2e/            # E2E tests for jobs service
├── libs/
│   ├── auth-api/            # Authentication GraphQL API (resolvers)
│   ├── auth-db/             # Database module with Prisma
│   ├── auth-service/        # Authentication business logic and guards
│   ├── common-utils/        # Shared utilities, types, and DTOs
│   ├── jobs-api/            # Jobs GraphQL API (resolvers)
│   ├── jobs-service/        # Jobs execution engine and discovery
│   ├── proto/               # Protocol Buffers definitions for gRPC
│   ├── users/               # Users business logic
│   └── users-api/           # Users GraphQL API (resolvers)
```

## Development Workflow

### Setup

1. Install dependencies:
   ```bash
   yarn install
   ```

2. Start PostgreSQL:
   ```bash
   docker compose up -d
   ```

3. Run database migrations:
   ```bash
   yarn auth-migrate
   ```

### Building

- Build all projects:
  ```bash
  yarn build
  # or
  nx build
  ```

- Build a specific project:
  ```bash
  nx build <project-name>
  ```

### Running Services

- Start auth service:
  ```bash
  nx serve auth
  ```

- Start jobs service:
  ```bash
  nx serve jobs
  ```

### Testing

- Run all tests:
  ```bash
  yarn nx run-many -t test
  # or
  yarn all:test
  ```

- Run tests for a specific project:
  ```bash
  nx test <project-name>
  ```

- Run E2E tests (requires services to be running):
  ```bash
  PORT=3000 yarn nx e2e auth-e2e
  PORT=3001 yarn nx e2e jobs-e2e
  ```

For detailed testing instructions, see [TESTING.md](../TESTING.md).

### Linting

- Lint all projects:
  ```bash
  yarn all:lint
  # or
  nx run-many --target=lint --all --parallel
  ```

- Lint a specific project:
  ```bash
  nx lint <project-name>
  ```

### Database Migrations

- Run Prisma migrations:
  ```bash
  yarn auth-migrate
  # or
  nx migrate-prisma auth-db
  ```

## Coding Standards

### TypeScript

- Use TypeScript strict mode
- Prefer interfaces over types for object shapes
- Use proper type annotations, avoid `any`
- Use const assertions where appropriate

### NestJS Patterns

- Follow NestJS module structure (modules, controllers, services)
- Use dependency injection properly
- Use decorators for validation (class-validator, class-transformer)
- Implement proper error handling with custom exceptions
- Use guards for authentication and authorization

### GraphQL

- Define schemas using code-first approach
- Use resolvers for GraphQL operations
- Implement proper field resolvers
- Use DataLoader pattern for N+1 query prevention when needed
- Follow GraphQL Federation v2 patterns for subgraphs

### Database (Prisma)

- Use Prisma schema for database models
- Use migrations for schema changes
- Use Prisma client for database operations
- Avoid raw SQL queries unless necessary
- Use transactions for multi-step operations

### Testing Philosophy

- **Minimal Mocking**: Use real database instances for integration testing
- Use real dependencies instead of mocks where possible
- Clean up test data in `afterAll` or `afterEach` hooks
- Use unique identifiers (timestamps, UUIDs) to avoid conflicts
- Test realistic scenarios, not just happy paths
- Keep tests independent and order-agnostic

Example test structure:
```typescript
describe('Service', () => {
  let service: Service;
  let authDbService: AuthDbService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Service, AuthDbService],
    }).compile();

    service = module.get<Service>(Service);
    authDbService = module.get<AuthDbService>(AuthDbService);
  });

  afterAll(async () => {
    await authDbService.$disconnect();
  });

  it('should perform operation', async () => {
    const uniqueId = `test-${Date.now()}`;
    // ... test implementation
    // Cleanup
    await cleanup(uniqueId);
  });
});
```

### Code Organization

- Keep files focused and single-purpose
- Use barrel exports (index.ts) for clean imports
- Group related functionality in modules
- Follow Nx library boundaries
- Use shared libraries for common code

### Error Handling

- Use custom exceptions from NestJS
- Provide meaningful error messages
- Log errors with appropriate context
- Handle database errors gracefully
- Return proper HTTP/GraphQL status codes

### Logging

- Use Pino logger for structured logging
- Include relevant context in logs
- Use appropriate log levels (debug, info, warn, error)
- Don't log sensitive information (passwords, tokens)

### Security

- Never commit secrets or credentials
- Use environment variables for configuration
- Validate all inputs with class-validator
- Use JWT for authentication
- Implement proper authorization checks
- Hash passwords with bcrypt

## Common Tasks

### Adding a New GraphQL Resolver

1. Create resolver in appropriate library (e.g., `libs/*/src/lib/*.resolver.ts`)
2. Add resolver to module
3. Create corresponding service if needed
4. Add tests for resolver
5. Update schema if using schema-first approach

### Adding a New Database Model

1. Update Prisma schema in `libs/auth-db/prisma/schema.prisma`
2. Run migration: `yarn auth-migrate`
3. Use generated Prisma client types
4. Add tests for new model operations

### Adding a New Job

1. Create job class in `libs/jobs-service`
2. Use `@Job()` decorator
3. Implement job logic
4. Add to jobs discovery system
5. Add tests for job execution

### Working with gRPC

1. Define proto files in `libs/proto/src/proto/*.proto`
2. Generate types: `yarn gen:proto-types`
3. Use generated types in services
4. Test gRPC communication

## Environment Variables

See `.env.sample` for required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `USER_PORT`: Port for auth service (default: 3000)
- `JOBS_PORT`: Port for jobs service (default: 3001)
- `AUTH_JWT_SECRET`: JWT secret for authentication
- `AUTH_JWT_EXPIRES_IN`: JWT expiration time
- New Relic configuration (optional)

## CI/CD

- GitHub Actions workflow runs on every PR/push
- Automatically sets up PostgreSQL
- Runs migrations
- Executes all tests in parallel
- Runs linting

## Additional Resources

- [TESTING.md](../TESTING.md) - Comprehensive testing guide
- [README.md](../README.md) - Project overview and setup
- [TEST_IMPLEMENTATION_SUMMARY.md](../TEST_IMPLEMENTATION_SUMMARY.md) - Testing implementation details
