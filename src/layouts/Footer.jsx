import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="global-footer">
            <div className="footer-content">
                <div className="footer-logo-section">
                    <img src="/assets/ATS_Logo.png" alt="ATS Group Reference" className="footer-logo" />
                    <span>ATS Group</span>
                </div>
                <div className="footer-copyright">
                    Mercedes-Benz India 2025 © ATS Conveyors
                </div>
            </div>
        </footer>
    );
};

export default Footer;
