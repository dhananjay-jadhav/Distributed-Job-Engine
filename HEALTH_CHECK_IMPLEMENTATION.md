# Health Check Implementation

## Overview
This PR adds health check endpoints to both the Auth and Jobs services using NestJS Terminus (https://docs.nestjs.com/recipes/terminus).

## Changes Made

### 1. Dependencies Added
- `@nestjs/terminus` - NestJS health check module
- `@nestjs/axios` - For HTTP-based health checks (available for future use)

### 2. Auth Service (`apps/auth`)
- Created `apps/auth/src/app/health/health.controller.ts` - Controller with `/api/health` endpoint
- Created `apps/auth/src/app/health/health.module.ts` - Module importing TerminusModule
- Updated `apps/auth/src/app/app.module.ts` - Added HealthModule to imports

### 3. Jobs Service (`apps/jobs`)
- Created `apps/jobs/src/app/health/health.controller.ts` - Controller with `/api/health` endpoint
- Created `apps/jobs/src/app/health/health.module.ts` - Module importing TerminusModule
- Updated `apps/jobs/src/app/app.module.ts` - Added HealthModule to imports

### 4. CI/CD Updates
Updated `.github/workflows/ci.yml` to use health check endpoints instead of GraphQL endpoints:
- Auth service: `http://localhost:3000/api/health`
- Jobs service: `http://localhost:3001/api/health`

## Health Check Endpoints

### Auth Service
```bash
curl http://localhost:3000/api/health
```

### Jobs Service
```bash
curl http://localhost:3001/api/health
```

Both endpoints return:
```json
{
  "status": "ok",
  "info": {},
  "error": {},
  "details": {}
}
```

## Implementation Details

The health checks are minimal and return "ok" when the application is running. This is sufficient for:
- CI pipeline checks to ensure the application starts successfully
- Container orchestration health probes (Kubernetes readiness/liveness)
- Load balancer health checks

The implementation can be extended in the future to include:
- Database connectivity checks
- External service checks (using HttpHealthIndicator)
- Memory/disk health indicators
- Custom health indicators

## Testing

1. Both services were tested locally and health endpoints are working
2. CI workflow was updated to use health check endpoints
3. All linting passes
4. Both services build successfully

## Benefits

1. **Faster CI checks** - Health endpoints respond immediately vs GraphQL which requires a POST request
2. **Standardized health checks** - Using NestJS Terminus provides a consistent interface
3. **Production ready** - Can be used for Kubernetes health probes and load balancer checks
4. **Extensible** - Easy to add more health indicators as needed
