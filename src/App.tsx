import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { ScrollToTop } from './components/ScrollToTop';
import BetaModal from './components/BetaModal';
import FeedbackBanner from './components/FeedbackBanner';
import Notification from './apps/business/components/ui/Notification';


function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <FeedbackBanner />
      <main className="flex-1">
        <ScrollToTop />
        <Outlet />
      </main>
      <Notification />
      <BetaModal />
    </div>
  );
}

export default App;
