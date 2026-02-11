# 🗄️ Database Setup Guide
## MS SQL Server in Docker for macOS

**Project:** Mercedes-Benz Digital Assembly Platform  
**Database:** Mercedes-Benz DB (`mb_db_100226`)  
**Environment:** Docker Container (MS SQL Server 2022)

---

## 📋 Overview

Since MS SQL Server doesn't run natively on macOS, we use **Docker** to run SQL Server in a container. This setup provides a complete SQL Server environment that's identical to the Windows production environment.

---

## 🔧 Prerequisites

Before you begin, ensure you have:

- ✅ **Docker Desktop** installed and running
- ✅ **Minimum 4GB RAM** available for Docker
- ✅ **5GB disk space** for SQL Server image and data
- ✅ **Database backup file** (`mb_db_100226`) in `data/database/`

### Install Docker Desktop

If not installed:
```bash
# Download from: https://www.docker.com/products/docker-desktop
# Or install via Homebrew:
brew install --cask docker
```

---

## 🚀 Quick Start (Automatic Setup)

The easiest way to set up everything:

```bash
# Run the automated setup
./scripts/database.sh setup
```

This single command will:
1. ✅ Start SQL Server container
2. ✅ Restore the Mercedes-Benz database
3. ✅ Test the connection
4. ✅ Display connection details

---

## 📝 Manual Step-by-Step Setup

If you prefer manual control:

### Step 1: Start SQL Server Container

```bash
# Start the container
./scripts/database.sh start

# Or use Docker Compose directly:
docker-compose up -d
```

**What this does:**
-  Downloads MS SQL Server 2022 image (if not already downloaded)
- Creates and starts the container named `mercedes-benz-mssql`
- Exposes port 1433 for connections
- Mounts volumes for persistent data

### Step 2: Verify Container is Running

```bash
# Check container status
./scripts/database.sh status

# Or use Docker command:
docker ps | grep mercedes-benz-mssql
```

You should see the container running with status "healthy".

### Step 3: Restore Database from Backup

```bash
# Restore the database
./scripts/database.sh restore
```

**What this does:**
- Reads the backup file (`data/database/mb_db.bak`)
- Automatically detects logical file names
- Restores database as `mercedes_benz_db`
- Sets up proper file paths in container

### Step 4: Test Connection

```bash
# Test database connection
./scripts/database.sh test
```

Expected output:
```
✅ Connection test successful!
Microsoft SQL Server 2022...
Current Database: mercedes_benz_db
```

---

## 🛠️ Database Management Commands

### Container Management

```bash
# Start SQL Server
./scripts/database.sh start

# Stop SQL Server
./scripts/database.sh stop

# Restart SQL Server
./scripts/database.sh restart

# View container status and logs
./scripts/database.sh status
```

### Database Operations

```bash
# List all databases
./scripts/database.sh list

# Check backup file contents
./scripts/database.sh check

# Restore database
./scripts/database.sh restore

# Test connection
./scripts/database.sh test
```

### Interactive SQL Shell

```bash
# Open SQL command prompt
./scripts/database.sh shell

# Then you can run SQL commands:
SELECT * FROM sys.tables;
GO
```

---

## 🔌 Connection Details

### For Application (Backend)

The backend automatically connects using these settings from `.env`:

```bash
DB_SERVER=localhost
DB_PORT=1433
DB_USER=sa
DB_PASSWORD=MercedesBenz2026!
DB_NAME=mercedes_benz_db
DB_ENCRYPT=true
DB_TRUST_CERTIFICATE=true
```

### For External Tools (Azure Data Studio, DBeaver, etc.)

| Setting | Value |
|---------|-------|
| **Server** | `localhost` or `127.0.0.1` |
| **Port** | `1433` |
| **Authentication** | SQL Server Authentication |
| **Username** | `sa` |
| **Password** | `MercedesBenz2026!` |
| **Database** | `mercedes_benz_db` |
| **Encrypt** | Yes |
| **Trust Server Certificate** | Yes |

---

## 📁 File Structure

```
mercedes-benz-react-app/
├── docker-compose.yml          # Docker configuration
├── data/
│   └── database/
│       └── mb_db.bak          # Database backup file
├── scripts/
│   ├── database.sh            # Database management script
│   └── sql/
│       └── restore-database.sql  # Manual restore script
└── .env                       # Environment variables
```

---

## 🔍 Troubleshooting

### Issue: Docker not running

**Error:** `Cannot connect to the Docker daemon`

**Solution:**
```bash
# Start Docker Desktop application
open -a Docker

# Wait for Docker to start (check menubar icon)
```

### Issue: Container fails to start

**Error:** `port 1433 already in use`

**Solution:**
```bash
# Check if another SQL Server is running
lsof -i :1433

# Stop the conflicting service or change the port in docker-compose.yml
```

### Issue: Database restore fails

**Error:** `RESTORE DATABASE is terminating abnormally`

