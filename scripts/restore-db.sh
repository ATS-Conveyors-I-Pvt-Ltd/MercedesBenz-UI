#!/bin/bash

echo "🗄️  Mercedes-Benz Database Restore"
echo "=================================="
echo ""

echo "📝 Step 1: Getting logical file names from backup..."
docker exec mercedes-benz-mssql /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "MercedesBenz2026!" \
  -Q "SET NOCOUNT ON; RESTORE FILELISTONLY FROM DISK = '/database/mb_db.bak';" -h-1 -W > /tmp/filelist.txt 2>&1

# Extract first two logical names (data and log files)
DATA_FILE=$(awk 'NR==1 {print $1}' /tmp/filelist.txt | tr -d '\r')
LOG_FILE=$(awk 'NR==2 {print $1}' /tmp/filelist.txt | tr -d '\r')

echo "   Data file: $DATA_FILE"
echo "   Log file: $LOG_FILE"
echo ""

echo "📦 Step 2: Restoring database (this may take 2-3 minutes on ARM Mac)..."
docker exec mercedes-benz-mssql  /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "MercedesBenz2026!" \
  -Q "RESTORE DATABASE mercedes_benz_db FROM DISK = '/database/mb_db.bak' WITH MOVE '$DATA_FILE' TO '/var/opt/mssql/data/mercedes_benz_db.mdf', MOVE '$LOG_FILE' TO '/var/opt/mssql/data/mercedes_benz_db_log.ldf', REPLACE, STATS=25;" \
  -t 300

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database restored successfully!"
    echo ""
    echo "🔍 Step 3: Verifying database..."
    docker exec mercedes-benz-mssql /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "MercedesBenz2026!" \
      -Q "SELECT name, create_date, compatibility_level FROM sys.databases WHERE name='mercedes_benz_db';"
    echo ""
    echo "🎉 Done! Your backend can now connect to the database."
    echo "📝 Run: npm run dev"
else
    echo ""
    echo "❌ Restore failed. Check the error message above."
    exit 1
fi
