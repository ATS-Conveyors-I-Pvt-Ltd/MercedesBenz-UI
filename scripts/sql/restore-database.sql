-- Mercedes-Benz Database Restore Script
-- This script restores the database from backup file

USE master;
GO

-- Close existing connections to the database if it exists
IF EXISTS (SELECT name FROM sys.databases WHERE name = N'mercedes_benz_db')
BEGIN
    ALTER DATABASE mercedes_benz_db SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE mercedes_benz_db;
END
GO

-- Get logical file names from backup
RESTORE FILELISTONLY 
FROM DISK = '/database/mb_db.bak';
GO

-- Restore the database
-- Note: Adjust logical file names based on output from FILELISTONLY
RESTORE DATABASE mercedes_benz_db
FROM DISK = '/database/mb_db.bak'
WITH 
    MOVE 'mercedes_benz_db' TO '/var/opt/mssql/data/mercedes_benz_db.mdf',
    MOVE 'mercedes_benz_db_log' TO '/var/opt/mssql/data/mercedes_benz_db_log.ldf',
    REPLACE,
    STATS = 10;
GO

-- Set database to multi-user mode
ALTER DATABASE mercedes_benz_db SET MULTI_USER;
GO

-- Verify database restore
SELECT 
    name,
    database_id,
    create_date,
    compatibility_level,
    state_desc
FROM sys.databases 
WHERE name = 'mercedes_benz_db';
GO

PRINT 'Database restored successfully!';
GO
