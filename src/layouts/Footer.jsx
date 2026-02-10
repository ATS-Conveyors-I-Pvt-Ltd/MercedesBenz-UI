import React from 'react';
import './Footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="global-footer">
            <div className="footer-content">
                <div className="footer-logo-section">
                    <img src="/assets/ATS_Logo.png" alt="ATS Group Reference" className="footer-logo" />
                    <span>Developed by ATS Group</span>
                </div>
                <div className="footer-copyright">
                    Mercedes-Benz India {currentYear} © ATS Conveyors
                </div>
                <div className="footer-tech">
                    Digital Assembly Platform v1.0
                </div>
            </div>
        </footer>
    );
};

export default Footer;
