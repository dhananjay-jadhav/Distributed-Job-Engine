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
                            │ Port: 4000
                            ▼
                ┌───────────────────────┐
                │   Apollo Router       │
                │   (Supergraph)        │
                │   - Query Planning    │
                │   - Federation        │
                │   - Response Merge    │
                └───────────┬───────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐   ┌──────────────┐   ┌──────────────┐
│  Auth Service │   │ Jobs Service │   │   Future     │
│  Port: 3000   │   │ Port: 3001   │   │  Services    │
└───────┬───────┘   └──────┬───────┘   └──────────────┘
        │                  │
        │ GraphQL          │ GraphQL
        │ Federation v2    │ Federation v2
        │                  │
┌───────┴──────────────────┴───────┐
│   GraphQL Subgraph Layer         │
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
└────┬─────────┘   └───────┬───────┘
     │                      │
     │ Prisma ORM           │ Event Publishing
     │                      │
┌────┴──────────┐      ┌────┴──────────┐
│  PostgreSQL   │      │ Apache Pulsar │
│   Database    │      │ Message Broker│
└───────────────┘      └───────────────┘

┌─────────────────────────────────────────┐
│         Supporting Services             │
├─────────────────────────────────────────┤
│  • Apollo Router (Federation Gateway)   │
│  • Pino Logger (Structured Logging)     │
│  • New Relic (APM & Monitoring)         │
│  • JWT Auth (Passport Strategy)         │
│  • Apache Pulsar (Event Streaming)      │
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
    │              │                      │                    │ Publish Event
    │              │                      │                    │────────────┐
    │              │                      │                    │            │
    │              │                      │                    │            ▼
    │              │                      │                    │    ┌──────────────┐
    │              │                      │                    │    │Apache Pulsar │
    │              │                      │                    │    │   Topic      │
    │              │                      │                    │    └──────────────┘
    │◀─────────────│◀─────────────────────│◀───────────────────│
    │  Job Result  │                      │                    │
```

**Steps:**
1. Client sends executeJob mutation with job name and JWT token
2. Jobs service validates JWT via gRPC call to Auth service
3. Jobs discovery system finds the job by name using metadata
4. Job is executed and publishes event to Apache Pulsar topic
5. Job result is returned to client

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
- **Apollo Router Supergraph**: High-performance GraphQL gateway for unified API access
- **Authentication System**: JWT-based authentication with GraphQL Federation and gRPC
- **Job Processing Engine**: Dynamic job discovery and execution system with metadata-driven architecture
- **Event-Driven Architecture**: Apache Pulsar integration for reliable event streaming and message publishing
- **GraphQL Federation**: Apollo Federation v2 for distributed GraphQL architecture
- **Database Management**: PostgreSQL with Prisma ORM for type-safe database access
- **Observability**: Integrated logging with Pino and monitoring with New Relic
- **Modern Stack**: TypeScript, NestJS, GraphQL, gRPC, Prisma, Apache Pulsar

## 🛠️ Technologies

- **Backend Framework**: NestJS
- **Monorepo Tool**: Nx
- **API Gateway**: Apollo Router
- **API**: GraphQL with Apollo Federation v2
- **Authentication**: JWT with Passport
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Communication**: gRPC with Protocol Buffers
- **Message Broker**: Apache Pulsar
- **Logging**: Pino (nestjs-pino)
- **Monitoring**: New Relic
- **Language**: TypeScript
- **Container Orchestration**: Docker Compose, Kubernetes
- **Cloud Provider**: AWS

## 📋 Prerequisites

- Node.js (v20 or later)
- Yarn package manager (v4.10.3 or later)
- Docker and Docker Compose
- Apollo Rover CLI (for composing the supergraph schema)
- PostgreSQL (or use Docker Compose setup)
- Apache Pulsar (or use Docker Compose setup)
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

# Apache Pulsar configuration
PULSAR_SERVICE_URLS=pulsar://localhost:6650

# Optional: New Relic configuration
NEW_RELIC_AI_MONITORING_ENABLED=true
NEW_RELIC_CUSTOM_INSIGHTS_EVENTS_MAX_SAMPLES_STORED=100k
NEW_RELIC_SPAN_EVENTS_MAX_SAMPLES_STORED=10k
NEW_RELIC_APP_NAME=Distributed-Job-Engine
NEW_RELIC_LICENSE_KEY=your_license_key
NEW_RELIC_DISTRIBUTED_TRACING_ENABLED=true
```

