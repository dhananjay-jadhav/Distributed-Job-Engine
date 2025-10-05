# Distributed Job Engine

A modern distributed job processing engine built with gRPC, Apache Pulsar, Kubernetes, and AWS. This project implements a scalable and robust system for distributed job execution and management.

## 🚀 Features

- **Microservices Architecture**: Built using NestJS for scalable microservices
- **Authentication System**: JWT-based authentication with GraphQL Federation
- **Distributed Job Processing**: Powered by Apache Pulsar
- **Cloud-Native**: Kubernetes deployment ready
- **GraphQL API**: Apollo Federation for API gateway
- **Modern Stack**: TypeScript, NestJS, GraphQL, gRPC

## 🛠️ Technologies

- **Backend Framework**: NestJS
- **API**: GraphQL with Apollo Federation
- **Authentication**: JWT
- **Message Queue**: Apache Pulsar
- **Container Orchestration**: Kubernetes
- **Cloud Provider**: AWS
- **Language**: TypeScript
- **Communication**: gRPC

## 📋 Prerequisites

- Node.js (v16 or later)
- Yarn package manager
- Docker
- Kubernetes cluster
- Apache Pulsar
- AWS Account (for cloud deployment)

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
AUTH_JWT_SECRET=your_jwt_secret
AUTH_JWT_EXPIRES_IN=1h
USER_PORT=3000
```

## 🚀 Running the Application

1. Start the authentication service:

```bash
yarn nx serve auth
```

2. Build for production:

```bash
yarn nx build auth
```

3. Run tests:

```bash
yarn nx test auth
```

## 🏗️ Project Structure

```
.
├── apps/
│   ├── auth/                 # Authentication service
│   └── auth-e2e/            # E2E tests
├── libs/
│   ├── auth-api/            # Authentication API
│   ├── auth-db/             # Database module
│   ├── users/               # Users module
│   └── users-api/           # Users API
└── README.md
```

## 📖 API Documentation

The API is built using GraphQL and can be accessed at:

```
http://localhost:3000/api/graphql
```

Key endpoints:

- `createUser`: Create a new user
- `user`: Get user by ID

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
- Apache Pulsar community
