/**
 * Andon Service API Client
 * Connects to Java Spring Boot backend (port 8080) or Node.js backend (port 3001)
 */

// Configuration - Change this to switch between backends
const USE_JAVA_BACKEND = true;

const JAVA_API_URL = 'http://localhost:8080/api/andon';
const NODE_API_URL = 'http://localhost:3001/api/andon';

const API_BASE_URL = USE_JAVA_BACKEND ? JAVA_API_URL : NODE_API_URL;

class AndonService {
    /**
     * Get current shift details for all lines
     */
    static async getCurrentShift() {
        try {
            const response = await fetch(`${API_BASE_URL}/current-shift`);
            const data = await response.json();

            if (data.status === 1) {
                return { success: true, data: data.data };
            } else {
                return { success: false, error: data.errorMsg };
            }
        } catch (error) {
            console.error('Error fetching current shift:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get day-wise andon data for a specific line
     * @param {number} lineId - Line ID
     * @param {string} date - Date in dd-MM-yyyy format (optional)
     */
    static async getDayWiseData(lineId, date = null) {
        try {
            let url = `${API_BASE_URL}/day-wise?lineId=${lineId}`;
            if (date) {
                url += `&date=${date}`;
            }

            const response = await fetch(url);
            const data = await response.json();

            if (data.status === 1) {
                return { success: true, data: data.data };
            } else {
                return { success: false, error: data.errorMsg };
            }
        } catch (error) {
            console.error('Error fetching day-wise data:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Calculate takt time for a specific line
     * @param {number} lineId - Line ID
     */
    static async getTaktTime(lineId) {
        try {
            const response = await fetch(`${API_BASE_URL}/takt-time?lineId=${lineId}`);
            const data = await response.json();

            if (data.status === 1) {
                return { success: true, data: data.data };
            } else {
                return { success: false, error: data.errorMsg };
            }
        } catch (error) {
            console.error('Error calculating takt time:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get time lost for a specific line
     * @param {number} lineId - Line ID
     */
    static async getTimeLost(lineId) {
        try {
            const response = await fetch(`${API_BASE_URL}/time-lost?lineId=${lineId}`);
            const data = await response.json();

            if (data.status === 1) {
                return { success: true, data: data.data };
            } else {
                return { success: false, error: data.errorMsg };
            }
        } catch (error) {
            console.error('Error fetching time lost:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Update shift actuals
     * @param {number} id - Andon station summary queue ID
     * @param {number} actuals - Shift actuals value
     */
    static async updateActuals(id, actuals) {
        try {
            const response = await fetch(`${API_BASE_URL}/update-actuals`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    andonStationSummaryQueueId: id,
                    shiftActuals: actuals
                })
            });

            const data = await response.json();

            if (data.status === 1) {
                return { success: true, message: data.successMsg };
            } else {
                return { success: false, error: data.errorMsg };
            }
        } catch (error) {
            console.error('Error updating actuals:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get filtered data by date range
     * @param {string} fromDate - From date in dd-MM-yyyy format
     * @param {string} toDate - To date in dd-MM-yyyy format
     * @param {string} lineName - Line name (optional)
     * @param {string} shiftName - Shift name (optional)
     */
    static async getFilteredData(fromDate, toDate, lineName = null, shiftName = null) {
        try {
            let url = `${API_BASE_URL}/filter?fromDate=${fromDate}&toDate=${toDate}`;
            if (lineName) url += `&lineName=${lineName}`;
            if (shiftName) url += `&shiftName=${shiftName}`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.status === 1) {
                return { success: true, data: data.data, filters: data.filters };
            } else {
                return { success: false, error: data.errorMsg };
            }
        } catch (error) {
            console.error('Error fetching filtered data:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get performance metrics for a line
     * @param {number} lineId - Line ID
     * @param {number} shiftId - Shift ID (optional)
     */
    static async getPerformanceMetrics(lineId, shiftId = null) {
        try {
            let url = `${API_BASE_URL}/performance-metrics?lineId=${lineId}`;
            if (shiftId) url += `&shiftId=${shiftId}`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.status === 1) {
                return { success: true, data: data.data };
            } else {
                return { success: false, error: data.errorMsg };
            }
        } catch (error) {
            console.error('Error fetching performance metrics:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Check backend health
     */
    static async checkHealth() {
        try {
            const response = await fetch(`${API_BASE_URL}/health`);
            if (response.ok) {
                const text = await response.text();
                return { success: true, message: text };
            } else {
                return { success: false, error: 'Backend not responding' };
            }
        } catch (error) {
            console.error('Error checking health:', error);
            return { success: false, error: error.message };
        }
    }
}

export default AndonService;

// Export configuration for easy access
export { USE_JAVA_BACKEND, JAVA_API_URL, NODE_API_URL, API_BASE_URL };
