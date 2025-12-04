import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import AttendancePage from './pages/AttendancePage';
import DashboardPage from './pages/DashboardPage';
import Layout from './components/Layout';
import ProfilePage from './pages/ProfilePage';
import AbsenceRequestPage from './pages/AbsenceRequestPage';
import AdminAbsencePage from './pages/AdminAbsencePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminEmployeesPage from './pages/AdminEmployeesPage';
import AdminLocationsPage from './pages/AdminLocationsPage';
import AdminPendingUsersPage from './pages/AdminPendingUsersPage';
import AdminSchedulePage from './pages/AdminSchedulePage';

import EmployeeSchedulePage from './pages/EmployeeSchedulePage';

import AdminReportsPage from './pages/AdminReportsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/schedule" element={<EmployeeSchedulePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/leave" element={<AbsenceRequestPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/absence" element={<AdminAbsencePage />} />
          <Route path="/admin/employees" element={<AdminEmployeesPage />} />
          <Route path="/admin/locations" element={<AdminLocationsPage />} />
          <Route path="/admin/pending" element={<AdminPendingUsersPage />} />
          <Route path="/admin/schedule" element={<AdminSchedulePage />} />
          <Route path="/admin/reports" element={<AdminReportsPage />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
