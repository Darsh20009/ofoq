import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { useState, useCallback, useEffect } from "react";
import { AnimatePresence } from "framer-motion";

// Layouts
import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";

// Public Pages
import HomePage from "./pages/public/HomePage";
import ServicesPage from "./pages/public/ServicesPage";
import AboutPage from "./pages/public/AboutPage";
import BlogPage from "./pages/public/BlogPage";
import ContactPage from "./pages/public/ContactPage";

// Admin Pages
import LoginPage from "./pages/admin/LoginPage";
import OAuthCallbackPage from "./pages/admin/OAuthCallbackPage";
import DashboardPage from "./pages/admin/DashboardPage";
import LeadsPage from "./pages/admin/crm/LeadsPage";
import CustomersPage from "./pages/admin/crm/CustomersPage";
import ProjectsPage from "./pages/admin/projects/ProjectsPage";
import InvoicesPage from "./pages/admin/invoices/InvoicesPage";
import UsersPage from "./pages/admin/users/UsersPage";
import CmsPage from "./pages/admin/cms/CmsPage";
import SettingsPage from "./pages/admin/settings/SettingsPage";
import ProfilePage from "./pages/admin/ProfilePage";
import ContractsPage from "./pages/admin/contracts/ContractsPage";
import EmployeeCardPage from "./pages/admin/employee/EmployeeCardPage";
import EmployeeDashboardPage from "./pages/admin/employee/EmployeeDashboardPage";

// Page Transition Loader
import PageLoader from "./components/PageLoader";

function RequireAuth({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
}

function RequireGuest({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Navigate to="/admin" replace /> : children;
}

export default function App() {
  const location = useLocation();
  const [showLoader, setShowLoader] = useState(false);
  const [prevPath, setPrevPath] = useState(location.pathname);

  // أظهر اللودر عند تغيّر المسار — ما عدا أول تحميل
  useEffect(() => {
    if (location.pathname !== prevPath) {
      setShowLoader(true);
      setPrevPath(location.pathname);
    }
  }, [location.pathname]); // eslint-disable-line

  const handleLoaderDone = useCallback(() => {
    setShowLoader(false);
  }, []);

  return (
    <>
      {/* ── Page Transition Loader ────────── */}
      <AnimatePresence>
        {showLoader && (
          <PageLoader key={location.pathname} onDone={handleLoaderDone} />
        )}
      </AnimatePresence>

      <Routes>
        {/* ── Public Website ───────────────────────────── */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>

        {/* ── Admin Auth ───────────────────────────────── */}
        <Route
          path="/admin/login"
          element={
            <RequireGuest>
              <LoginPage />
            </RequireGuest>
          }
        />
        <Route path="/admin/oauth/callback" element={<OAuthCallbackPage />} />

        {/* ── Admin Dashboard ──────────────────────────── */}
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="crm/leads" element={<LeadsPage />} />
          <Route path="crm/customers" element={<CustomersPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="cms" element={<CmsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="contracts" element={<ContractsPage />} />
          <Route path="employee/card" element={<EmployeeCardPage />} />
          <Route path="employee/dashboard" element={<EmployeeDashboardPage />} />
        </Route>

        {/* ── Fallback ─────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
