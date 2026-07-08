import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import { PublicLayout } from '../components/layout/PublicLayout';
import { AuthLayout } from '../components/layout/AuthLayout';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ErrorLayout } from '../components/layout/ErrorLayout';

// Guards
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import { PublicRoute } from '../components/layout/PublicRoute';

// Skeletons
import { SuspenseLoader } from '../components/ui/Skeletons';

// Lazy Pages
const LandingPage = lazy(() => import('../pages/LandingPage').then((m) => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import('../pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('../pages/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })));
const EmailVerificationPage = lazy(() => import('../pages/EmailVerificationPage').then((m) => ({ default: m.EmailVerificationPage })));
const DashboardPage = lazy(() => import('../pages/Dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const PlaceholderPage = lazy(() => import('../pages/PlaceholderPage').then((m) => ({ default: m.PlaceholderPage })));
const ThreatFeedPage = lazy(() => import('../pages/Threats/ThreatFeedPage').then((m) => ({ default: m.ThreatFeedPage })));
const ThreatDetailsPage = lazy(() => import('../pages/Threats/ThreatDetailsPage').then((m) => ({ default: m.ThreatDetailsPage })));
const CVEExplorerPage = lazy(() => import('../pages/CVE/CVEExplorerPage').then((m) => ({ default: m.CVEExplorerPage })));
const CVEDetailsPage = lazy(() => import('../pages/CVE/CVEDetailsPage').then((m) => ({ default: m.CVEDetailsPage })));
const IOCExplorerPage = lazy(() => import('../pages/IOC/IOCExplorerPage').then((m) => ({ default: m.IOCExplorerPage })));
const IOCDetailsPage = lazy(() => import('../pages/IOC/IOCDetailsPage').then((m) => ({ default: m.IOCDetailsPage })));
const MalwareDashboardPage = lazy(() => import('../pages/Malware/MalwareDashboardPage').then((m) => ({ default: m.MalwareDashboardPage })));
const MalwareDetailsPage = lazy(() => import('../pages/Malware/MalwareDetailsPage').then((m) => ({ default: m.MalwareDetailsPage })));
const RansomwareDashboardPage = lazy(() => import('../pages/Ransomware/RansomwareDashboardPage').then((m) => ({ default: m.RansomwareDashboardPage })));
const CampaignDetailsPage = lazy(() => import('../pages/Ransomware/CampaignDetailsPage').then((m) => ({ default: m.CampaignDetailsPage })));
const PhishingDashboardPage = lazy(() => import('../pages/Phishing/PhishingDashboardPage').then((m) => ({ default: m.PhishingDashboardPage })));
const ThreatCorrelationPage = lazy(() => import('../pages/ThreatCorrelation/ThreatCorrelationPage').then((m) => ({ default: m.ThreatCorrelationPage })));
const AIAssistantPage = lazy(() => import('../pages/AIAssistant/AIAssistantPage').then((m) => ({ default: m.AIAssistantPage })));
const ReportsDashboardPage = lazy(() => import('../pages/Reports/ReportsDashboardPage').then((m) => ({ default: m.ReportsDashboardPage })));
const ReportPreviewPage = lazy(() => import('../pages/Reports/ReportPreviewPage').then((m) => ({ default: m.ReportPreviewPage })));
const NotificationCenterPage = lazy(() => import('../pages/Notifications/NotificationCenterPage').then((m) => ({ default: m.NotificationCenterPage })));
const UserProfilePage = lazy(() => import('../pages/Profile/UserProfilePage').then((m) => ({ default: m.UserProfilePage })));
const SettingsPage = lazy(() => import('../pages/Settings/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const AdminDashboardPage = lazy(() => import('../pages/Admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })));
const UserManagementPage = lazy(() => import('../pages/Admin/UserManagementPage').then((m) => ({ default: m.UserManagementPage })));
const RoleManagementPage = lazy(() => import('../pages/Admin/RoleManagementPage').then((m) => ({ default: m.RoleManagementPage })));
const SchedulerDashboardPage = lazy(() => import('../pages/Admin/SchedulerDashboardPage').then((m) => ({ default: m.SchedulerDashboardPage })));
const AIConfigurationPage = lazy(() => import('../pages/Admin/AIConfigurationPage').then((m) => ({ default: m.AIConfigurationPage })));
const SystemMonitoringPage = lazy(() => import('../pages/Admin/SystemMonitoringPage').then((m) => ({ default: m.SystemMonitoringPage })));
const AuditLogsPage = lazy(() => import('../pages/Admin/AuditLogsPage').then((m) => ({ default: m.AuditLogsPage })));

// Error Pages
const NotFoundPage = lazy(() => import('../pages/ErrorPages/ErrorPages').then((m) => ({ default: m.NotFoundPage })));
const ForbiddenPage = lazy(() => import('../pages/ErrorPages/ErrorPages').then((m) => ({ default: m.ForbiddenPage })));
const ServerErrorPage = lazy(() => import('../pages/ErrorPages/ErrorPages').then((m) => ({ default: m.ServerErrorPage })));

