import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { BASE } from '@/lib/basePath';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import CustomerLayout from '@/components/CustomerLayout';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Discover from '@/pages/Discover';
import WriteReview from '@/pages/WriteReview';
import AddBusiness from '@/pages/AddBusiness';
import ChooseTopic from '@/pages/ChooseTopic';
import RateWrite from '@/pages/RateWrite';
import ProofDeclaration from '@/pages/ProofDeclaration';
import ReviewSubmitted from '@/pages/ReviewSubmitted';
import Referral from '@/pages/Referral';
import MyReviews from '@/pages/MyReviews';
import Account from '@/pages/Account';
import BusinessProfile from '@/pages/BusinessProfile';
import BusinessLayout from '@/components/BusinessLayout';
import BusinessLanding from '@/pages/BusinessLanding';
import ClaimBusiness from '@/pages/ClaimBusiness';
import CreateProfile from '@/pages/CreateProfile';
import BusinessHome from '@/pages/BusinessHome';
import BusinessReviews from '@/pages/BusinessReviews';
import BusinessProfileEdit from '@/pages/BusinessProfileEdit';
import RespondReview from '@/pages/RespondReview';
import AdminDesk from '@/pages/AdminDesk';
import Terms from '@/pages/Terms';
import Privacy from '@/pages/Privacy';
import ContentPolicy from '@/pages/ContentPolicy';
import HowRosettesWork from '@/pages/HowRosettesWork';
import MyYard from '@/pages/MyYard';
import YardCare from '@/pages/YardCare';
import YardRides from '@/pages/YardRides';
import YardHorse from '@/pages/YardHorse';
import TrainingLibrary from '@/pages/TrainingLibrary';
import TrainingDetail from '@/pages/TrainingDetail';
import Invoice from '@/pages/Invoice';
import AiTools from '@/pages/AiTools';
// Add page imports here

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<Discover />} />
          <Route path="/write" element={<WriteReview />} />
          <Route path="/write/add" element={<AddBusiness />} />
          <Route path="/write/topic" element={<ChooseTopic />} />
          <Route path="/write/rate" element={<RateWrite />} />
          <Route path="/write/proof" element={<ProofDeclaration />} />
          <Route path="/write/done" element={<ReviewSubmitted />} />
          <Route path="/write/referral" element={<Referral />} />
          <Route path="/my-reviews" element={<MyReviews />} />
          <Route path="/account" element={<Account />} />
          <Route path="/business/list" element={<BusinessLanding />} />
          <Route path="/business/claim" element={<ClaimBusiness />} />
          <Route path="/business/create" element={<CreateProfile />} />
          <Route path="/business/:id" element={<BusinessProfile />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/content-policy" element={<ContentPolicy />} />
          <Route path="/how-rosettes-work" element={<HowRosettesWork />} />
          <Route path="/my-yard" element={<MyYard />} />
          <Route path="/my-yard/care" element={<YardCare />} />
          <Route path="/my-yard/rides" element={<YardRides />} />
          <Route path="/my-yard/horse/:id" element={<YardHorse />} />
          <Route path="/training" element={<TrainingLibrary />} />
          <Route path="/training/:id" element={<TrainingDetail />} />
          <Route path="/invoice/:id" element={<Invoice />} />
          <Route path="/ai-tools" element={<AiTools />} />
        </Route>
        <Route element={<BusinessLayout />}>
          <Route path="/business" element={<BusinessHome />} />
          <Route path="/business/reviews" element={<BusinessReviews />} />
          <Route path="/business/profile" element={<BusinessProfileEdit />} />
          <Route path="/business/review/:id" element={<RespondReview />} />
        </Route>
        <Route path="/admin" element={<AdminDesk />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router basename={BASE || '/'}>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App