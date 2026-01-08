import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import LoadingScreen from './layouts/LoadingScreen';
import Dashboard from './pages/Dashboard/Dashboard';
import AndonOverview from './pages/AndonOverview';

import Finish1Dashboard from './pages/Andon/Finish1Dashboard';
import Trim4 from './pages/Andon/Trim4';
import ShoppingCartTrim from './pages/Andon/ShoppingCartTrim';
import Trim5 from './pages/Andon/Trim5';
import ShoppingCartMech from './pages/Andon/ShoppingCartMech';
import Mech3 from './pages/Andon/Mech3';
import Mech4 from './pages/Andon/Mech4';
import Finish2 from './pages/Andon/Finish2';

import Trim4Breakdown from './pages/Breakdown/Trim4Breakdown';
import ShoppingCartTrimBreakdown from './pages/Breakdown/ShoppingCartTrimBreakdown';
import Trim5Breakdown from './pages/Breakdown/Trim5Breakdown';
import ShoppingCartMechBreakdown from './pages/Breakdown/ShoppingCartMechBreakdown';
import Mech3Breakdown from './pages/Breakdown/Mech3Breakdown';
import Mech4Breakdown from './pages/Breakdown/Mech4Breakdown';
import Finish1Breakdown from './pages/Breakdown/Finish1Breakdown';
import Finish2Breakdown from './pages/Breakdown/Finish2Breakdown';

import ShiftManagement from './pages/Management/ShiftManagement';
import LineManagement from './pages/Management/LineManagement';
import StationManagement from './pages/Management/StationManagement';
import NPDManagement from './pages/Management/NPDManagement';
import TargetManagement from './pages/Management/TargetManagement';
import ActualManagement from './pages/Management/ActualManagement';
import LostTimeManagement from './pages/Management/LostTimeManagement';
import BreakdownManagement from './pages/Management/BreakdownManagement';

import ScreenPlaceholder from './pages/ScreenPlaceholder';
import AccessMatrix from './pages/Auth/AccessMatrix';
import AuditTrail from './pages/Reports/AuditTrail';
import StakeholderReason from './pages/Stakeholder/StakeholderReason';

import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Inner App to use Auth Hook
const AppContent = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();
  const isPublicRoute = window.location.pathname === '/login' || window.location.pathname === '/signup';

  // If still loading initial state, logic is simpler inside 
  if (isLoading && !isPublicRoute) {
    // Only show video loading if actually entering the app
    return <LoadingScreen onComplete={() => setIsLoading(false)} />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />

          {/* Andon Routes */}
          <Route path="andon/trim4" element={<Trim4 />} />
          <Route path="andon/cart-trim" element={<ShoppingCartTrim />} />
          <Route path="andon/trim5" element={<Trim5 />} />
          <Route path="andon/cart-mech" element={<ShoppingCartMech />} />
          <Route path="andon/mech3" element={<Mech3 />} />
          <Route path="andon/mech4" element={<Mech4 />} />
          <Route path="andon/finish1" element={<Finish1Dashboard />} />
          <Route path="andon/finish2" element={<Finish2 />} />

          {/* Breakdown Routes */}
          <Route path="breakdown/trim4" element={<Trim4Breakdown />} />
          <Route path="breakdown/cart-trim" element={<ShoppingCartTrimBreakdown />} />
          <Route path="breakdown/trim5" element={<Trim5Breakdown />} />
          <Route path="breakdown/cart-mech" element={<ShoppingCartMechBreakdown />} />
          <Route path="breakdown/mech3" element={<Mech3Breakdown />} />
          <Route path="breakdown/mech4" element={<Mech4Breakdown />} />
          <Route path="breakdown/finish1" element={<Finish1Breakdown />} />
          <Route path="breakdown/finish2" element={<Finish2Breakdown />} />

          {/* Management Routes */}
          <Route path="management/shift" element={<ShiftManagement />} />
          <Route path="management/line" element={<LineManagement />} />
          <Route path="management/station" element={<StationManagement />} />
          <Route path="management/npd" element={<NPDManagement />} />
          <Route path="management/target" element={<TargetManagement />} />
          <Route path="management/actual" element={<ActualManagement />} />
          <Route path="management/lost-time" element={<LostTimeManagement />} />
          <Route path="management/breakdown" element={<BreakdownManagement />} />

          {/* Master Routes */}
          <Route path="master/users" element={<ScreenPlaceholder title="Manage Users (Master)" />} />
          <Route path="master/roles" element={<ScreenPlaceholder title="Manage Roles (Master)" />} />

          {/* Authorization Routes */}
          <Route path="auth/access-matrix" element={<AccessMatrix />} />
          <Route path="auth/users" element={<ScreenPlaceholder title="Manage Users (Auth)" />} />
          <Route path="auth/roles" element={<ScreenPlaceholder title="Manage Roles (Auth)" />} />

          {/* Reports Routes */}
          <Route path="reports/infeed" element={<ScreenPlaceholder title="Infeed Report" />} />
          <Route path="reports/audit-trail" element={<AuditTrail />} />

          <Route path="stakeholder" element={<ScreenPlaceholder title="Stakeholder" />} />
          <Route path="stakeholder-reason" element={<StakeholderReason />} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
