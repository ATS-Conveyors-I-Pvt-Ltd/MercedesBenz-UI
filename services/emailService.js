import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

class EmailService {
    constructor() {
        this.transporter = null;
        this.isConfigured = false;
        this.initializeTransporter();
    }

    initializeTransporter() {
        try {
            // Check if email credentials are configured
            if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your-email@gmail.com') {
                console.warn('⚠️  Email service not configured. Please update .env file with your email credentials.');
                this.isConfigured = false;
                return;
            }

            this.transporter = nodemailer.createTransport({
                service: process.env.EMAIL_SERVICE || 'gmail',
                host: process.env.EMAIL_HOST || 'smtp.gmail.com',
                port: parseInt(process.env.EMAIL_PORT) || 587,
                secure: process.env.EMAIL_SECURE === 'true',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD
                }
            });

            this.isConfigured = true;
            console.log('✅ Email service initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize email service:', error.message);
            this.isConfigured = false;
        }
    }

    async sendEmail(to, subject, html, text = '') {
        if (!this.isConfigured) {
            console.log('📧 Email not sent (service not configured):', subject);
            return { success: false, message: 'Email service not configured' };
        }

        try {
            const mailOptions = {
                from: `"${process.env.APP_NAME}" <${process.env.EMAIL_USER}>`,
                to: to,
                subject: subject,
                text: text,
                html: html
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Email sent successfully:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('❌ Failed to send email:', error.message);
            return { success: false, message: error.message };
        }
    }

    // Send login notification to admin
    async sendLoginNotification(user, ipAddress = 'Unknown') {
        if (process.env.ENABLE_LOGIN_NOTIFICATIONS !== 'true') {
            return { success: false, message: 'Login notifications disabled' };
        }

        const adminEmail = process.env.ADMIN_EMAIL;
        const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

        const subject = `🔐 New Login Alert - ${user.name}`;

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
                    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #00aad2 0%, #0082a8 100%); color: white; padding: 30px; text-align: center; }
                    .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
                    .header p { margin: 5px 0 0 0; opacity: 0.9; font-size: 14px; }
                    .content { padding: 30px; }
                    .info-box { background: #f8f9fa; border-left: 4px solid #00aad2; padding: 15px; margin: 20px 0; border-radius: 4px; }
                    .info-row { display: flex; padding: 8px 0; border-bottom: 1px solid #e0e0e0; }
                    .info-row:last-child { border-bottom: none; }
                    .info-label { font-weight: 600; color: #555; width: 140px; }
                    .info-value { color: #333; flex: 1; }
                    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
                    .status-success { background: #d4edda; color: #155724; }
                    .status-warning { background: #fff3cd; color: #856404; }
                    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
                    .alert-icon { font-size: 48px; text-align: center; margin-bottom: 10px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="alert-icon">🔐</div>
                        <h1>Login Alert</h1>
                        <p>Mercedes-Benz Digital Assembly Platform</p>
                    </div>
                    <div class="content">
                        <p>Hello <strong>${process.env.ADMIN_NAME}</strong>,</p>
                        <p>A user has successfully logged into the system. Here are the details:</p>
                        
                        <div class="info-box">
                            <div class="info-row">
                                <span class="info-label">User Name:</span>
                                <span class="info-value"><strong>${user.name}</strong></span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Login ID:</span>
                                <span class="info-value">${user.username || user.email}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Email:</span>
                                <span class="info-value">${user.email}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Role:</span>
                                <span class="info-value">
                                    <span class="status-badge ${user.role === 'admin' ? 'status-warning' : 'status-success'}">
                                        ${user.role.toUpperCase()}
                                    </span>
                                </span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Login Time:</span>
                                <span class="info-value">${timestamp}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">IP Address:</span>
                                <span class="info-value">${ipAddress}</span>
                            </div>
                        </div>

                        <p style="color: #666; font-size: 14px; margin-top: 20px;">
                            If this login was not authorized, please take immediate action to secure the account.
                        </p>
                    </div>
                    <div class="footer">
                        <p>© 2026 Mercedes-Benz Digital Assembly Platform</p>
                        <p>This is an automated notification. Please do not reply to this email.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const text = `
New Login Alert

User: ${user.name}
Login ID: ${user.username || user.email}
Email: ${user.email}
Role: ${user.role}
Time: ${timestamp}
IP: ${ipAddress}

Mercedes-Benz Digital Assembly Platform
        `.trim();

        return await this.sendEmail(adminEmail, subject, html, text);
    }

    // Send daily activity report
    async sendDailyReport(logs, stats) {
        if (process.env.ENABLE_DAILY_REPORTS !== 'true') {
            return { success: false, message: 'Daily reports disabled' };
        }

        const adminEmail = process.env.ADMIN_EMAIL;
        const date = new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'Asia/Kolkata'
        });

        const subject = `📊 Daily Activity Report - ${new Date().toLocaleDateString('en-IN')}`;

        // Generate activity summary
        const actionCounts = {};
        logs.forEach(log => {
            actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
        });

        const topActions = Object.entries(actionCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        // Recent activities (last 10)
        const recentLogs = logs.slice(0, 10);

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
                    .container { max-width: 700px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #00aad2 0%, #0082a8 100%); color: white; padding: 30px; text-align: center; }
                    .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
                    .header p { margin: 10px 0 0 0; opacity: 0.9; font-size: 16px; }
                    .content { padding: 30px; }
                    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0; }
                    .stat-card { background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 20px; border-radius: 8px; text-align: center; border: 1px solid #dee2e6; }
                    .stat-number { font-size: 32px; font-weight: 700; color: #00aad2; margin: 5px 0; }
                    .stat-label { font-size: 12px; color: #666; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; }
                    .section-title { font-size: 18px; font-weight: 600; color: #333; margin: 30px 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #00aad2; }
                    .activity-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                    .activity-table th { background: #f8f9fa; padding: 12px; text-align: left; font-size: 12px; color: #666; text-transform: uppercase; font-weight: 600; border-bottom: 2px solid #dee2e6; }
                    .activity-table td { padding: 12px; border-bottom: 1px solid #e9ecef; font-size: 14px; }
                    .activity-table tr:hover { background: #f8f9fa; }
                    .action-badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; }
                    .action-login { background: #d4edda; color: #155724; }
                    .action-logout { background: #f8d7da; color: #721c24; }
                    .action-default { background: #d1ecf1; color: #0c5460; }
                    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
                    .chart-icon { font-size: 48px; text-align: center; margin-bottom: 10px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="chart-icon">📊</div>
                        <h1>Daily Activity Report</h1>
                        <p>${date}</p>
                    </div>
                    
                    <div class="content">
                        <p>Hello <strong>${process.env.ADMIN_NAME}</strong>,</p>
                        <p>Here's the daily summary of activities on the Mercedes-Benz Digital Assembly Platform.</p>

                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-label">Total Activities</div>
                                <div class="stat-number">${stats.totalActivities || logs.length}</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-label">Unique Users</div>
                                <div class="stat-number">${stats.uniqueUsers || new Set(logs.map(l => l.userId)).size}</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-label">Login Events</div>
                                <div class="stat-number">${actionCounts['Login'] || 0}</div>
                            </div>
                        </div>

                        ${topActions.length > 0 ? `
                            <div class="section-title">🏆 Top Activities</div>
                            <table class="activity-table">
                                <thead>
                                    <tr>
                                        <th>Action</th>
                                        <th style="text-align: right;">Count</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${topActions.map(([action, count]) => `
                                        <tr>
                                            <td><span class="action-badge action-default">${action}</span></td>
                                            <td style="text-align: right; font-weight: 600;">${count}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        ` : ''}

                        ${recentLogs.length > 0 ? `
                            <div class="section-title">🕒 Recent Activities</div>
                            <table class="activity-table">
                                <thead>
                                    <tr>
                                        <th>Time</th>
                                        <th>User</th>
                                        <th>Action</th>
                                        <th>Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${recentLogs.map(log => {
            const time = new Date(log.timestamp).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'Asia/Kolkata'
            });
            const badgeClass = log.action === 'Login' ? 'action-login' :
                log.action === 'Logout' ? 'action-logout' : 'action-default';
            return `
                                            <tr>
                                                <td style="white-space: nowrap;">${time}</td>
                                                <td>${log.userName}</td>
                                                <td><span class="action-badge ${badgeClass}">${log.action}</span></td>
                                                <td style="color: #666; font-size: 13px;">${log.details || '-'}</td>
                                            </tr>
                                        `;
        }).join('')}
                                </tbody>
                            </table>
                        ` : '<p style="color: #666;">No activities recorded today.</p>'}

                        <p style="color: #666; font-size: 14px; margin-top: 30px;">
                            📁 Detailed logs have been saved to the audit trail system.
                        </p>
                    </div>
                    
                    <div class="footer">
                        <p>© 2026 Mercedes-Benz Digital Assembly Platform</p>
                        <p>This is an automated daily report. Please do not reply to this email.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const text = `
Daily Activity Report - ${date}

Statistics:
- Total Activities: ${stats.totalActivities || logs.length}
- Unique Users: ${stats.uniqueUsers || new Set(logs.map(l => l.userId)).size}
- Login Events: ${actionCounts['Login'] || 0}

Top Activities:
${topActions.map(([action, count]) => `- ${action}: ${count}`).join('\n')}

Recent Activities:
${recentLogs.slice(0, 5).map(log =>
            `- ${new Date(log.timestamp).toLocaleTimeString('en-IN')} | ${log.userName} | ${log.action}`
        ).join('\n')}

Mercedes-Benz Digital Assembly Platform
        `.trim();

        return await this.sendEmail(adminEmail, subject, html, text);
    }

    // Send custom notification
    async sendCustomNotification(subject, message, details = {}) {
        const adminEmail = process.env.ADMIN_EMAIL;
        const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
                    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #00aad2 0%, #0082a8 100%); color: white; padding: 30px; text-align: center; }
                    .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
                    .content { padding: 30px; }
                    .message-box { background: #f8f9fa; border-left: 4px solid #00aad2; padding: 20px; margin: 20px 0; border-radius: 4px; }
                    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>${subject}</h1>
                    </div>
                    <div class="content">
                        <p>Hello <strong>${process.env.ADMIN_NAME}</strong>,</p>
                        <div class="message-box">
                            <p>${message}</p>
                            ${details ? `<pre style="background: white; padding: 10px; border-radius: 4px; overflow-x: auto;">${JSON.stringify(details, null, 2)}</pre>` : ''}
                        </div>
                        <p style="color: #666; font-size: 12px;">Time: ${timestamp}</p>
                    </div>
                    <div class="footer">
                        <p>© 2026 Mercedes-Benz Digital Assembly Platform</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return await this.sendEmail(adminEmail, subject, html, message);
    }

    // Test email configuration
    async testConnection() {
        if (!this.isConfigured) {
            return { success: false, message: 'Email service not configured' };
        }

        try {
            await this.transporter.verify();
            console.log('✅ Email service connection verified');
            return { success: true, message: 'Connection verified' };
        } catch (error) {
            console.error('❌ Email service verification failed:', error.message);
            return { success: false, message: error.message };
        }
    }
}

// Export singleton instance
const emailService = new EmailService();
export default emailService;