4. Start PostgreSQL and Apache Pulsar (using Docker Compose):

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- Apache Pulsar broker on port 6650
- Pulsar Manager dashboard on port 9527 (accessible at http://localhost:9527)

5. Run database migrations:

```bash
yarn auth-migrate
```

6. Install Apollo Rover CLI (for composing the supergraph):

**Recommended (via curl):**
```bash
curl -sSL https://rover.apollo.dev/nix/latest | sh
```

**Alternative (via npm):**
```bash
npm install -g @apollo/rover
```

> **Note**: Yarn 4+ doesn't support `yarn global`. Use curl (recommended) or npm for global CLI tools.

**Verify installation:**
```bash
rover --version
```

## 🚀 Running the Application

### Development Mode

1. Start the authentication service:

```bash
yarn nx serve auth-api
# Runs on http://localhost:3000/api
```

2. Start the jobs service:

```bash
yarn nx serve jobs-api
# Runs on http://localhost:3001/api
```

3. Compose the supergraph schema and start Apollo Router:

```bash
# Compose the supergraph schema from subgraphs
cd apps/router
./compose-supergraph.sh

# Start the Apollo Router
cd ../..
docker compose up router
# Runs on http://localhost:4000
```

**Access the unified GraphQL API:**
- Apollo Router: http://localhost:4000
- Health Check: http://localhost:8088/health

### Alternative: Direct Subgraph Access (without Router)

You can also access subgraphs directly during development:
- Auth Service: http://localhost:3000/api/graphql
- Jobs Service: http://localhost:3001/api/graphql

### Building for Production

Build all applications:

```bash
yarn nx build auth-api
yarn nx build jobs-api
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
yarn nx lint auth-api
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
│   ├── auth-api/            # Authentication service (GraphQL + gRPC)
│   │   ├── src/auth/       # Auth resolvers and controllers
│   │   ├── src/users/      # Users resolvers
│   │   └── src/health/     # Health check endpoints
│   ├── auth-api-e2e/       # E2E tests for auth service
│   ├── jobs-api/           # Jobs service (GraphQL)
│   │   ├── src/api/        # Jobs resolvers
│   │   └── src/health/     # Health check endpoints
│   ├── jobs-api-e2e/       # E2E tests for jobs service
│   └── router/             # Apollo Router configuration
│       ├── router.yaml     # Router configuration
│       ├── Dockerfile      # Docker image for router
│       ├── compose-supergraph.sh  # Schema composition script
│       └── README.md       # Router documentation
├── libs/
│   ├── apache-pulsar/      # Apache Pulsar client integration
│   ├── auth-db/            # Database module with Prisma
│   ├── auth/               # Authentication business logic and guards
│   ├── common-utils/       # Shared utilities, types, and DTOs
│   ├── jobs/               # Jobs execution engine and discovery
│   ├── proto/              # Protocol Buffers definitions for gRPC
│   └── users/              # Users business logic
├── docker-compose.yaml     # Services: PostgreSQL, Pulsar, Router
└── README.md
```

## 📖 API Documentation

The project uses GraphQL Federation with multiple services unified through Apollo Router.

### Apollo Router (Supergraph)
**Unified GraphQL endpoint:** `http://localhost:4000`

This is the recommended entry point for all GraphQL queries. The router automatically:
- Routes queries to appropriate subgraphs (auth-api, jobs-api)
- Handles query planning and execution
- Merges responses from multiple subgraphs
- Provides a unified schema across all services

**Example unified query:**
```graphql
query {
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

**Access points:**
- GraphQL API: `http://localhost:4000`
- Health Check: `http://localhost:8088/health`
- Interactive Explorer: `http://localhost:4000` (in browser)

### Authentication Service (Subgraph)
Direct GraphQL endpoint: `http://localhost:3000/api/graphql`

**Mutations:**
- `login(loginInput: LoginInput!)`: Authenticate user and receive JWT token
- `createUser(createUserInput: CreateUserInput!)`: Create a new user (requires authentication)

**Queries:**
- `user(userId: String!)`: Get user by ID (requires authentication)

### Jobs Service (Subgraph)
Direct GraphQL endpoint: `http://localhost:3001/api/graphql`

**Queries:**
- `jobs(jobsFilter: JobsFilter)`: List all available jobs with optional filtering (requires authentication)

**Mutations:**
- `executeJob(jobName: String!)`: Execute a job by name (requires authentication)

### GraphQL Playground

**Recommended:** Use the Apollo Router endpoint for a unified experience:
- **Router:** `http://localhost:4000` (unified access to all services)

**For development/debugging:** Access subgraphs directly:
- **Auth:** `http://localhost:3000/api/graphql`
- **Jobs:** `http://localhost:3001/api/graphql`

For detailed router configuration and advanced usage, see [apps/router/README.md](apps/router/README.md).

## 📮 Apache Pulsar Integration

The project integrates Apache Pulsar for event-driven architecture and message streaming.

### Purpose

Apache Pulsar is used to publish job execution events, enabling:
- **Asynchronous Processing**: Decouple job execution from event handling
- **Event Streaming**: Stream job execution results to downstream consumers
- **Scalability**: Handle high-throughput event publishing with Pulsar's distributed architecture
- **Reliability**: Guaranteed message delivery with Pulsar's persistent storage

### Architecture

All jobs extend `AbstractJob` which provides built-in Pulsar integration:

```typescript
@Jobs({
  name: 'Fibonacci',
  description: 'Generate a Fibonacci sequence and store it in DB',
})
export class FibonacciJob extends AbstractJob {
  constructor(pulsarProducerClient: PulsarProducerClient) {
    super(pulsarProducerClient);
  }
}
```

When a job executes, it automatically publishes events to a specified Pulsar topic.

### Configuration

Configure Pulsar connection in your `.env` file:

```bash
PULSAR_SERVICE_URLS=pulsar://localhost:6650
```

### Pulsar Manager Dashboard

Access the Pulsar Manager dashboard to monitor topics, messages, and cluster health:
- URL: `http://localhost:9527`
- Dashboard provides visibility into message flows, throughput, and consumer groups

### Docker Setup

The `docker-compose.yaml` includes:
- **Pulsar Broker**: Standalone mode on port 6650
- **Pulsar Manager**: Web UI for cluster management on port 9527

```bash
docker-compose up -d pulsar
```

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
