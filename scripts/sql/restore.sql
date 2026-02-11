-- Restore Mercedes-Benz Database
-- Execute this in SQL Server

USE master;
GO

-- Restore the database
RESTORE DATABASE mercedes_benz_db 
FROM DISK = '/database/mb_db.bak'
WITH REPLACE, STATS = 10;
GO

-- Verify the restore
SELECT name, database_id, create_date, compatibility_level
FROM sys.databases
WHERE name = 'mercedes_benz_db';
GO

PRINT 'Database restored successfully!';
GO
