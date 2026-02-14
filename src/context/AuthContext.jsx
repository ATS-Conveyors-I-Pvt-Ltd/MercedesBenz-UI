import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from "axios";


const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);

    const STORAGE_CURRENT_USER = "am_current_user_v1";
    // const [loading, setIsLoading] = useState(true);
     const [isLoading, setIsLoading] = useState(true);

    // // Hardcoded Admin
    // const ADMIN_CREDS = {
    //     email: 'admin@MB',
    //     password: 'Admin@'
    // };

    // Services list for permissions
    const SERVICES = ['Andon', 'Breakdown', 'Management', 'Reports', 'Auth'];

    // Mock Users Database (persisted in localStorage for demo)
    const [users, setUsers] = useState(() => {
        const savedUsers = localStorage.getItem('mb_users');
        return savedUsers ? JSON.parse(savedUsers) : [
            { id: 1, name: 'Admin', username: 'admin@MB', email: ADMIN_CREDS.email, password: ADMIN_CREDS.password, role: 'admin', status: 'approved', permissions: Object.fromEntries(SERVICES.map(s => [s, true])) }
        ];
    });

    useEffect(() => {
        // Check for active session
        const storedUser = localStorage.getItem('mb_user');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    // Activity Logs
    const [activityLogs, setActivityLogs] = useState(() => {
        const savedLogs = localStorage.getItem('mb_activity_logs');
        return savedLogs ? JSON.parse(savedLogs) : [];
    });

    useEffect(() => {
        localStorage.setItem('mb_activity_logs', JSON.stringify(activityLogs));
    }, [activityLogs]);

    // Auto-Save Logic (Background Timer)
    useEffect(() => {
        // Track the last hour we saved to prevent duplicates
        let lastProcessedHour = null;

        const checkAutoSave = async () => {
            const now = new Date();
            const currentHour = now.getHours();

            // Check if we are in a new hour (and haven't processed it yet)
            // This logic allows it to run immediately if the shift/hour changes
            if (lastProcessedHour !== currentHour) {
                console.log(`[AutoSave Trigger] It's a new hour (${currentHour}). Saving logs...`);

                // 1. Save Logs
                if (activityLogs.length > 0) {
                    try {
                        const response = await fetch('http://localhost:3001/api/save-logs', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ logs: activityLogs })
                        });
                        if (response.ok) {
                            console.log('[AutoSave] Successfully saved logs to server.');
                        }
                    } catch (err) {
                        console.error('[AutoSave] Failed to connect to local server:', err);
                    }
                }

                // 2. Clear Cache if 6 AM
                if (currentHour === 6) {
                    console.log('[AutoSave] 6 AM detected. Clearing cache...');
                    setActivityLogs([]); // Clear logs from memory/storage
                    // Note: We already saved above.
                }

                // Mark this hour as processed
                lastProcessedHour = currentHour;
            }
        };

        // Run check immediately on mount, then every 60 seconds
        checkAutoSave();
        const intervalId = setInterval(checkAutoSave, 60000);

        return () => clearInterval(intervalId);
    }, [activityLogs]);

    const logActivity = (user, action, details = '') => {
        const newLog = {
            id: Date.now(),
            userId: user.id || 'unknown',
            userName: user.name || user.username || 'System',
            userEmail: user.email || 'N/A',
            action,
            details,
            timestamp: new Date().toISOString()
        };
        setActivityLogs(prev => [newLog, ...prev]);
    };

    // Sync users to local storage whenever they change
    useEffect(() => {
        localStorage.setItem('mb_users', JSON.stringify(users));
    }, [users]);

const login = async (userName, userPassword) => {
setIsLoading(true);

  debugger
  try {
    const response = await axios.post(
      "http://localhost:8080/login/authenticate",
      null,
      {
        params: {
          userName,
          userPassword,
        },
      }
    );

    console.log("Login Success:", response.data);
const user = response.data;
   
    // ✅ IMPORTANT
    setCurrentUser(user);
    localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(user));
    localStorage.setItem("token", user.token);


    alert("Login Successful ✅");

    return { success: true, user };

  } catch (err) {
    console.error("Login error:", err);

    if (err.response?.status === 401) {
      alert("Invalid credentials ❌");
      return { success: false, message: "Invalid credentials" };
    }

    if (err.response?.status === 403) {
      alert("Account not approved ❌");
      return { success: false, message: "Account not approved" };
    }

    alert("Server error ❌");
    return { success: false, message: "Server error" };

  } finally {
    setIsLoading(false);
  }
};

    const signup = (userDetails) => {
        const exists = users.find(u => u.username === userDetails.username || u.email === userDetails.email);
        if (exists) throw new Error("Login ID or Email already exists.");

        const newUser = {
            id: Date.now(),
            ...userDetails,
            role: 'user', // Default role
            status: 'pending', // Default status
            permissions: {}
        };

        setUsers([...users, newUser]);
        logActivity(newUser, 'Signup', 'New user account created');
        // Auto login not enabled for pending users usually, but purely for demo logic can return user
        return newUser;
    };

    const logout = () => {
        if (currentUser) {
            logActivity(currentUser, 'Logout', 'User logged out');
        }
        localStorage.removeItem('mb_user');
        setCurrentUser(null);
        window.location.href = '/login'; // Force redirect
    };

    // Admin Functions for Access Matrix
    const updateUserStatus = (userId, status) => {
        const user = users.find(u => u.id === userId);
        setUsers(users.map(u => u.id === userId ? { ...u, status } : u));
        if (currentUser) {
            logActivity(currentUser, 'Update User Status', `Updated status of ${user?.name || userId} to ${status}`);
        }
    };

    const togglePermission = (userId, service) => {
        const user = users.find(u => u.id === userId);
        setUsers(users.map(u => {
            if (u.id === userId) {
                const newPerms = { ...u.permissions, [service]: !u.permissions?.[service] };
                return { ...u, permissions: newPerms };
            }
            return u;
        }));
        if (currentUser) {
            logActivity(currentUser, 'Toggle Permission', `Toggled ${service} permission for ${user?.name || userId}`);
        }
    };

    const setAllPermissions = (userId, granted) => {
        const user = users.find(u => u.id === userId);
        setUsers(users.map(u => {
            if (u.id === userId) {
                const newPerms = Object.fromEntries(SERVICES.map(s => [s, granted]));
                return { ...u, permissions: newPerms };
            }
            return u;
        }));
        if (currentUser) {
            logActivity(currentUser, 'Set All Permissions', `Set all rights to ${granted} for ${user?.name || userId}`);
        }
    };

    const addUser = (newUser) => {
        const user = { ...newUser, id: Date.now() };
        setUsers([...users, user]);
        if (currentUser) {
            logActivity(currentUser, 'Add User', `Added new user ${newUser.name}`);
        }
    };

    const updateUser = (id, data) => {
        const user = users.find(u => u.id === id);
        setUsers(users.map(u => u.id === id ? { ...u, ...data } : u));
        if (currentUser) {
            logActivity(currentUser, 'Update User', `Updated details for ${user?.name || id}`);
        }
    };

    const clearUserActivity = () => {
        setActivityLogs([]);
        if (currentUser) {
            logActivity(currentUser, 'Clear Logs', 'Cleared all activity logs');
        }
    }


    const value = {
        currentUser,
        users, // For Access Matrix
        login,
        signup,
        logout,
        SERVICES,
        // Logging
        activityLogs,
        logActivity,
        // Admin actions
        updateUserStatus,
        togglePermission,
        setAllPermissions,
        addUser,
        updateUser,
        clearUserActivity
    };

    return (
        <AuthContext.Provider value={value}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};
