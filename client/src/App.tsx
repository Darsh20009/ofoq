import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { useSubdomain } from "./hooks/useSubdomain";

// Layouts
import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";
import EmployeeLayout from "./layouts/EmployeeLayout";
import ClientLayout from "./layouts/ClientLayout";

// Employee Portal
import EmployeePortalLoginPage from "./pages/employee/EmployeePortalLoginPage";

// Client Portal
import ClientLoginPage from "./pages/client/ClientLoginPage";
import ClientRegisterPage from "./pages/client/ClientRegisterPage";
import ClientForgotPasswordPage from "./pages/client/ClientForgotPasswordPage";
import ClientResetPasswordPage from "./pages/client/ClientResetPasswordPage";
import ClientDashboardPage from "./pages/client/ClientDashboardPage";
import RequestsListPage from "./pages/client/RequestsListPage";
import RequestDetailsPage from "./pages/client/RequestDetailsPage";
import ServiceRequestPage from "./pages/client/ServiceRequestPage";
import SupportPage from "./pages/client/SupportPage";

// Public Pages
import HomePage from "./pages/public/HomePage";
import ServicesPage from "./pages/public/ServicesPage";
import ServiceCategoryPage from "./pages/public/ServiceCategoryPage";
import ServiceDetailPage from "./pages/public/ServiceDetailPage";
import AboutPage from "./pages/public/AboutPage";
import BlogPage from "./pages/public/BlogPage";
import ContactPage from "./pages/public/ContactPage";
import PackagesPage from "./pages/public/PackagesPage";
import CountriesPage from "./pages/public/CountriesPage";

// Admin Pages
import LoginPage from "./pages/admin/LoginPage";
import ForgotPasswordPage from "./pages/admin/ForgotPasswordPage";
import ResetPasswordPage from "./pages/admin/ResetPasswordPage";
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
import ServiceRequestsPage from "./pages/admin/service-requests/ServiceRequestsPage";
import ServiceRequestDetailPage from "./pages/admin/service-requests/ServiceRequestDetailPage";
import AdminSupportPage from "./pages/admin/support/AdminSupportPage";

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

/* ── Employee Portal Guards ───────────────────────────────────────── */
function RequireEmployeeAuth({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function RequireEmployeeGuest({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Navigate to="/" replace /> : children;
}

/* ── Client Portal Guards ─────────────────────────────────────────── */
function RequireClientAuth({ children }: { children: JSX.Element }) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  if (!isAuthenticated) {
    const returnTo = `${location.pathname}${location.search}`;
    return <Navigate to={`/client/login?redirect=${encodeURIComponent(returnTo)}`} replace />;
  }
  // Allow clients and admins (admins can preview the portal)
  return children;
}

function RequireClientGuest({ children }: { children: JSX.Element }) {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated && user?.role === "client") return <Navigate to="/client/dashboard" replace />;
  return children;
}

export default function App() {
  const location = useLocation();
  const { isEmployee } = useSubdomain();
  const [showLoader, setShowLoader] = useState(false);
  const [loaderPath, setLoaderPath] = useState("");
  const prevPathRef = useRef(location.pathname);
  const navIdRef = useRef(0);

  useEffect(() => {
    if (location.pathname !== prevPathRef.current) {
      prevPathRef.current = location.pathname;
      navIdRef.current += 1;
      setShowLoader(true);
      setLoaderPath(location.pathname);
    }
  }, [location.pathname]);

  const handleLoaderDone = useCallback((capturedId: number) => {
    if (capturedId === navIdRef.current) setShowLoader(false);
  }, []);

  /* ════════════════════════════════════════════════════════════════
     بوابة الموظفين — employee.ofoqhc.com
     مسارات مستقلة تماماً، بدون سايدبار الأدمن
  ════════════════════════════════════════════════════════════════ */
  if (isEmployee) {
    return (
      <>
        <AnimatePresence mode="wait">
          {showLoader && (
            <PageLoader
              key={loaderPath}
              onDone={() => handleLoaderDone(navIdRef.current)}
            />
          )}
        </AnimatePresence>

        <Routes>
          {/* تسجيل الدخول */}
          <Route
            path="/login"
            element={
              <RequireEmployeeGuest>
                <EmployeePortalLoginPage />
              </RequireEmployeeGuest>
            }
          />
          <Route
            path="/admin/login"
            element={
              <RequireEmployeeGuest>
                <EmployeePortalLoginPage />
              </RequireEmployeeGuest>
            }
          />

          {/* بوابة الموظف — تحتاج تسجيل دخول */}
          <Route
            path="/"
            element={
              <RequireEmployeeAuth>
                <EmployeeLayout />
              </RequireEmployeeAuth>
            }
          >
            <Route index element={<EmployeeDashboardPage />} />
            <Route path="card" element={<EmployeeCardPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* أي مسار غير معروف → الرئيسية */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </>
    );
  }

  /* ════════════════════════════════════════════════════════════════
     الموقع الرئيسي + لوحة الأدمن — ofoqhc.com
  ════════════════════════════════════════════════════════════════ */
  return (
    <>
      <AnimatePresence mode="wait">
        {showLoader && (
          <PageLoader
            key={loaderPath}
            onDone={() => handleLoaderDone(navIdRef.current)}
          />
        )}
      </AnimatePresence>

      <Routes>
        {/* ── الموقع العام ─────────────────────────── */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:categorySlug/:serviceSlug" element={<ServiceDetailPage />} />
          <Route path="/services/:categorySlug" element={<ServiceCategoryPage />} />
          <Route path="/packages" element={<PackagesPage />} />
          <Route path="/countries" element={<CountriesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>

        {/* ── تسجيل دخول الأدمن ───────────────────── */}
        <Route
          path="/admin/login"
          element={
            <RequireGuest>
              <LoginPage />
            </RequireGuest>
          }
        />
        <Route path="/admin/oauth/callback" element={<OAuthCallbackPage />} />
        <Route path="/admin/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/admin/reset-password" element={<ResetPasswordPage />} />

        {/* ── لوحة تحكم الأدمن ────────────────────── */}
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
          <Route path="contact" element={<div className="card p-8 text-center text-gray-400">صفحة الاستشارات قيد الإنشاء — Task #9</div>} />
          <Route path="service-requests" element={<ServiceRequestsPage />} />
          <Route path="service-requests/:id" element={<ServiceRequestDetailPage />} />
          <Route path="support" element={<AdminSupportPage />} />
        </Route>

        {/* ── بوابة العملاء — تسجيل دخول/إنشاء حساب ──── */}
        <Route
          path="/client/login"
          element={
            <RequireClientGuest>
              <ClientLoginPage />
            </RequireClientGuest>
          }
        />
        <Route
          path="/client/register"
          element={
            <RequireClientGuest>
              <ClientRegisterPage />
            </RequireClientGuest>
          }
        />
        <Route path="/client/forgot-password" element={<ClientForgotPasswordPage />} />
        <Route path="/client/reset-password"  element={<ClientResetPasswordPage />} />

        {/* ── بوابة العملاء — صفحات محمية ────────────── */}
        <Route
          path="/client"
          element={
            <RequireClientAuth>
              <ClientLayout />
            </RequireClientAuth>
          }
        >
          <Route index element={<Navigate to="/client/dashboard" replace />} />
          <Route path="dashboard" element={<ClientDashboardPage />} />
          <Route path="requests" element={<RequestsListPage />} />
          <Route path="requests/new" element={<ServiceRequestPage />} />
          <Route path="requests/:id" element={<RequestDetailsPage />} />
          <Route path="support" element={<SupportPage />} />
        </Route>

        {/* ── Fallback ─────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
