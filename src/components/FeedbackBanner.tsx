import { MessageSquare } from 'lucide-react';

export default function FeedbackBanner() {
  const feedbackEmail = 'isaac@chiztechnology.com';
  const subject = 'Feedback on Kclick App Test';
  const mailtoLink = `mailto:${feedbackEmail}?subject=${encodeURIComponent(subject)}`;

  return (
    <div className="w-full py-2 px-4" style={{ backgroundColor: '#103556' }}>
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
        <MessageSquare size={16} className="text-white" />
        <a
          href={mailtoLink}
          className="text-white text-sm font-medium hover:underline transition-all flex items-center gap-2"
          style={{ color: 'white' }}
        >
          Share your feedback with us! <span className="text-xs text-white/80">(Click to email us)</span>
        </a>
        <span className="text-white/60 text-xs">•</span>
        <a
          href="https://chiztechnology.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
            <span className="text-xs text-white/80">Powered by</span>
          <img
            src="/chiz logo light.png"
            alt="CHIZ Technology"
            className="h-3"
          />
        </a>
      </div>
    </div>
  );
}