export const router = createBrowserRouter([
  // Public Landing Pages
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <LandingPage />
          </Suspense>
        ),
      },
    ],
  },
  // Auth Pages
  {
    path: '/',
    element: (
      <PublicRoute>
        <AuthLayout />
      </PublicRoute>
    ),
    children: [
      {
        path: 'login',
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <LoginPage />
          </Suspense>
        ),
      },
      {
        path: 'register',
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <RegisterPage />
          </Suspense>
        ),
      },
      {
        path: 'forgot-password',
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <ForgotPasswordPage />
          </Suspense>
        ),
      },
      {
        path: 'reset-password',
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <ResetPasswordPage />
          </Suspense>
        ),
      },
      {
        path: 'verify-email',
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <EmailVerificationPage />
          </Suspense>
        ),
      },
    ],
  },
  // Protected Console / Dashboard Modules
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <DashboardPage />
          </Suspense>
        ),
      },
      {
        path: 'threat-feed',
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <ThreatFeedPage />
          </Suspense>
        ),
      },
      {
        path: 'threat-feed/:id',
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <ThreatDetailsPage />
          </Suspense>
        ),
      },
      {
        path: 'threat-search',
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <PlaceholderPage title="Adversary & Threat Search" description="Global full-text querying across historical intelligence logs and vector knowledge bases." />
          </Suspense>
        ),
      },
      {
        path: 'cve-explorer',
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <CVEExplorerPage />
          </Suspense>
        ),
      },
      {
        path: 'cve-explorer/:cveId',
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <CVEDetailsPage />
          </Suspense>
        ),
      },
      {
        path: 'ioc-explorer',
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <IOCExplorerPage />
          </Suspense>
        ),
      },
      {
        path: 'ioc-explorer/:iocId',
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <IOCDetailsPage />
          </Suspense>
        ),
      },
      {
        path: 'malware',
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <MalwareDashboardPage />
          </Suspense>
        ),
      },
      {
        path: 'malware/:malwareId',
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <MalwareDetailsPage />
          </Suspense>
        ),
      },
      {
        path: 'ransomware',
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <RansomwareDashboardPage />
          </Suspense>
        ),
      },
      {
        path: 'ransomware/:campaignId',
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <CampaignDetailsPage />
          </Suspense>
        ),
      },
      {
        path: 'phishing',
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <PhishingDashboardPage />
          </Suspense>
        ),
      },
      {
        path: 'threat-correlation',
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <ThreatCorrelationPage />
          </Suspense>
        ),
      },
      {
        path: 'threat-actors',
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <PlaceholderPage title="Threat Actor Profile Catalog" description="TTP mapping, attribution indicators, and historical logs of hacker syndicates." />
          </Suspense>
        ),
      },
      {
        path: 'mitre-attack',
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <PlaceholderPage title="MITRE ATT&CK Matrix Navigator" description="Overlay active threat patterns on standard defense matrices." />
          </Suspense>
        ),
      },
      {
        path: 'ai-assistant',
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <AIAssistantPage />
          </Suspense>
        ),
      },
      {
        path: 'reports',
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <ReportsDashboardPage />
          </Suspense>
        ),
      },
      {
        path: 'reports/:reportId',
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <ReportPreviewPage />
          </Suspense>
        ),
      },
      {
        path: 'notifications',
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <NotificationCenterPage />
          </Suspense>
        ),
      },
      {
        // FDD §6 alias: /alerts → /notifications (consolidated Notification Center)
        path: 'alerts',
        element: <Navigate to="/notifications" replace />,
      },
      {
        path: 'profile',
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <UserProfilePage />
          </Suspense>
        ),
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <SettingsPage />
          </Suspense>
        ),
      },
      {
        path: 'admin',
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <AdminDashboardPage />
          </Suspense>
        ),
      },
      {
        path: 'user-management',
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <UserManagementPage />
          </Suspense>
        ),
      },
      {
        path: 'role-management',
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <RoleManagementPage />
          </Suspense>
        ),
      },
      {
        path: 'scheduler',
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <SchedulerDashboardPage />
          </Suspense>
        ),
      },
      {
        path: 'ai-configuration',
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <AIConfigurationPage />
          </Suspense>
        ),
      },
      {
        path: 'monitoring',
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <SystemMonitoringPage />
          </Suspense>
        ),
      },
      {
        path: 'audit-logs',
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <AuditLogsPage />
          </Suspense>
        ),
      },
    ],
  },
  // Error Pages
  {
    path: '/',
    element: <ErrorLayout />,
    children: [
      {
        path: '403',
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <ForbiddenPage />
          </Suspense>
        ),
      },
      {
        path: '500',
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <ServerErrorPage />
          </Suspense>
        ),
      },
      {
        path: '*',
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <NotFoundPage />
          </Suspense>
        ),
      },
    ],
  },
]);
