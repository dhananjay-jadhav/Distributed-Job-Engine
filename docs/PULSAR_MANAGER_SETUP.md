# Pulsar Manager Setup Guide

This guide explains how to set up and access Apache Pulsar Manager for the Distributed Job Engine project.

## Quick Start

1. **Start all services:**
   ```bash
   docker-compose up -d
   ```

2. **Create Pulsar Manager admin user:**
   ```bash
   ./setup-pulsar-manager.sh
   ```

3. **Access Pulsar Manager:**
   - URL: http://localhost:9527
   - Username: `admin`
   - Password: `apachepulsar`

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

**Solution:** The admin user needs to be created first. Run:
```bash
./setup-pulsar-manager.sh
```

This script will:
1. Wait for Pulsar Manager to be ready
2. Get a CSRF token
3. Create the default admin user
4. Display the login credentials

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

3. Restart and run setup again:
   ```bash
   docker-compose up -d
   ./setup-pulsar-manager.sh
   ```

## Manual Setup (Alternative Method)

If the script doesn't work, you can create the admin user manually:

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

To use custom credentials instead of the defaults:

1. Edit the `setup-pulsar-manager.sh` script
2. Modify the JSON payload in the curl command:
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