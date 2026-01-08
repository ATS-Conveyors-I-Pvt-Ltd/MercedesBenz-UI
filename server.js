import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';
import sql from 'mssql';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const BASE_DIR = path.join(__dirname, 'Audit_Trial_Report_AutoSave');

// Database Configuration
const dbConfig = {
    user: 'sa',
    password: 'YourStrong!Passw0rd',
    server: 'localhost',
    database: 'iprod_mercedes_benz_db',
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

// Connect to Database
async function connectToDB() {
    try {
        await sql.connect(dbConfig);
        console.log('✅ Connected to SQL Server (iprod_mercedes_benz_db)');
    } catch (err) {
        console.error('❌ Database connection failed:', err);
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

app.listen(PORT, () => {
    console.log(`Audit Log Server running on http://localhost:${PORT}`);
});
