# Distributed Job Engine

A modern distributed job processing engine built with NestJS, GraphQL Federation, gRPC, and PostgreSQL. This project implements a scalable microservices architecture for dynamic job execution and management with type-safe APIs and database access.

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Client Application                         │
│                     (Web/Mobile/API Consumer)                        │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
                            │ HTTP/GraphQL
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐   ┌──────────────┐   ┌──────────────┐
│  Auth Service │   │ Jobs Service │   │ API Gateway  │
│  Port: 3000   │   │ Port: 3001   │   │  (Future)    │
└───────┬───────┘   └──────┬───────┘   └──────────────┘
        │                  │
        │ GraphQL          │ GraphQL
        │ Federation v2    │ Federation v2
        │                  │
┌───────┴──────────────────┴───────┐
│   GraphQL Federation Layer       │
│   (Apollo Federation v2)         │
└──────────────┬───────────────────┘
               │
     ┌─────────┴─────────┐
     │                   │
     ▼                   ▼
┌─────────┐        ┌──────────┐
│  Auth   │        │  Jobs    │
│  API    │        │  API     │
│         │        │          │
│ ┌─────┐ │        │ ┌──────┐ │
│ │Login│ │        │ │Jobs  │ │
│ │User │ │        │ │Exec  │ │
│ └─────┘ │        │ └──────┘ │
└────┬────┘        └────┬─────┘
     │                  │
     │ gRPC             │ Auth Check
     │                  │
┌────┴─────────┐   ┌────┴──────────┐
│ Auth Service │   │  Jobs Service │
│  (Business)  │   │   (Business)  │
└────┬─────────┘   └───────────────┘
     │
     │ Prisma ORM
     │
┌────┴──────────┐
│  PostgreSQL   │
│   Database    │
└───────────────┘

┌─────────────────────────────────────────┐
│         Supporting Services             │
├─────────────────────────────────────────┤
│  • Pino Logger (Structured Logging)     │
│  • New Relic (APM & Monitoring)         │
│  • JWT Auth (Passport Strategy)         │
└─────────────────────────────────────────┘
```

## 🔄 Functional Workflow

### 1️⃣ User Authentication Flow
```
┌──────┐      ┌────────────┐      ┌──────────┐      ┌──────────┐
│Client│─────▶│Auth Service│─────▶│Auth Logic│─────▶│PostgreSQL│
└──────┘      └────────────┘      └──────────┘      └──────────┘
    │              │                     │                 │
    │  GraphQL     │                     │                 │
    │  login()     │   Validate          │   Query User    │
    │              │   Credentials       │   & Password    │
    │              │                     │                 │
    │◀─────────────│◀────────────────────│◀────────────────│
    │  JWT Token   │                     │                 │
    │  + User Data │                     │                 │
```

**Steps:**
1. Client sends login credentials via GraphQL mutation
2. Auth service validates credentials against PostgreSQL (via Prisma)
3. On success, JWT token is generated and returned
4. Client stores JWT for subsequent authenticated requests

### 2️⃣ User Creation Flow
```
┌──────┐      ┌────────────┐      ┌──────────┐      ┌──────────┐
│Client│─────▶│Auth Service│─────▶│User Logic│─────▶│PostgreSQL│
└──────┘      └────────────┘      └──────────┘      └──────────┘
    │              │                     │                 │
    │  GraphQL     │   JWT Auth          │                 │
    │  createUser()│   Guard Check       │   Create User   │
    │  + JWT       │                     │   Record        │
    │              │                     │                 │
    │◀─────────────│◀────────────────────│◀────────────────│
    │  User Data   │                     │                 │
```

**Steps:**
1. Client sends createUser mutation with JWT token
2. Auth guard validates JWT token via gRPC
3. User service creates new user in PostgreSQL
4. New user data is returned to client

### 3️⃣ Job Execution Flow
```
┌──────┐      ┌────────────┐      ┌──────────────┐      ┌──────────┐
│Client│─────▶│Jobs Service│─────▶│Jobs Discovery│─────▶│Job Engine│
└──────┘      └────────────┘      └──────────────┘      └──────────┘
    │              │                      │                    │
    │  GraphQL     │   JWT Auth           │   Find Job by      │
    │  executeJob()│   Guard Check        │   Name/Metadata    │
    │  + JWT       │   (via gRPC)         │                    │
    │              │                      │                    │
    │              │                      │   Execute Job ────▶│
    │              │                      │                    │
    │◀─────────────│◀─────────────────────│◀───────────────────│
    │  Job Result  │                      │                    │
```

**Steps:**
1. Client sends executeJob mutation with job name and JWT token
2. Jobs service validates JWT via gRPC call to Auth service
3. Jobs discovery system finds the job by name using metadata
4. Job is executed and result is returned to client

### 4️⃣ List Jobs Flow
```
┌──────┐      ┌────────────┐      ┌──────────────┐
│Client│─────▶│Jobs Service│─────▶│Jobs Discovery│
└──────┘      └────────────┘      └──────────────┘
    │              │                      │
    │  GraphQL     │   JWT Auth           │   Get All Jobs
    │  jobs()      │   Guard Check        │   Metadata
    │  + JWT       │   (via gRPC)         │
    │              │                      │
    │◀─────────────│◀─────────────────────│
    │  Jobs List   │                      │
    │  (Metadata)  │                      │
