import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Monitor, TriangleAlert, Shield, FileText, ChevronRight, Menu, Wrench } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isOpen, toggle }) => {
  const [openMenus, setOpenMenus] = useState({});
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const { currentUser, logActivity } = useAuth(); // Get auth context
  const videoRef = useRef(null);

  const videos = [
    '/assets/videos/video1.mp4',
    '/assets/videos/video2.mp4',
    '/assets/videos/video3.mp4'
  ];

  const handleVideoEnded = () => {
    const nextIndex = (currentVideoIndex + 1) % videos.length;
    setCurrentVideoIndex(nextIndex);
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(error => console.log("Video play failed", error));
    }
  }, [currentVideoIndex]);

  const toggleMenu = (menu) => {
    // If sidebar is collapsed, expanding a menu should probably expand the sidebar too
    if (!isOpen) toggle();

    setOpenMenus(prevState => ({
      ...prevState,
      [menu]: !prevState[menu]
    }));
  };

  const handleNavClick = (section, item) => {
    if (currentUser) {
      logActivity(currentUser, 'Navigate', `Visited ${section} - ${item}`);
    }
  };

  // ... (toggleMenu logic remains same)

  return (
    <>
      {/* Hamburger Menu Trigger - Visible when sidebar is collapsed */}
      {!isOpen && (
        <button className="sidebar-toggle-btn" onClick={toggle}>
          <Menu className="menu-icon" />
        </button>
      )}

      <div className={`sidebar ${isOpen ? 'expanded' : 'collapsed'}`}>

        {/* Toggle button inside sidebar to close it */}
        {isOpen && (
          <button className="sidebar-close-btn" onClick={toggle}>
            <span className="close-icon">×</span>
          </button>
        )}

        {/* Video Background */}
        <div className="sidebar-video-container">
          <video
            ref={videoRef}
            className="sidebar-video"
            autoPlay
            muted
            playsInline
            onEnded={handleVideoEnded}
          >
            <source src={videos[currentVideoIndex]} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="sidebar-glass-overlay"></div>
        </div>

        <div className="sidebar-content">
          <div className="logo-container">
            <img src="/assets/MercBenzLogo.png" alt="Mercedes-Benz Logo" className="merged-logo" />
            <h3>Mercedes-Benz</h3>
          </div>

          <nav>
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Home className="nav-icon" />
              <span>HOME</span>
            </NavLink>

            {/* ANDON Menu */}
            <div className={`nav-link dropdown-toggle ${openMenus.andon ? 'active' : ''}`} onClick={() => toggleMenu('andon')}>
              <Monitor className="nav-icon" />
              <span>ANDON</span>
              <ChevronRight className={`dropdown-arrow ${openMenus.andon ? 'open' : ''}`} />
            </div>
            <div className={`submenu ${openMenus.andon ? 'open' : ''}`}>
              <NavLink to="/andon/trim4" onClick={() => handleNavClick('Andon', 'Trim 4')}>Trim 4</NavLink>
              <NavLink to="/andon/cart-trim" onClick={() => handleNavClick('Andon', 'Shopping Cart Trim')}>Shopping Cart Trim</NavLink>
              <NavLink to="/andon/trim5" onClick={() => handleNavClick('Andon', 'Trim 5')}>Trim 5</NavLink>
              <NavLink to="/andon/cart-mech" onClick={() => handleNavClick('Andon', 'Shopping Cart Mech')}>Shopping Cart Mech</NavLink>
              <NavLink to="/andon/mech3" onClick={() => handleNavClick('Andon', 'Mech 3')}>Mech 3</NavLink>
              <NavLink to="/andon/mech4" onClick={() => handleNavClick('Andon', 'Mech 4')}>Mech 4</NavLink>
              <NavLink to="/andon/finish1" onClick={() => handleNavClick('Andon', 'Finish 1')}>Finish 1</NavLink>
              <NavLink to="/andon/finish2" onClick={() => handleNavClick('Andon', 'Finish 2')}>Finish 2</NavLink>
            </div>

            {/* BREAKDOWN Menu */}
            <div className={`nav-link dropdown-toggle ${openMenus.breakdown ? 'active' : ''}`} onClick={() => toggleMenu('breakdown')}>
              <TriangleAlert className="nav-icon" />
              <span>BREAKDOWN</span>
              <ChevronRight className={`dropdown-arrow ${openMenus.breakdown ? 'open' : ''}`} />
            </div>
            <div className={`submenu ${openMenus.breakdown ? 'open' : ''}`}>
              <NavLink to="/breakdown/trim4" onClick={() => handleNavClick('Breakdown', 'TRIM-4')}>TRIM-4</NavLink>
              <NavLink to="/breakdown/trim5" onClick={() => handleNavClick('Breakdown', 'TRIM-5')}>TRIM-5</NavLink>
              <NavLink to="/breakdown/cart-trim" onClick={() => handleNavClick('Breakdown', 'TRIM-6')}>TRIM-6</NavLink>
              <NavLink to="/breakdown/mech3" onClick={() => handleNavClick('Breakdown', 'MECH-3')}>MECH-3</NavLink>
              <NavLink to="/breakdown/mech4" onClick={() => handleNavClick('Breakdown', 'MECH-4')}>MECH-4</NavLink>
              <NavLink to="/breakdown/cart-mech" onClick={() => handleNavClick('Breakdown', 'MECH-5')}>MECH-5</NavLink>
              <NavLink to="/breakdown/finish1" onClick={() => handleNavClick('Breakdown', 'FINISH-1')}>FINISH-1</NavLink>
              <NavLink to="/breakdown/finish2" onClick={() => handleNavClick('Breakdown', 'FINISH-2')}>FINISH-2</NavLink>
            </div>

            {/* MANAGEMENT Menu */}
            <div className={`nav-link dropdown-toggle ${openMenus.management ? 'active' : ''}`} onClick={() => toggleMenu('management')}>
              <Wrench className="nav-icon" />
              <span>MANAGEMENT</span>
              <ChevronRight className={`dropdown-arrow ${openMenus.management ? 'open' : ''}`} />
            </div>
            <div className={`submenu ${openMenus.management ? 'open' : ''}`}>
              <NavLink to="/management/shift" onClick={() => handleNavClick('Management', 'Manage Shift')}>Manage Shift</NavLink>
              <NavLink to="/management/line" onClick={() => handleNavClick('Management', 'Manage Line')}>Manage Line</NavLink>
              <NavLink to="/management/station" onClick={() => handleNavClick('Management', 'Manage Station')}>Manage Station</NavLink>
              <NavLink to="/management/npd" onClick={() => handleNavClick('Management', 'Manage NPD Days')}>Manage NPD Days</NavLink>
              <NavLink to="/management/target" onClick={() => handleNavClick('Management', 'Manage Line Shift Target')}>Manage Line Shift Target</NavLink>
              <NavLink to="/management/actual" onClick={() => handleNavClick('Management', 'Manage Actual')}>Manage Actual</NavLink>
              <NavLink to="/management/lost-time" onClick={() => handleNavClick('Management', 'Manage Shift Lost Time')}>Manage Shift Lost Time</NavLink>
              <NavLink to="/management/breakdown" onClick={() => handleNavClick('Management', 'Manage Breakdown Details')}>Manage Breakdown Details</NavLink>
            </div>

            {/* AUTHORIZATION Menu - ADMIN ONLY */}
            {currentUser?.role === 'admin' && (
              <>
                <div className={`nav-link dropdown-toggle ${openMenus.auth ? 'active' : ''}`} onClick={() => toggleMenu('auth')}>
                  <Shield className="nav-icon" />
                  <span>AUTHORIZATION</span>
                  <ChevronRight className={`dropdown-arrow ${openMenus.auth ? 'open' : ''}`} />
                </div>
                <div className={`submenu ${openMenus.auth ? 'open' : ''}`}>
                  <NavLink to="/auth/access-matrix" onClick={() => handleNavClick('Authorization', 'Access Matrix')}>Access Matrix</NavLink>
                  <NavLink to="/auth/users" onClick={() => handleNavClick('Authorization', 'Manage Users')}>Manage Users</NavLink>
                  <NavLink to="/auth/roles" onClick={() => handleNavClick('Authorization', 'Manage Roles')}>Manage Roles</NavLink>
                </div>
              </>
            )}

            {/* REPORTS Menu */}
            <div className={`nav-link dropdown-toggle ${openMenus.reports ? 'active' : ''}`} onClick={() => toggleMenu('reports')}>
              <FileText className="nav-icon" />
              <span>REPORTS</span>
              <ChevronRight className={`dropdown-arrow ${openMenus.reports ? 'open' : ''}`} />
            </div>
            <div className={`submenu ${openMenus.reports ? 'open' : ''}`}>
              <NavLink to="/reports/infeed" onClick={() => handleNavClick('Reports', 'Infeed Report')}>Infeed Report</NavLink>
              {/* Audit Trail - Admin Only */}
              {currentUser?.role === 'admin' && (
                <NavLink to="/reports/audit-trail" onClick={() => handleNavClick('Reports', 'Audit Trail')}>Audit Trail</NavLink>
              )}
              <NavLink to="/stakeholder" onClick={() => handleNavClick('Reports', 'Stakeholder')}>Stakeholder</NavLink>
              <NavLink to="/stakeholder-reason" onClick={() => handleNavClick('Reports', 'Stakeholder Reason')}>Stakeholder Reason</NavLink>
            </div>

          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
