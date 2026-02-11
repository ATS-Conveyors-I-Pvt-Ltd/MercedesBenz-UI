import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';
import sql from 'mssql';
import cron from 'node-cron';
import dotenv from 'dotenv';
import emailService from './services/emailService.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const BASE_DIR = path.join(__dirname, 'data', 'audit-reports', 'Audit_Trial_Report_AutoSave');

// Database Configuration from environment variables
const dbConfig = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || 'MercedesBenz2026!',
    server: process.env.DB_SERVER || 'localhost',
    port: parseInt(process.env.DB_PORT) || 1433,
    database: process.env.DB_NAME || 'mercedes_benz_db',
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: process.env.DB_TRUST_CERTIFICATE === 'true',
        enableArithAbort: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

// Connect to Database
async function connectToDB() {
    try {
        await sql.connect(dbConfig);
        console.log(`✅ Connected to SQL Server (${dbConfig.database}) at ${dbConfig.server}:${dbConfig.port}`);
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
        console.error('💡 Make sure Docker SQL Server is running: ./scripts/database.sh start');
    }
}
connectToDB();

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// Ensure base directory exists
fs.ensureDirSync(BASE_DIR);

// Health Check / DB Status Endpoint
app.get('/api/status', async (req, res) => {
    try {
        const result = await sql.query`SELECT @@VERSION as version`;
        res.json({
            status: 'online',
            db: 'connected',
            version: result.recordset[0].version
        });
    } catch (err) {
        res.status(500).json({ status: 'error', error: err.message });
    }
});

app.post('/api/save-logs', async (req, res) => {
    try {
        const { logs } = req.body;

        if (!logs || !Array.isArray(logs)) {
            return res.status(400).json({ error: 'Invalid logs data' });
        }

        const now = new Date();

        // Format: DDMMYYYY for folder
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        const dateFolder = `${day}${month}${year}`;

        // Format: HHMM_DDMMYYYY for file
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const fileName = `${hours}${minutes}_${dateFolder}.xlsx`;

        // Create folder path
        const folderPath = path.join(BASE_DIR, dateFolder);
        await fs.ensureDir(folderPath);

        // Prepare Excel Data
        const worksheetData = logs.map(log => ({
            'Timestamp': new Date(log.timestamp).toLocaleString(),
            'User Name': log.userName,
            'User Email': log.userEmail,
            'Action': log.action,
            'Details': log.details
        }));

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Audit Trail");

        // Write file
        const filePath = path.join(folderPath, fileName);
        XLSX.writeFile(workbook, filePath);

        console.log(`[AutoSave] Saved report to ${filePath}`);
        res.json({ success: true, path: filePath });

    } catch (error) {
        console.error('[AutoSave] Error saving report:', error);
        res.status(500).json({ error: 'Failed to save report' });
    }
});

// Email notification endpoint for login events
app.post('/api/notify-login', async (req, res) => {
    try {
        const { user, ipAddress } = req.body;

        if (!user) {
            return res.status(400).json({ error: 'User data required' });
        }

        const result = await emailService.sendLoginNotification(user, ipAddress);

        if (result.success) {
            console.log(`[Email] Login notification sent for ${user.name}`);
            res.json({ success: true, message: 'Notification sent' });
        } else {
            res.json({ success: false, message: result.message });
        }
    } catch (error) {
        console.error('[Email] Error sending login notification:', error);
        res.status(500).json({ error: 'Failed to send notification' });
    }
});

// Manual daily report endpoint
app.post('/api/send-daily-report', async (req, res) => {
    try {
        const { logs, stats } = req.body;

        if (!logs || !Array.isArray(logs)) {
            return res.status(400).json({ error: 'Logs data required' });
        }

        const result = await emailService.sendDailyReport(logs, stats);

        if (result.success) {
            console.log('[Email] Daily report sent successfully');
            res.json({ success: true, message: 'Daily report sent' });
        } else {
            res.json({ success: false, message: result.message });
        }
    } catch (error) {
        console.error('[Email] Error sending daily report:', error);
        res.status(500).json({ error: 'Failed to send daily report' });
    }
});

// Test email configuration
app.get('/api/test-email', async (req, res) => {
    try {
        const result = await emailService.testConnection();
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Schedule daily report (runs at 18:00 IST every day)
// Cron format: minute hour day month dayOfWeek
// 30 12 * * * = 12:30 UTC = 18:00 IST (IST is UTC+5:30)
const dailyReportTime = process.env.DAILY_REPORT_TIME || '18:00';
const [hour, minute] = dailyReportTime.split(':');
const utcHour = (parseInt(hour) - 5) % 24; // Convert IST to UTC (rough approximation)
const utcMinute = (parseInt(minute) - 30 + 60) % 60;

cron.schedule(`${utcMinute} ${utcHour} * * *`, async () => {
    console.log('[Cron] Running daily report job...');

    try {
        // Read today's logs from the file system
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        const dateFolder = `${day}${month}${year}`;
        const folderPath = path.join(BASE_DIR, dateFolder);

        // Check if folder exists
        if (await fs.pathExists(folderPath)) {
            const files = await fs.readdir(folderPath);
            const excelFiles = files.filter(f => f.endsWith('.xlsx'));

            let allLogs = [];

            // Read all Excel files from today
            for (const file of excelFiles) {
                const filePath = path.join(folderPath, file);
                const workbook = XLSX.readFile(filePath);
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const logs = XLSX.utils.sheet_to_json(worksheet);
                allLogs = allLogs.concat(logs);
            }

            // Calculate stats
            const stats = {
                totalActivities: allLogs.length,
                uniqueUsers: new Set(allLogs.map(l => l['User Email'])).size,
                loginCount: allLogs.filter(l => l.Action === 'Login').length
            };

            // Convert to expected format
            const formattedLogs = allLogs.map(log => ({
                timestamp: log.Timestamp,
                userName: log['User Name'],
                userEmail: log['User Email'],
                action: log.Action,
                details: log.Details,
                userId: log['User Email'] // Use email as userId fallback
            }));

            // Send email
            const result = await emailService.sendDailyReport(formattedLogs, stats);

            if (result.success) {
                console.log('[Cron] Daily report sent successfully');
            } else {
                console.log('[Cron] Daily report not sent:', result.message);
            }
        } else {
            console.log('[Cron] No logs found for today');
        }
    } catch (error) {
        console.error('[Cron] Error in daily report job:', error);
    }
});

console.log(`📅 Daily report scheduled for ${dailyReportTime} IST`);

// Test email configuration on startup
emailService.testConnection();

app.listen(PORT, () => {
    console.log(`Audit Log Server running on http://localhost:${PORT}`);
});
