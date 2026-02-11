#!/bin/bash
echo "🗄️ Restoring Mercedes-Benz Database..."
echo ""
docker exec mercedes-benz-mssql /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "MercedesBenz2026!" -C \
  -Q "RESTORE DATABASE mercedes_benz_db FROM DISK = '/database/mb_db.bak' WITH REPLACE, STATS=25;" \
  -t 180

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database restored successfully!"
else
    echo ""
    echo "⚠️ If you see 'cannot be opened because it is version', try checking backup file."
fi
