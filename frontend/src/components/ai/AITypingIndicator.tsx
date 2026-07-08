import React from 'react';

interface AITypingIndicatorProps {
  className?: string;
}

export const AITypingIndicator: React.FC<AITypingIndicatorProps> = ({ className = '' }) => (
  <div
    className={`flex items-center gap-1 ${className}`}
    role="status"
    aria-label="AI is generating a response"
  >
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="h-2 w-2 rounded-full bg-primary-blue dark:bg-primary-sky opacity-80"
        style={{
          animation: 'ai-bounce 1.4s ease-in-out infinite',
          animationDelay: `${i * 0.22}s`,
        }}
        aria-hidden="true"
      />
    ))}
    <style>{`
      @keyframes ai-bounce {
        0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
        30% { transform: translateY(-5px); opacity: 1; }
      }
      @media (prefers-reduced-motion: reduce) {
        .ai-typing-dot { animation: none !important; opacity: 0.8; }
      }
    `}</style>
  </div>
);

export default AITypingIndicator;
