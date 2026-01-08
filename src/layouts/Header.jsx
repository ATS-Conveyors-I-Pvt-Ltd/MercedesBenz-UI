import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.jpeg';
import './Header.css';

const Header = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    };

    const [showDropdown, setShowDropdown] = useState(false);
    const { currentUser, logout } = useAuth();

    // Fallback for user name if not available
    const userName = currentUser?.name || currentUser?.username || 'User';

    const handleLogout = () => {
        logout();
    };

    return (
        <div className="main-header">
            <div className="header-left" onClick={() => window.location.href = '/'} title="Go to Dashboard">
                <img src="/assets/MercBenzLogo.png" alt="MB Logo" className="logo-mini" />
                <span>Mercedes-Benz India Digital Assembly Platform</span>
            </div>

            <div className="header-right">
                <div className="header-clock">
                    <div className="live-indicator">
                        <div className="blinking-dot"></div>
                        Live
                    </div>
                    <div id="live-time">{formatTime(time)}</div>
                    <div className="time-tooltip">
                        <div className="tooltip-date">
                            {time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                        <div className="tooltip-time">{formatTime(time)}</div>
                    </div>
                </div>

                <div className="user-profile" onClick={() => setShowDropdown(!showDropdown)}>
                    <span className="user-greeting">Hi, {userName}</span>
                    {showDropdown && (
                        <div className="user-dropdown">
                            <button onClick={handleLogout} className="logout-btn">
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Header;
