# Pulsar Manager Setup Guide

This guide explains how to set up and access Apache Pulsar Manager for the Distributed Job Engine project.

## Quick Start

1. **Start all services:**
   ```bash
   docker-compose up -d
   ```

   The Pulsar Manager admin user is created automatically when the containers start.

2. **Access Pulsar Manager:**
   - URL: http://localhost:9527
   - Username: `admin`
   - Password: `apachepulsar`

> **Note**: If automatic setup fails, you can manually create the admin user using the commands in the [Manual Setup](#manual-setup-alternative-method) section below.

## What is Pulsar Manager?

Pulsar Manager is a web-based GUI management tool that helps administrators and users manage and monitor Apache Pulsar. It provides:

- Cluster management
- Tenant and namespace management  
- Topic management and monitoring
- Message browsing
- Performance metrics and statistics

## Troubleshooting

### Cannot login to Pulsar Manager

**Problem:** You're unable to login even with the correct credentials.

**Solution:** The admin user should be created automatically when you run `docker-compose up -d`. Check the logs of the `pulsar-manager-init` container:

```bash
docker-compose logs pulsar-manager-init
```

If the automatic setup failed, you can manually create the admin user using the commands in the [Manual Setup](#manual-setup-alternative-method) section below.

### Pulsar Manager not starting

**Problem:** The dashboard container is not running.

**Solution:** Check the container status and logs:
```bash
# Check container status
docker compose ps

# View dashboard logs
docker compose logs dashboard

# Restart the dashboard service
docker compose restart dashboard
```

### Reset admin user password

If you need to reset the admin user or create a new one, you can:

1. Stop the containers:
   ```bash
   docker compose down
   ```

2. Remove volumes (this will delete all Pulsar Manager data):
   ```bash
   docker volume prune
   ```

3. Restart services:
   ```bash
   docker-compose up -d
   ```

   The admin user will be created automatically by the `pulsar-manager-init` service.

## Manual Setup (Alternative Method)

If the automatic setup doesn't work, you can create the admin user manually:

1. Get CSRF token:
   ```bash
   CSRF_TOKEN=$(curl -s http://localhost:7750/pulsar-manager/csrf-token)
   ```

2. Create admin user:
   ```bash
   curl -H "X-XSRF-TOKEN: $CSRF_TOKEN" \
        -H "Cookie: XSRF-TOKEN=$CSRF_TOKEN" \
        -H "Content-Type: application/json" \
        -X PUT http://localhost:7750/pulsar-manager/users/superuser \
        -d '{"name":"admin","password":"apachepulsar","description":"Default admin user","email":"admin@pulsar.apache.org"}'
   ```

## Customizing Credentials

To use custom credentials instead of the defaults, you need to modify the `docker-compose.yaml` file:

1. Open `docker-compose.yaml` and find the `pulsar-manager-init` service
2. Modify the JSON payload in the curl command (around line 53):
   ```json
   {
     "name": "your-username",
     "password": "your-password",
     "description": "Admin user",
     "email": "your-email@example.com"
   }
   ```
3. Run the modified script

## Additional Resources

- [Apache Pulsar Documentation](https://pulsar.apache.org/docs/)
- [Pulsar Manager GitHub](https://github.com/apache/pulsar-manager)
- [Pulsar Manager User Guide](https://pulsar.apache.org/docs/administration-pulsar-manager/)
