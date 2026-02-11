// Mercedes-Benz Andon Service API
// Takt Time Calculations and Production Tracking

import express from 'express';
import { body, query, validationResult } from 'express-validator';

const router = express.Router();

/**
 * Calculate Takt Time
 * Formula: Available Production Time / Customer Demand
 * 
 * Takt Time = (Shift Duration - Breaks) / Required Production Volume
 */
function calculateTaktTime(shiftDuration, breaks, targetProduction) {
    const availableTime = (shiftDuration - breaks) * 60; // Convert to minutes
    const taktTimeSeconds = (availableTime / targetProduction) * 60; // In seconds

    return {
        taktTimeSeconds,
        taktTimeMinutes: taktTimeSeconds / 60,
        availableTimeMinutes: availableTime,
        targetProduction,
        piecesPerMinute: targetProduction / availableTime
    };
}

/**
 * Calculate Cycle Time
 * Actual time to complete one unit
 */
function calculateCycleTime(totalUnitsProduced, actualProductionTime) {
    if (totalUnitsProduced === 0) return 0;
    return (actualProductionTime * 60) / totalUnitsProduced; // In seconds
}

/**
 * Calculate Line Efficiency
 * Formula: (Actual Output / Planned Output) * 100
 */
function calculateLineEfficiency(actualOutput, plannedOutput) {
    if (plannedOutput === 0) return 0;
    return (actualOutput / plannedOutput) * 100;
}

/**
 * Calculate OEE (Overall Equipment Effectiveness)
 * OEE = Availability × Performance × Quality
 */
function calculateOEE(availability, performance, quality) {
    return (availability / 100) * (performance / 100) * (quality / 100) * 100;
}

/**
 * Calculate Availability
 * Formula: (Operating Time / Planned Production Time) × 100
 */
function calculateAvailability(operatingTime, plannedTime) {
    if (plannedTime === 0) return 0;
    return (operatingTime / plannedTime) * 100;
}

/**
 * Calculate Performance
 * Formula: (Ideal Cycle Time × Total Count) / Operating Time × 100
 */
function calculatePerformance(idealCycleTime, totalCount, operatingTime) {
    if (operatingTime === 0) return 0;
    return ((idealCycleTime * totalCount) / operatingTime) * 100;
}

/**
 * Calculate Quality Rate
 * Formula: (Good Count / Total Count) × 100
 */
function calculateQuality(goodCount, totalCount) {
    if (totalCount === 0) return 0;
    return (goodCount / totalCount) * 100;
}

/**
 * Calculate Time Lost
 * Total downtime in minutes
 */
function calculateTimeLost(plannedTime, actualOperatingTime) {
    return plannedTime - actualOperatingTime;
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

/**
 * GET /api/andon/takt-time
 * Calculate takt time for a specific line and shift
 */
router.get('/takt-time', [
    query('lineId').isInt().withMessage('Line ID must be an integer'),
    query('shiftId').optional().isInt().withMessage('Shift ID must be an integer'),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 0,
                errorMsg: 'Validation failed',
                errors: errors.array()
            });
        }

        const { lineId, shiftId } = req.query;

        // Get shift data from database
        const shiftQuery = shiftId
            ? `SELECT * FROM iprod_andon_summary_queue WHERE line_id = @lineId AND shift_id = @shiftId`
            : `SELECT * FROM iprod_andon_summary_queue WHERE line_id = @lineId AND shift_start_time <= GETDATE() AND shift_stop_time >= GETDATE()`;

        const pool = req.app.get('dbPool');
        const result = await pool.request()
            .input('lineId', lineId)
            .input('shiftId', shiftId)
            .query(shiftQuery);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                status: 0,
                errorMsg: 'No data found for the specified line and shift'
            });
        }

        const shiftData = result.recordset[0];

        // Calculate shift duration in hours
        const shiftStart = new Date(shiftData.shift_start_time);
        const shiftEnd = new Date(shiftData.shift_stop_time);
        const shiftDurationHours = (shiftEnd - shiftStart) / (1000 * 60 * 60);

        // Calculate takt time
        const taktTimeData = calculateTaktTime(
            shiftDurationHours,
            shiftData.break_time || 0,
            shiftData.shift_target || shiftData.target_count
        );

        res.json({
            status: 1,
            data: {
                lineId: shiftData.line_id,
                lineName: shiftData.line_name,
                shiftName: shiftData.shift_name,
                shiftTarget: shiftData.shift_target,
                ...taktTimeData,
                calculatedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error calculating takt time:', error);
        res.status(500).json({
            status: 0,
            errorMsg: 'Internal server error while calculating takt time'
        });
    }
});

