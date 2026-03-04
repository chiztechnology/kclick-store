import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
import { AlertTriangle, Search, Lock, Home } from 'lucide-react';

export default function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate() as (path: string) => void;
  const isRouteError = isRouteErrorResponse(error);

  const getErrorDetails = () => {
    if (isRouteError) {
      if (error.status === 404) {
        return {
          code: '404',
          title: 'Page Not Found',
          message: 'The page you are looking for does not exist or has been moved.',
          icon: Search,
        };
      }
      if (error.status === 403) {
        return {
          code: '403',
          title: 'Access Denied',
          message: 'You do not have permission to access this page.',
          icon: Lock,
        };
      }
      if (error.status === 500) {
        return {
          code: '500',
          title: 'Server Error',
          message: 'Something went wrong on our end. Please try again later.',
          icon: AlertTriangle,
        };
      }
    }

    return {
      code: 'ERROR',
      title: 'Unexpected Error',
      message: 'An unexpected error occurred. Please try again.',
      icon: AlertTriangle,
    };
  };

  const { code, title, message, icon: IconComponent } = getErrorDetails();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="bg-orange-100 rounded-full p-4">
            <IconComponent className="w-8 h-8 text-kclick-orange" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-center text-slate-900 mb-2">
          {code}
        </h1>
        <h2 className="text-2xl font-semibold text-center text-slate-800 mb-4">
          {title}
        </h2>
        <p className="text-center text-slate-600 mb-8">
          {message}
        </p>

        {isRouteError && error.statusText && (
          <div className="mb-6 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-sm text-slate-700 break-words">
              <span className="font-semibold">Details:</span> {error.statusText}
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-kclick-orange hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Home
          </button>
          <button
            onClick={() => navigate(-1)}
            className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-900 font-semibold py-3 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>

        <p className="text-xs text-slate-500 text-center mt-6">
          If you continue to experience issues, please contact support.
        </p>
      </div>
    </div>
  );
}
