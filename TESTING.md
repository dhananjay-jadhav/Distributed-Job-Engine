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

The GitHub Actions workflow automatically:

1. Starts a PostgreSQL service container
2. Runs database migrations
3. Executes all unit and integration tests

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