/**
 * GET /api/andon/current-shift
 * Get current shift details for all lines or specific line
 */
router.get('/current-shift', [
    query('lineId').optional().isInt()
], async (req, res) => {
    try {
        const { lineId } = req.query;
        const pool = req.app.get('dbPool');

        let query = `
            SELECT * FROM iprod_view_wc_andon_summary_queue
            WHERE shift_start_time <= GETDATE() 
            AND shift_stop_time >= GETDATE()
        `;

        if (lineId) {
            query += ` AND line_id = @lineId`;
        }

        query += ` ORDER BY line_name, station_name`;

        const request = pool.request();
        if (lineId) {
            request.input('lineId', lineId);
        }

        const result = await request.query(query);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                status: 0,
                errorMsg: 'No active shift found'
            });
        }

        res.json({
            status: 1,
            data: result.recordset
        });

    } catch (error) {
        console.error('Error fetching current shift:', error);
        res.status(500).json({
            status: 0,
            errorMsg: 'Internal server error'
        });
    }
});

/**
 * GET /api/andon/day-wise
 * Get day-wise andon data for a specific line
 */
router.get('/day-wise', [
    query('lineId').isInt().withMessage('Line ID is required'),
    query('date').optional().isISO8601().withMessage('Invalid date format')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 0,
                errors: errors.array()
            });
        }

        const { lineId, date } = req.query;
        const targetDate = date ? new Date(date) : new Date();
        const pool = req.app.get('dbPool');

        const result = await pool.request()
            .input('lineId', lineId)
            .input('targetDate', targetDate)
            .query(`
                SELECT * FROM iprod_view_wc_andon_summary_queue
                WHERE line_id = @lineId
                AND CAST(curr_datetime AS DATE) = CAST(@targetDate AS DATE)
                ORDER BY station_name, curr_datetime
            `);

        res.json({
            status: 1,
            data: result.recordset,
            summary: {
                totalRecords: result.recordset.length,
                date: targetDate.toISOString().split('T')[0]
            }
        });

    } catch (error) {
        console.error('Error fetching day-wise data:', error);
        res.status(500).json({
            status: 0,
            errorMsg: 'Internal server error'
        });
    }
});

/**
 * POST /api/andon/update-actuals
 * Update actual production numbers
 */
router.post('/update-actuals', [
    body('andonStationSummaryQueueId').isInt(),
    body('shiftActuals').isInt().withMessage('Shift actuals must be a number')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 0,
                errors: errors.array()
            });
        }

        const { andonStationSummaryQueueId, shiftActuals } = req.body;
        const pool = req.app.get('dbPool');

        const result = await pool.request()
            .input('id', andonStationSummaryQueueId)
            .input('actuals', shiftActuals)
            .input('updatedAt', new Date())
            .query(`
                UPDATE iprod_andon_summary_queue
                SET shift_actuals = @actuals,
                    updated_at = @updatedAt
                WHERE andon_station_summary_queue_id = @id
            `);

        if (result.rowsAffected[0] > 0) {
            res.json({
                status: 1,
                successMsg: 'Actuals successfully updated'
            });
        } else {
            res.status(404).json({
                status: 0,
                errorMsg: 'Record not found'
            });
        }

    } catch (error) {
        console.error('Error updating actuals:', error);
        res.status(500).json({
            status: 0,
            errorMsg: 'Update operation failed'
        });
    }
});

/**
 * GET /api/andon/filter
 * Get filtered andon data by date range, line, and shift
 */
router.get('/filter', [
    query('fromDate').isISO8601(),
    query('toDate').isISO8601(),
    query('lineName').optional(),
    query('shiftName').optional()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 0,
                errors: errors.array()
            });
        }

        const { fromDate, toDate, lineName, shiftName } = req.query;
        const pool = req.app.get('dbPool');

        let query = `
            SELECT * FROM iprod_view_wc_andon_summary_queue
            WHERE CAST(curr_datetime AS DATE) BETWEEN @fromDate AND @toDate
        `;

        const request = pool.request()
            .input('fromDate', new Date(fromDate))
            .input('toDate', new Date(toDate));

        if (lineName) {
            query += ` AND line_name = @lineName`;
            request.input('lineName', lineName);
        }

        if (shiftName) {
            query += ` AND shift_name = @shiftName`;
            request.input('shiftName', shiftName);
        }

        query += ` ORDER BY curr_datetime DESC, line_name, station_name`;

        const result = await request.query(query);

        res.json({
            status: 1,
            data: result.recordset,
            filters: { fromDate, toDate, lineName, shiftName }
        });

    } catch (error) {
        console.error('Error filtering data:', error);
        res.status(500).json({
            status: 0,
            errorMsg: 'Internal server error'
        });
    }
});

