import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/Layout/ProtectedRoute";
import Layout from "./components/Layout/Layout";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import AttendancePage from "./pages/AttendancePage";
import LeavePage from "./pages/LeavePage";
import PayrollPage from "./pages/PayrollPage";

function Protected({ children }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route path="/dashboard" element={<Protected><DashboardPage /></Protected>} />
        <Route path="/profile" element={<Protected><ProfilePage /></Protected>} />
        <Route path="/profile/:id" element={<Protected><ProfilePage /></Protected>} />
        <Route path="/attendance" element={<Protected><AttendancePage /></Protected>} />
        <Route path="/leave" element={<Protected><LeavePage /></Protected>} />
        <Route path="/payroll" element={<Protected><PayrollPage /></Protected>} />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}
