import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import ErrorPage from './pages/ErrorPage';
import BusinessLandingPage from './apps/business/pages/BusinessLandingPage';
import BusinessPortalPage from './apps/business/pages/BusinessPortalPage';
import BusinessStoreDashboard from './apps/business/pages/BusinessStoreDashboard';
import BusinessDashboardPage from './apps/business/pages/BusinessDashboardPage';
import BusinessOrdersPage from './apps/business/pages/BusinessOrdersPage';
import BusinessInventoryPage from './apps/business/pages/BusinessInventoryPage';
import ProductFormPage from './apps/business/pages/ProductFormPage';
import BulkProductPage from './apps/business/pages/BulkProductPage';
import CreateStorePage from './apps/business/pages/CreateStorePage';
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';;
import UnsubscribePage from './pages/misc/UnsubscribePage';
import InviteUserStorePage from './pages/store/InviteUserStorePage';
import InvitationStoreReviewPage from './pages/store/InvitationStoreReviewPage';
import LandingPage from './pages/LandingPage';
import ConfirmAccountConversionPage from './pages/ConfirmAccountConversionPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <BusinessPortalPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/business/portal',
    element: <BusinessPortalPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/business/portal/new',
    element: <CreateStorePage />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/business/store/:storeId',
    element: <BusinessStoreDashboard />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/business/dashboard',
    element: <BusinessDashboardPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/business/store/:storeId/dashboard',
    element: <BusinessDashboardPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/business/orders',
    element: <BusinessOrdersPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/business/store/:storeId/orders',
    element: <BusinessOrdersPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/business/inventory',
    element: <BusinessInventoryPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/business/store/:storeId/inventory',
    element: <BusinessInventoryPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/business/store/:storeId/products/new',
    element: <ProductFormPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/business/store/:storeId/products/:productId',
    element: <ProductFormPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/business/store/:storeId/products/bulk',
    element: <BulkProductPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/welcome',
    element: <LandingPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/confirm-account-conversion',
    element: <ConfirmAccountConversionPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/unsubscribe',
    element: <UnsubscribePage />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/invite-user-store',
    element: <InviteUserStorePage />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/invitation-store-review',
    element: <InvitationStoreReviewPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: '*',
    element: <ErrorPage />,
  },
]);

export function Router() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}
