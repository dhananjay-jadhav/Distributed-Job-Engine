# Testing Guide

This document describes how to run tests in the Distributed Job Engine project.

## Prerequisites

- Node.js (v24 or later)
- Yarn package manager
- Docker and Docker Compose
- PostgreSQL database (via Docker)

## Test Types

### Unit Tests

Unit tests test individual components in isolation with minimal mocking. These tests use a real PostgreSQL database for integration testing.

### E2E Tests

End-to-end tests test the entire application stack with all services running.

## Running Tests

### 1. Start the Database

First, start the PostgreSQL database using Docker Compose:

```bash
docker compose up -d
```

Wait for PostgreSQL to be ready (usually takes 5-10 seconds).

### 2. Run Database Migrations

Apply the database migrations:

```bash
yarn nx migrate-prisma auth-db
```

### 3. Run Unit/Integration Tests

Run all tests:

```bash
yarn nx run-many -t test
```

Run tests for a specific project:

```bash
yarn nx test auth-db
yarn nx test users
yarn nx test auth-service
yarn nx test auth-api
yarn nx test users-api
yarn nx test jobs-service
yarn nx test jobs-api
```

### 4. Run E2E Tests

E2E tests require the services to be running. 

#### For Auth Service E2E Tests:

Terminal 1 - Start the auth service:
```bash
yarn nx serve auth
```

Terminal 2 - Run the e2e tests:
```bash
PORT=3000 yarn nx e2e auth-e2e
```

#### For Jobs Service E2E Tests:

Terminal 1 - Start the auth service (needed for authentication):
```bash
yarn nx serve auth
```

Terminal 2 - Start the jobs service:
```bash
yarn nx serve jobs
```

Terminal 3 - Run the e2e tests:
```bash
PORT=3001 AUTH_BASE_URL=http://localhost:3000 yarn nx e2e jobs-e2e
```

### 5. Clean Up

Stop the database:

```bash
docker compose down
```

## GitHub CI/CD

The GitHub Actions workflow uses a parallelized architecture for faster CI execution:

### Dynamic Project Discovery

The workflow automatically discovers projects from your Nx workspace:
- **No manual maintenance** - Adding new projects automatically includes them in CI
- Projects are discovered by their available targets (lint, test, build)
- Uses `yarn nx show projects --with-target=<target>` to get the list dynamically

### Parallel Jobs

1. **Setup Job**: Installs dependencies, caches workspace, and discovers all projects
2. **Lint Jobs**: Runs linting for all projects with lint target in parallel
3. **Test Jobs**: Runs tests for testable projects in parallel with isolated databases
4. **Build Jobs**: Builds all buildable projects in parallel
5. **E2E Jobs**: Runs E2E tests for auth and jobs services in parallel

### Workflow Structure

```
setup (install, cache, discover projects)
  ├── lint (dynamic parallel jobs based on discovered projects)
  ├── test (dynamic parallel jobs with database, excluding E2E and apps)
  └── build (dynamic parallel jobs for buildable projects)
      ├── e2e-auth (starts auth service, runs E2E tests)
      └── e2e-jobs (starts auth + jobs services, runs E2E tests)
```

### Reusable Components

- **E2E Setup Action** (`.github/actions/e2e-setup`): Shared setup steps for E2E jobs
  - Starts docker-compose services
  - Waits for PostgreSQL
  - Sets up Node.js and caching
  - Runs database migrations

### Benefits

- **Zero maintenance**: New projects are automatically included when you add them
- **Faster CI**: Parallel execution reduces total CI time
- **Better isolation**: Each job runs independently with its own environment
- **Clearer feedback**: Individual job status for each project
- **Resource efficiency**: Only E2E jobs start application servers
- **DRY principle**: Reusable action eliminates duplicate code in E2E jobs
- **Future-proof**: Uses `docker-compose` - new services automatically available

### E2E Testing in CI

Each E2E job:
1. Uses shared E2E setup action for common steps
2. Builds the application(s)
3. Starts the application server(s) in background
4. Waits for server to be ready (health check)
5. Runs E2E tests against the running server
6. Cleans up services and processes

This approach ensures that:
- E2E jobs share common setup code via composite action
- Any new services added to `docker-compose.yaml` are automatically available in CI
- No duplication between local and CI environments
- CI environment matches local development exactly
- E2E tests run against real running applications

The workflow is configured in `.github/workflows/ci.yml`.

## Test Structure

### Unit/Integration Tests

All test files follow the pattern `*.spec.ts` and are located next to the files they test.

Example:
- `libs/users/src/lib/users.service.ts` - Implementation
- `libs/users/src/lib/users.service.spec.ts` - Tests

### E2E Tests

E2E tests are located in separate apps:
- `apps/auth-e2e/src/auth/auth.spec.ts` - Auth service E2E tests
- `apps/jobs-e2e/src/jobs/jobs.spec.ts` - Jobs service E2E tests

## Test Philosophy

This project follows the principle of **minimal mocking**. Instead of mocking database calls or service dependencies, tests use:

- Real PostgreSQL database for data persistence
- Real service instances for integration testing
- Only UI/network boundaries are mocked where necessary

This approach ensures:
- Tests are more realistic and catch real-world issues
- Less test maintenance (no mock updates when implementation changes)
- Higher confidence in test results

## Writing New Tests

When writing new tests:

1. **Use real dependencies** - Don't mock the database or other services unless absolutely necessary
2. **Clean up after yourself** - Delete test data in `afterAll` or `afterEach` hooks
3. **Use unique identifiers** - Use timestamps or UUIDs to avoid conflicts with other tests
4. **Test realistic scenarios** - Test actual use cases, not just happy paths
5. **Keep tests independent** - Tests should not depend on execution order

Example:

```typescript
describe('UserService', () => {
  let service: UserService;
  let authDbService: AuthDbService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, AuthDbService],
    }).compile();

    service = module.get<UserService>(UserService);
    authDbService = module.get<AuthDbService>(AuthDbService);
  });

  afterAll(async () => {
    await authDbService.$disconnect();
  });

  it('should create a user', async () => {
    const email = `test-${Date.now()}@example.com`;
    const user = await service.createUser({
      email,
      password: 'password123',
    });

    expect(user).toBeDefined();
    expect(user.email).toBe(email);

    // Cleanup
    await authDbService.user.delete({ where: { id: user.id } });
  });
});
```

## Troubleshooting

### Database Connection Issues

If tests fail with "Can't reach database server", ensure:
1. Docker is running
2. PostgreSQL container is started: `docker compose ps`
3. Database URL is correct in `.env` file

### Port Already in Use

If E2E tests fail because port is in use:
1. Check what's using the port: `lsof -i :3000` (or :3001 for jobs)
2. Stop the service or use a different port

### Test Timeouts

E2E tests may timeout if services are slow to start. Increase timeout in jest config:
```javascript
testTimeout: 30000 // 30 seconds
```

## Resources

- [NestJS Testing Guide](https://docs.nestjs.com/fundamentals/testing)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing)