```

**Steps:**
1. Client sends jobs query with optional filter and JWT token
2. Jobs service validates JWT via gRPC call to Auth service
3. Jobs discovery returns list of available jobs with metadata
4. Jobs list is returned to client

## 🚀 Features

- **Microservices Architecture**: Built using NestJS with Nx monorepo for scalable microservices
- **Authentication System**: JWT-based authentication with GraphQL Federation and gRPC
- **Job Processing Engine**: Dynamic job discovery and execution system with metadata-driven architecture
- **GraphQL Federation**: Apollo Federation v2 for distributed GraphQL architecture
- **Database Management**: PostgreSQL with Prisma ORM for type-safe database access
- **Observability**: Integrated logging with Pino and monitoring with New Relic
- **Modern Stack**: TypeScript, NestJS, GraphQL, gRPC, Prisma

## 🛠️ Technologies

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
- **Cloud Provider**: AWS

## 📋 Prerequisites

- Node.js (v20 or later)
- Yarn package manager (v4.10.3 or later)
- Docker and Docker Compose
- PostgreSQL (or use Docker Compose setup)
- Kubernetes cluster (optional, for production deployment)
- AWS Account (optional, for cloud deployment)

## 🔧 Installation

1. Clone the repository:

```bash
git clone https://github.com/dhananjay-jadhav/Distributed-Job-Engine.git
cd Distributed-Job-Engine
```

2. Install dependencies:

```bash
yarn install
```

3. Set up environment variables:

```bash
# Copy example environment file
cp .env.sample .env

# Configure the following variables
DATABASE_URL=postgres://postgres:admin@localhost:5432/auth
USER_PORT=3000
JOBS_PORT=3001
AUTH_JWT_SECRET=your_jwt_secret
AUTH_JWT_EXPIRES_IN=300

# Optional: New Relic configuration
NEW_RELIC_AI_MONITORING_ENABLED=true
NEW_RELIC_CUSTOM_INSIGHTS_EVENTS_MAX_SAMPLES_STORED=100k
NEW_RELIC_SPAN_EVENTS_MAX_SAMPLES_STORED=10k
NEW_RELIC_APP_NAME=Distributed-Job-Engine
NEW_RELIC_LICENSE_KEY=your_license_key
NEW_RELIC_DISTRIBUTED_TRACING_ENABLED=true
```

4. Start PostgreSQL and Pulsar (using Docker Compose):

```bash
docker-compose up -d
```

The Pulsar Manager admin user will be created automatically when the containers start.

**Services started:**
- PostgreSQL (port 5432) - Database for authentication
- Apache Pulsar (port 6650) - Message broker
- Pulsar Manager (ports 9527, 7750) - Web UI for Pulsar management
  - **URL**: http://localhost:9527
  - **Username**: admin
  - **Password**: apachepulsar
  - For troubleshooting, see [Pulsar Manager Setup Guide](PULSAR_MANAGER_SETUP.md)

> **Note**: If you need to manually create the admin user (e.g., if automatic setup fails), you can run `./setup-pulsar-manager.sh`

5. Run database migrations:

```bash
yarn auth-migrate
```

## 🚀 Running the Application

### Development Mode

1. Start the authentication service:

```bash
yarn nx serve auth
# Runs on http://localhost:3000/api
```

2. Start the jobs service:

```bash
yarn nx serve jobs
# Runs on http://localhost:3001/api
```

### Building for Production

Build all applications:

```bash
yarn nx build auth
yarn nx build jobs
```

### Testing

Run tests for all projects:

```bash
yarn all:test
```

Run tests for a specific project:

```bash
yarn nx test auth
yarn nx test jobs
```

### Linting

Lint all projects:

```bash
yarn all:lint
```

Lint a specific project:

```bash
yarn nx lint auth
```

### Code Formatting

Format code using Prettier:

```bash
yarn format
```

## 🧪 Comprehensive Testing

This project includes comprehensive tests with minimal mocking, using real database instances for integration testing.

### Quick Start

1. Start the database:
```bash
docker compose up -d
```

2. Run migrations:
```bash
yarn nx migrate-prisma auth-db
```

3. Run all tests:
```bash
yarn nx run-many -t test
```

For detailed testing instructions, see [TESTING.md](TESTING.md).

### Test Coverage

- ✅ Unit tests with real database integration
- ✅ Service layer tests
- ✅ Resolver and controller tests
- ✅ E2E tests for GraphQL API
- ✅ GitHub Actions CI with parallel jobs and PostgreSQL service

## 🏗️ Project Structure

```
.
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
├── docker-compose.yaml      # PostgreSQL setup
└── README.md
```

## 📖 API Documentation

The project uses GraphQL Federation with multiple services:

### Authentication Service
GraphQL endpoint: `http://localhost:3000/api/graphql`

**Mutations:**
- `login(loginInput: LoginInput!)`: Authenticate user and receive JWT token
- `createUser(createUserInput: CreateUserInput!)`: Create a new user (requires authentication)

**Queries:**
- `user(userId: String!)`: Get user by ID (requires authentication)

### Jobs Service
GraphQL endpoint: `http://localhost:3001/api/graphql`

**Queries:**
- `jobs(jobsFilter: JobsFilter)`: List all available jobs with optional filtering (requires authentication)

**Mutations:**
- `executeJob(jobName: String!)`: Execute a job by name (requires authentication)

### GraphQL Playground

Both services provide an Apollo Sandbox interface for testing queries. Access them at:
- Auth: `http://localhost:3000/api/graphql`
- Jobs: `http://localhost:3001/api/graphql`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Dhananjay Jadhav** -

## 🌟 Acknowledgments

- NestJS Team for the excellent framework
- Apollo GraphQL for Federation support
- Nx team for the powerful monorepo tools
- Prisma team for the amazing ORM
