import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { LanguageProvider } from '@/lib/i18n';
import { ThemeProvider } from '@/lib/theme';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import SuspendedScreen from '@/components/SuspendedScreen';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import AppLayout from '@/components/layout/AppLayout';
import Home from '@/pages/Home';
import Customers from '@/pages/Customers';
import BillingPage from '@/pages/BillingPage';
import Notifications from '@/pages/Notifications';
import Locations from '@/pages/Locations';
import DailyUsage from '@/pages/DailyUsage';
import SettingsPage from '@/pages/SettingsPage';
import FinancialReport from '@/pages/FinancialReport';
import UsersPage from '@/pages/UsersPage';
import Maintenance from '@/pages/Maintenance';
import HistoryPage from '@/pages/HistoryPage';
import Payments from '@/pages/Payments';
import Expenses from '@/pages/Expenses';
import Qalabka from '@/pages/Qalabka';
import XogtaQoraxda from '@/pages/XogtaQoraxda';
import Alarms from '@/pages/Alarms';
import Shaqaalaha from '@/pages/Shaqaalaha';
import Qiimaynta from '@/pages/Qiimaynta';
import Tixdeliyayaasha from '@/pages/Tixdeliyayaasha';
import Hawlaha from '@/pages/Hawlaha';
import UsageReports from '@/pages/UsageReports';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-zinc-950">
        <div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'configuration_missing') {
      return (
        <div className="fixed inset-0 flex items-center justify-center bg-zinc-950 px-6 text-center">
          <div className="max-w-md space-y-3">
            <h1 className="text-xl font-semibold text-white">Base44 backend is not configured</h1>
            <p className="text-sm text-zinc-400">{authError.message}</p>
          </div>
        </div>
      );
    } else if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'account_suspended') {
      return <SuspendedScreen />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/macaamiisha" element={<Customers />} />
          <Route path="/billing" element={<BillingPage />} />
          <Route path="/warbixin" element={<FinancialReport />} />
          <Route path="/lacagaha" element={<Payments />} />
          <Route path="/kharashaadka" element={<Expenses />} />
          <Route path="/isticmaalka" element={<DailyUsage />} />
          <Route path="/ogeysiisyada" element={<Notifications />} />
          <Route path="/goobaha" element={<Locations />} />
          <Route path="/boggooyinka" element={<SettingsPage />} />
          <Route path="/isticmaalayaasha" element={<UsersPage />} />
          <Route path="/dayactir" element={<Maintenance />} />
          <Route path="/taariikhda" element={<HistoryPage />} />
          <Route path="/qalabka" element={<Qalabka />} />
          <Route path="/xogta-qoraxda" element={<XogtaQoraxda />} />
          <Route path="/ciladaha" element={<Alarms />} />
          <Route path="/shaqaalaha" element={<Shaqaalaha />} />
          <Route path="/qiimaynta" element={<Qiimaynta />} />
          <Route path="/tixdeliyayaasha" element={<Tixdeliyayaasha />} />
          <Route path="/hawlaha" element={<Hawlaha />} />
          <Route path="/warbixin-isticmaalka" element={<UsageReports />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>
          <QueryClientProvider client={queryClientInstance}>
            <Router>
              <ScrollToTop />
              <AuthenticatedApp />
            </Router>
            <Toaster />
          </QueryClientProvider>
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App