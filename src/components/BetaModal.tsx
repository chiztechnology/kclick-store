import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function BetaModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenBeta = localStorage.getItem('hasSeenBetaModal');
    if (!hasSeenBeta) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('hasSeenBetaModal', 'true');
    setIsOpen(false);
  };

  const handleExplore = () => {
    localStorage.setItem('hasSeenBetaModal', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full mb-6">
            <span className="text-4xl">🚀</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Plateforme en version Beta
          </h2>

          <p className="text-gray-600 mb-6">
            Profitez des tests et partagez vos retours avec nous pour améliorer votre expérience.
          </p>

          <div className="border-t border-gray-100 pt-6 mb-6">
            <p className="text-sm text-gray-500 mb-3">Propulsé par</p>
            <a
              href="https://chiztechnology.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block transition-transform hover:scale-105"
            >
              <img
                src="/CHIZ_Logo_Transparent.png"
                alt="CHIZ Technology"
                className="h-12 mx-auto"
              />
            </a>
          </div>

          <button
            onClick={handleExplore}
            className="w-full py-3 px-6 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
            style={{ backgroundColor: '#0f76bb' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#103556'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0f76bb'}
          >
            Explorer la plateforme
          </button>
        </div>
      </div>
    </div>
  );
}