/**
 * GET /api/andon/time-lost
 * Calculate time lost for a specific line in current shift
 */
router.get('/time-lost', [
    query('lineId').isInt()
], async (req, res) => {
    try {
        const { lineId } = req.query;
        const pool = req.app.get('dbPool');

        const result = await pool.request()
            .input('lineId', lineId)
            .query(`
                SELECT 
                    line_id,
                    line_name,
                    shift_name,
                    SUM(DATEDIFF(MINUTE, shift_start_time, ISNULL(breakdown_end_time, GETDATE()))) as total_time_lost_minutes,
                    COUNT(*) as breakdown_count
                FROM iprod_view_wc_andon_summary_queue
                WHERE line_id = @lineId
                AND shift_start_time <= GETDATE()
                AND shift_stop_time >= GETDATE()
                AND breakdown_start_time IS NOT NULL
                GROUP BY line_id, line_name, shift_name
            `);

        if (result.recordset.length === 0) {
            return res.json({
                status: 1,
                data: {
                    lineId,
                    totalTimeLostMinutes: 0,
                    breakdownCount: 0,
                    message: 'No breakdowns in current shift'
                }
            });
        }

        res.json({
            status: 1,
            data: result.recordset[0]
        });

    } catch (error) {
        console.error('Error calculating time lost:', error);
        res.status(500).json({
            status: 0,
            errorMsg: 'Internal server error'
        });
    }
});

/**
 * GET /api/andon/performance-metrics
 * Get comprehensive performance metrics for a line
 */
router.get('/performance-metrics', [
    query('lineId').isInt(),
    query('shiftId').optional().isInt()
], async (req, res) => {
    try {
        const { lineId, shiftId } = req.query;
        const pool = req.app.get('dbPool');

        // Get shift data with aggregations
        const result = await pool.request()
            .input('lineId', lineId)
            .input('shiftId', shiftId)
            .query(`
                SELECT 
                    line_id,
                    line_name,
                    shift_name,
                    shift_target,
                    SUM(shift_actuals) as total_actuals,
                    AVG(shift_actuals) as avg_actuals_per_station,
                    DATEDIFF(MINUTE, MIN(shift_start_time), MAX(shift_stop_time)) as total_shift_minutes,
                    SUM(DATEDIFF(MINUTE, breakdown_start_time, ISNULL(breakdown_end_time, GETDATE()))) as total_downtime_minutes
                FROM iprod_view_wc_andon_summary_queue
                WHERE line_id = @lineId
                ${shiftId ? 'AND shift_id = @shiftId' : 'AND shift_start_time <= GETDATE() AND shift_stop_time >= GETDATE()'}
                GROUP BY line_id, line_name, shift_name, shift_target
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                status: 0,
                errorMsg: 'No data found'
            });
        }

        const data = result.recordset[0];

        // Calculate metrics
        const availability = calculateAvailability(
            data.total_shift_minutes - (data.total_downtime_minutes || 0),
            data.total_shift_minutes
        );

        const efficiency = calculateLineEfficiency(
            data.total_actuals || 0,
            data.shift_target || 0
        );

        const taktTime = calculateTaktTime(
            data.total_shift_minutes / 60,
            0, // Breaks already subtracted
            data.shift_target
        );

        res.json({
            status: 1,
            data: {
                ...data,
                metrics: {
                    availability: availability.toFixed(2),
                    efficiency: efficiency.toFixed(2),
                    taktTimeSeconds: taktTime.taktTimeSeconds.toFixed(2),
                    totalDowntimeMinutes: data.total_downtime_minutes || 0,
                    productionRate: ((data.total_actuals || 0) / data.total_shift_minutes).toFixed(2)
                }
            }
        });

    } catch (error) {
        console.error('Error calculating performance metrics:', error);
        res.status(500).json({
            status: 0,
            errorMsg: 'Internal server error'
        });
    }
});

export default router;
