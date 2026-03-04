import React from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useApp } from '../../../../context/AppContext';

export default function Notification() {
  const { notification } = useApp();
  if (!notification) return null;

  const icons = {
    success: <CheckCircle size={20} className="text-green-500" />,
    error: <XCircle size={20} className="text-red-500" />,
    info: <Info size={20} className="text-blue-500" />,
  };

  const colors = {
    success: 'border-green-200 bg-green-50',
    error: 'border-red-200 bg-red-50',
    info: 'border-blue-200 bg-blue-50',
  };

  return (
    <div className="fixed top-20 right-4 z-[100] animate-slide-in">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg max-w-sm ${colors[notification.type]}`}>
        {icons[notification.type]}
        <p className="text-sm font-medium text-gray-800">{notification.message}</p>
      </div>
    </div>
  );
}
