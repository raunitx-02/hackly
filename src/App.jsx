import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import EventsPage from './pages/EventsPage';
import CreateEventPage from './pages/CreateEventPage';
import EventDetailPage from './pages/EventDetailPage';
import CampusPulseFeedback from './pages/CampusPulseFeedback';
import OrganizerEventDashboard from './pages/OrganizerEventDashboard';
import PublicProjectsGallery from './pages/PublicProjectsGallery';
import TeamsPage from './pages/TeamsPage';
import SubmissionsPage from './pages/SubmissionsPage';
import JudgePage from './pages/JudgePage';
import LeaderboardPage from './pages/LeaderboardPage';
import PricingPage from './pages/PricingPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import SettingsPage from './pages/SettingsPage';
import FeatureDetailPage from './pages/FeatureDetailPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import CareersPage from './pages/CareersPage';
import BlogPage from './pages/BlogPage';
import ChangelogPage from './pages/ChangelogPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import CookiePage from './pages/CookiePage';
import GDPRPage from './pages/GDPRPage';
import Footer from './components/Footer';
import CompleteProfilePage from './pages/CompleteProfilePage';

// Pricing route: only for guests or organizers
function PricingRoute({ children }) {
  const { currentUser, userProfile, loading } = useAuth();
  if (loading) return null;
  if (!currentUser) return children;
  if (userProfile?.role === 'organizer') return children;
  return <Navigate to="/dashboard" replace />;
}

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminOverviewPage from './pages/admin/AdminOverviewPage';
import AdminInstitutionsPage from './pages/admin/AdminInstitutionsPage';
import AdminCampusPartnersPage from './pages/admin/AdminCampusPartnersPage';
import AdminEventsPage from './pages/admin/AdminEventsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminModerationPage from './pages/admin/AdminModerationPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import SponsorCRMPage from './pages/admin/SponsorCRMPage';

// Sponsor Pages
import SponsorLayout from './pages/sponsor/SponsorLayout';
import SponsorDashboard from './pages/sponsor/SponsorDashboard';
import SponsorIntent from './pages/sponsor/SponsorIntent';
import SponsorReports from './pages/sponsor/SponsorReports';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/complete-profile" element={<CompleteProfilePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/events/:id/feedback" element={<CampusPulseFeedback />} />
          <Route path="/events/:id/leaderboard" element={<LeaderboardPage />} />
          <Route path="/events/:id/projects" element={<PublicProjectsGallery />} />
          <Route path="/pricing" element={<PricingRoute><PricingPage /></PricingRoute>} />
          <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccessPage /></ProtectedRoute>} />

          {/* Feature detail pages */}
          <Route path="/features/:slug" element={<FeatureDetailPage />} />

          {/* Company / Footer pages */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/changelog" element={<ChangelogPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/cookies" element={<CookiePage />} />
          <Route path="/gdpr" element={<GDPRPage />} />

          {/* Protected: any logged-in user */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/dashboard/*" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/events/:id/teams" element={<ProtectedRoute><TeamsPage /></ProtectedRoute>} />

          {/* Organizer only */}
          <Route path="/events/create" element={<ProtectedRoute requiredRole="organizer"><CreateEventPage /></ProtectedRoute>} />
          <Route path="/dashboard/events/:id/admin" element={<ProtectedRoute requiredRole="organizer"><OrganizerEventDashboard /></ProtectedRoute>} />

          {/* Participant only */}
          <Route path="/events/:id/submissions" element={<ProtectedRoute requiredRole="participant"><SubmissionsPage /></ProtectedRoute>} />

          {/* Judge only */}
          <Route path="/events/:id/judge" element={<ProtectedRoute requiredRole="judge"><JudgePage /></ProtectedRoute>} />

          {/* Admin routes */}
          <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminOverviewPage />} />
            <Route path="institutions" element={<AdminInstitutionsPage />} />
            <Route path="campus-partners" element={<AdminCampusPartnersPage />} />
            <Route path="events" element={<AdminEventsPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="sponsors" element={<SponsorCRMPage />} />
            <Route path="moderation" element={<AdminModerationPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          {/* Sponsor Routes */}
          <Route path="/sponsor" element={<ProtectedRoute requiredRole="sponsor"><SponsorLayout /></ProtectedRoute>}>
            <Route index element={<SponsorDashboard />} />
            <Route path="intent" element={<SponsorIntent />} />
            <Route path="reports" element={<SponsorReports />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />

        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1E293B',
              color: '#F8FAFC',
              border: '1px solid #334155',
              borderRadius: 12,
              fontSize: 14,
              fontFamily: 'Inter, sans-serif',
            },
            success: { iconTheme: { primary: '#10B981', secondary: '#1E293B' } },
            error: { iconTheme: { primary: '#EF4444', secondary: '#1E293B' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
