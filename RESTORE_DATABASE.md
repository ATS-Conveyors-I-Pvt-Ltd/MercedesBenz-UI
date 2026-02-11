# 🗄️ Quick Database Restore Guide

## Current Setup
✅ **Microsoft SQL Server 2022** running in Docker
✅ **Database backup file:** `data/database/mb_db.bak` (3.5MB)
✅ **Container:** mercedes-benz-mssql

---

## 🚀 One-Command Restore

Run this single command to restore the database:

```bash
docker exec mercedes-benz-mssql /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "MercedesBenz2026!" -C \
  -Q "RESTORE DATABASE mercedes_benz_db FROM DISK = '/database/mb_db.bak' WITH REPLACE;" \
  -t 180
```

**What this does:**
- Connects to SQL Server in the container
- Restores the backup file to a new database called `mercedes_benz_db`
- Uses REPLACE to overwrite if it exists
- `-C` trusts the self-signed certificate
- `-t 180` gives it 3 minutes timeout (ARM Mac is slow)

---

## 📝 Step-by-Step Alternative

If the one-command doesn't work, follow these steps:

### Step 1: Verify SQL Server is running
```bash
docker ps | grep mercedes-benz-mssql
```

Should show: `Up X minutes`

### Step 2: Test connection
```bash
docker exec mercedes-benz-mssql /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "MercedesBenz2026!" -C \
  -Q "SELECT @@VERSION;"
```

You should see: `Microsoft SQL Server 2022...`

### Step 3: Restore database
```bash
docker exec mercedes-benz-mssql /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "MercedesBenz2026!" -C \
  -Q "RESTORE DATABASE mercedes_benz_db FROM DISK = '/database/mb_db.bak' WITH REPLACE;" \
  -t 180
```

Wait 2-3 minutes. You should see:
```
Processed X pages for database 'mercedes_benz_db'...
RESTORE DATABASE successfully processed...
```

### Step 4: Verify database exists
```bash
docker exec mercedes-benz-mssql /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "MercedesBenz2026!" -C \
  -Q "SELECT name, create_date FROM sys.databases WHERE name='mercedes_benz_db';"
```

---

## 🔧 If Restore Fails

### Error: "cannot be opened because it is version..."
This means the backup is from a newer/older SQL Server version.
- Our Docker image: SQL Server 2022 (version 957)
- Check your backup version

### Error: "timeout"
ARM Mac emulation is slow. Increase timeout:
```bash
-t 300  # 5 minutes instead of 3
```

### Error: "SSL certificate"
Add the `-C` flag (already included above)

---

## ✅ After Successful Restore

1. **Restart your backend:**
   ```bash
   npm run dev
   ```

2. **Look for this message:**
   ```
   ✅ Connected to SQL Server (mercedes_benz_db) at localhost:1433
   ```

3. **Test the frontend:**
   - Navigate to your application
   - Check if data loads correctly

---

## 🐚 Interactive SQL Shell (Optional)

To explore the database manually:

```bash
docker exec -it mercedes-benz-mssql /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "MercedesBenz2026!" -C -d mercedes_benz_db
```

Then you can run SQL commands:
```sql
SELECT * FROM INFORMATION_SCHEMA.TABLES;
GO
```

Type `exit` to quit.

---

## 📊 Connection Details for External Tools

If you want to use **Azure Data Studio** or **DBeaver**:

| Setting | Value |
|---------|-------|
| Server | `localhost` or `127.0.0.1` |
| Port | `1433` |
| Authentication | SQL Server Authentication |
| Username | `sa` |
| Password | `MercedesBenz2026!` |
| Database | `mercedes_benz_db` |
| Trust Server Certificate | ✅ Yes |
| Encrypt | ✅ Yes |

---

## 💡 Pro Tips

1. **Be patient** - ARM Mac + Docker + SQL Server = slow (but it works!)
2. **Don't cancel** - Let restore commands run for 2-3 minutes
3. **Check logs** - If stuck: `docker logs mercedes-benz-mssql`
4. **Restart if needed** - `docker-compose restart`

---

**Ready?** Run the one-command restore above! 🚀
