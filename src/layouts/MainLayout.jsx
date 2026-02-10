import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import './MainLayout.css';
import Footer from './Footer';

const MainLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default closed

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="app-container">
            <Sidebar isOpen={isSidebarOpen} toggle={toggleSidebar} />
            <div className={`main-content-wrapper ${!isSidebarOpen ? 'full-width' : ''}`}>
                <Header />
                <main className="content-area">
                    <Outlet />
                </main>
                <Footer isSidebarOpen={isSidebarOpen} />
            </div>
        </div>
    );
};

export default MainLayout;
