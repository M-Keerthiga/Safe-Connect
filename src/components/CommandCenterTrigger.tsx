import { Radio, Radio as RadioIcon } from 'lucide-react';

interface CommandCenterTriggerProps {
  isOpen: boolean;
  onClick: () => void;
}

export function CommandCenterTrigger({ isOpen, onClick }: CommandCenterTriggerProps) {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-20 right-4 z-30 p-3 rounded-full shadow-lg transition-all duration-300 ${
        isOpen
          ? 'bg-cc-card border border-cc-border'
          : 'bg-safety-accent cc-glow'
      }`}
      title="Toggle Command Center"
    >
      <Radio className={`w-5 h-5 ${isOpen ? 'text-safety-accent' : 'text-white'}`} />
      {!isOpen && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-safety-danger rounded-full animate-ping" />
      )}
    </button>
  );
}