**Solution:**
```bash
# Check backup file exists
ls -lh data/database/mb_db.bak

# Check logical file names
./scripts/database.sh check

# Try manual restore with correct logical names
```

### Issue: Connection refused

**Error:** `ConnectionError: Failed to connect to localhost:1433`

**Solution:**
```bash
# 1. Check container is running
docker ps | grep mercedes-benz-mssql

# 2. Check container logs
docker logs mercedes-benz-mssql

# 3. Restart container
./scripts/database.sh restart

# 4. Wait for SQL Server to be ready (30 seconds)
sleep 30

# 5. Test again
./scripts/database.sh test
```

### Issue: Wrong password

**Error:** `Login failed for user 'sa'`

**Solution:**
```bash
# Password is: MercedesBenz2026!
# Update .env file if different
# Restart backend: npm run dev
```

---

## 🔐 Security Notes

### Password Management

⚠️ **Important:** The default password `MercedesBenz2026!` is for **development only**

**For production:**
1. Generate a strong password
2. Update `docker-compose.yml` (SA_PASSWORD)
3. Update `.env` (DB_PASSWORD)
4. Restart container: `./scripts/database.sh restart`

### Network Security

The container is exposed on `localhost:1433` only. To restrict access:

```yaml
# In docker-compose.yml, change:
ports:
  - "127.0.0.1:1433:1433"  # Only localhost can connect
```

---

## 📊 Database Schema

After restore, your database will contain these tables:

```sql
-- View all tables
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;
```

Common tables (adjust based on actual schema):
- Production data tables
- Configuration tables
- Audit/logging tables
- User management tables

---

## 🔄 Backup & Restore

### Create Backup

```bash
# Backup database from container
docker exec mercedes-benz-mssql /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "MercedesBenz2026!" \
  -Q "BACKUP DATABASE mercedes_benz_db TO DISK='/database/backup_$(date +%Y%m%d).bak'"

# Copy backup from container to host
docker cp mercedes-benz-mssql:/database/backup_$(date +%Y%m%d).bak ./data/database/
```

### Restore from Backup

```bash
# Use the script (recommended)
./scripts/database.sh restore

# Or manually
docker exec mercedes-benz-mssql /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "MercedesBenz2026!" \
  -i /scripts/restore-database.sql
```

---

## 🧹 Cleanup

### Remove Container (Keep Data)

```bash
# Stop and remove container
docker-compose down

# Data is preserved in Docker volume 'mssql-data'
```

### Complete Cleanup (Remove Everything)

```bash
# Stop and remove container and volumes
docker-compose down -v

# Remove downloaded images
docker rmi mcr.microsoft.com/mssql/server:2022-latest

# Remove database files
rm -rf data/database/*
```

---

## 📈 Performance Tuning

### Increase Memory Limit

Edit `docker-compose.yml`:

```yaml
services:
  mssql:
    environment:
      MSSQL_MEMORY_LIMIT_MB: 4096  # Increase from default 2GB
```

### Connection Pool Settings

Already configured in `server.js`:

```javascript
pool: {
    max: 10,              // Maximum connections
    min: 0,               // Minimum connections
    idleTimeoutMillis: 30000  // 30 seconds
}
```

---

## 🎯 Next Steps

After database setup:

1. **Start the application:**
   ```bash
   npm run dev
   ```

2. **Verify backend connection:**
   - Check terminal for: `✅ Connected to SQL Server (mercedes_benz_db)`

3. **Test API endpoints:**
   - Navigate to application pages
   - Check if data loads correctly

4. **Monitor logs:**
   ```bash
   # Backend logs
   # Check terminal running npm run dev
   
   # Database logs
   docker logs -f mercedes-benz-mssql
   ```

---

## 📚 Additional Resources

- [MS SQL Server Docker Documentation](https://hub.docker.com/_/microsoft-mssql-server)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Node.js MSSQL Driver](https://www.npmjs.com/package/mssql)
- [SQL Server on macOS Guide](https://database.guide/how-to-install-sql-server-on-a-mac/)

---

## 💡 Tips

1. **Keep Docker Desktop running** when developing
2. **Container auto-restarts** unless stopped manually
3. **Data persists** across container restarts in Docker volumes
4. **Use Azure Data Studio** for visual database management
5. **Check container health:** `docker ps` (should show "healthy")

---

## ✅ Checklist

Todoafter setup:

- [ ] Docker Desktop installed and running
- [ ] Database backup file in `data/database/`
- [ ] Container started successfully
- [ ] Database restored from backup
- [ ] Connection test passed
- [ ] `.env` file configured
- [ ] Backend connects successfully
- [ ] Frontend displays data

---

**Setup complete!** Your MS SQL Server is now running in Docker and ready for development. 🎉

**Questions or issues?** Check the troubleshooting section or contact the development team.

---

*Last updated: February 11, 2026*  
*Branch: Koustubh-Backend-Connection*
