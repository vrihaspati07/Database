import { useState, useEffect } from 'react';
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
import { DashboardContainer } from './pages/DashboardContainer';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState<'home' | 'login' | 'signup' | 'verify-email' | 'forgot-password' | 'reset-password' | 'dashboard'>('home');
  const [dashboardTab, setDashboardTab] = useState<string>('overview');
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  // Sync with browser URL
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\//, '');
      if (path === 'login') setCurrentPage('login');
      else if (path === 'signup') setCurrentPage('signup');
      else if (path === 'verify-email') setCurrentPage('verify-email');
      else if (path === 'forgot-password') setCurrentPage('forgot-password');
      else if (path === 'reset-password') setCurrentPage('reset-password');
      else if (path === 'dashboard' || path.startsWith('dashboard/')) {
        setCurrentPage('dashboard');
        const parts = path.split('/');
        if (parts[1]) setDashboardTab(parts[1]);
      } else {
        setCurrentPage('home');
      }
    };

    // Initial check
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
    else if (page === 'dashboard') path = '/dashboard/overview';

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
    return <DashboardContainer onNavigate={navigateTo} initialTab={dashboardTab} />;
  }

  // Default: Landing Page
  return (
    <div className="min-h-screen font-sans bg-[#FFFFFF] text-[#0F172A] selection:bg-[#1E3A8A]/15 selection:text-[#1E3A8A]">
      
      {/* 1. Sticky 72px Navbar */}
      <Navbar 
        onOpenLogin={() => navigateTo(isAuthenticated ? 'dashboard' : 'login')}
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
        <Pricing />

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


