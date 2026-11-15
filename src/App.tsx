import { useState, useEffect, lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Stats } from './components/Stats';
import { Features } from './components/Features';
import { CodeSection } from './components/CodeSection';
import { Pricing } from './components/Pricing';
import { Testimonials } from './components/Testimonials';
import { FAQ } from './components/FAQ';
import { Footer } from './components/Footer';
import { DemoModal } from './components/DemoModal';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { DashboardPlaceholder } from './pages/DashboardPlaceholder';
import { DashboardContainer } from './pages/DashboardContainer';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { NotFoundPage } from './pages/NotFoundPage';
import { AcceptInvitePage } from './pages/AcceptInvitePage';

// Lazy load admin bundle to keep main website bundle separated and protected
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));

function AppContent() {
  const { isAuthenticated, user } = useAuth();
  const [currentPage, setCurrentPage] = useState<
    'home' | 'login' | 'signup' | 'verify-email' | 'forgot-password' | 'reset-password' | 'dashboard' | 'console' | 'control-x7k9' | 'accept-invite' | 'not-found'
  >('home');
  const [dashboardTab, setDashboardTab] = useState<string>('overview');
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return sessionStorage.getItem('hind_admin_token') || localStorage.getItem('hind_admin_token') || null;
  });

  // Sync with browser URL
  useEffect(() => {
    const handlePopState = () => {
      // Strip leading and trailing slashes for robust matching
      const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
      if (path === 'login') setCurrentPage('login');
      else if (path === 'signup') setCurrentPage('signup');
      else if (path === 'verify-email') setCurrentPage('verify-email');
      else if (path === 'forgot-password') setCurrentPage('forgot-password');
      else if (path === 'reset-password') setCurrentPage('reset-password');
      else if (path === 'dashboard' || path.startsWith('dashboard/')) {
        setCurrentPage('dashboard');
        const parts = path.split('/');
        if (parts[1]) setDashboardTab(parts[1]);
      } else if (path === 'console') {
        setCurrentPage('console');
      } else if (path === 'control-x7k9' || path.startsWith('control-x7k9')) {
        setCurrentPage('control-x7k9');
      } else if (path === 'accept-invite' || path.startsWith('accept-invite')) {
        setCurrentPage('accept-invite');
      } else if (path === '' || path === '/') {
        setCurrentPage('home');
      } else {
        setCurrentPage('not-found');
      }
    };

    handlePopState();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (page: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    let path = '/';
    if (page === 'login') path = '/login';
    else if (page === 'signup') path = '/signup';
    else if (page === 'verify-email') path = '/verify-email';
    else if (page === 'forgot-password') path = '/forgot-password';
    else if (page === 'reset-password') path = '/reset-password';
    else if (page === 'dashboard') path = '/dashboard';
    else if (page === 'console') path = '/dashboard/overview';
    else if (page === 'control-x7k9') path = '/control-x7k9';
    else if (page === 'accept-invite') path = '/accept-invite';

    window.history.pushState({}, '', path);
    setCurrentPage(page as any);
  };

  // Route Renderers
  if (currentPage === 'login') {
    return <LoginPage onNavigate={navigateTo} />;
  }

  if (currentPage === 'signup') {
    return <SignupPage onNavigate={navigateTo} />;
  }

  if (currentPage === 'verify-email') {
    return <VerifyEmailPage onNavigate={navigateTo} />;
  }

  if (currentPage === 'forgot-password') {
    return <ForgotPasswordPage onNavigate={navigateTo} />;
  }

  if (currentPage === 'reset-password') {
    return <ResetPasswordPage onNavigate={navigateTo} />;
  }

  if (currentPage === 'dashboard') {
    return (
      <ProtectedRoute onNavigate={navigateTo}>
        <DashboardPlaceholder 
          onNavigate={navigateTo} 
          onOpenFullConsole={() => setCurrentPage('console')} 
        />
      </ProtectedRoute>
    );
  }

  if (currentPage === 'console') {
    return (
      <ProtectedRoute onNavigate={navigateTo}>
        <DashboardContainer onNavigate={navigateTo} initialTab={dashboardTab} />
      </ProtectedRoute>
    );
  }

  // Secret Sovereign Admin Route (Cloaked under genuine 404 for unauthorized visitors)
  if (currentPage === 'control-x7k9') {
    if (adminToken) {
      return (
        <Suspense
          fallback={
            <div className="min-h-screen bg-[#070B14] text-white flex flex-col items-center justify-center space-y-3 font-mono">
              <div className="w-8 h-8 border-2 border-[#38BDF8] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-[#94A3B8]">Decrypting sovereign admin cluster...</span>
            </div>
          }
        >
          <AdminDashboard
            onNavigate={navigateTo}
            onLogout={() => {
              setAdminToken(null);
              sessionStorage.removeItem('hind_admin_token');
              sessionStorage.removeItem('hind_admin_user');
              localStorage.removeItem('hind_admin_token');
              localStorage.removeItem('hind_admin_user');
              navigateTo('home');
            }}
          />
        </Suspense>
      );
    }

    // Unauthenticated: Deliver stealth 404 with secret gatekeeper
    return (
      <NotFoundPage
        onNavigate={navigateTo}
        isSecretRoute={true}
        currentUser={user}
        onAdminAuthenticated={(token) => {
          setAdminToken(token);
        }}
      />
    );
  }

  if (currentPage === 'accept-invite') {
    return <AcceptInvitePage onNavigate={navigateTo} />;
  }

  if (currentPage === 'not-found') {
    return <NotFoundPage onNavigate={navigateTo} />;
  }

  // Default: Landing Page (100% pixel-identical)
  return (
    <div className="min-h-screen font-sans bg-[#FFFFFF] text-[#0F172A] selection:bg-[#1E3A8A]/15 selection:text-[#1E3A8A]">
      {/* 1. Sticky 72px Navbar */}
      <Navbar 
        onOpenLogin={() => navigateTo(isAuthenticated ? 'dashboard' : 'login')}
        onOpenSignup={() => navigateTo(isAuthenticated ? 'dashboard' : 'signup')}
        onOpenDemo={() => setDemoModalOpen(true)}
      />

      {/* Main Content Flow */}
      <main>
        {/* 2. Hero Section */}
        <Hero 
          onOpenDemo={() => setDemoModalOpen(true)} 
        />

        {/* 3. Stats Section (4 columns) */}
        <Stats />

        {/* 4. Features Section (3x2 grid) */}
        <Features />

        {/* 5. Code Section (Add database to your app in minutes) */}
        <CodeSection />

        {/* 6. Pricing Section (3 cards: Free, Pro, Enterprise) */}
        <Pricing 
          onNavigate={navigateTo}
          onOpenSignup={() => navigateTo(isAuthenticated ? 'dashboard' : 'signup')}
          onOpenLogin={() => navigateTo('login')}
        />

        {/* 7. Testimonials Section (3 columns) */}
        <Testimonials />

        {/* 8. FAQ Section (accordion) */}
        <FAQ />
      </main>

      {/* 9. Footer (4 columns) */}
      <Footer />

      {/* Interactive Demo Modal */}
      <DemoModal 
        isOpen={demoModalOpen} 
        onClose={() => setDemoModalOpen(false)} 
      />
    </div>
  );
}

export function App() {
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  }, []);

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
