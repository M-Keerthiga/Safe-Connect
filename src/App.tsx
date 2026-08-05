import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { CovertFeed } from './components/CovertFeed';
import { HiddenHUD } from './components/HiddenHUD';
import { CommandCenter } from './components/CommandCenter';
import { AuthModal } from './components/AuthModal';
import { CommandCenterTrigger } from './components/CommandCenterTrigger';
import { WelcomeScreen } from './components/WelcomeScreen';
import { Loader2 } from 'lucide-react';

export function App() {
  const { user, profile, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [showHUD, setShowHUD] = useState(false);
  const [showCommandCenter, setShowCommandCenter] = useState(false);
  const [newPostId, setNewPostId] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);

  // Auto-show command center for judges after welcome
  useEffect(() => {
    if (!showWelcome && user && profile) {
      const timer = setTimeout(() => setShowCommandCenter(true), 500);
      return () => clearTimeout(timer);
    }
  }, [showWelcome, user, profile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-white mx-auto mb-4" />
          <p className="text-white/70">Loading your safe space...</p>
        </div>
      </div>
    );
  }

  // Welcome screen for first-time visitors
  if (showWelcome && !user) {
    return <WelcomeScreen onContinue={() => setShowWelcome(false)} />;
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen">
        <CovertFeed
          onAuthClick={() => {
            setAuthMode('login');
            setShowAuth(true);
          }}
          isAuthenticated={false}
          onPostCreated={() => {}}
          profile={null}
          showOnboarding={() => {
            setAuthMode('signup');
            setShowAuth(true);
          }}
        />
        <AuthModal
          isOpen={showAuth}
          onClose={() => setShowAuth(false)}
          mode={authMode}
          onSwitchMode={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Split view for hackathon demo */}
      <div className="flex h-screen">
        {/* Left Panel: Covert Instagram UI */}
        <div className={`flex-1 overflow-hidden ${showCommandCenter ? 'lg:w-1/2' : 'w-full'}`}>
          <CovertFeed
            onAuthClick={() => {}}
            isAuthenticated={true}
            onPostCreated={setNewPostId}
            profile={profile}
            onSecretGesture={() => setShowHUD(true)}
          />

          {/* Command Center Toggle Button */}
          <CommandCenterTrigger
            isOpen={showCommandCenter}
            onClick={() => setShowCommandCenter(!showCommandCenter)}
          />
        </div>

        {/* Right Panel: Command Center (for judges) */}
        <div className={`hidden lg:block border-l border-cc-border transition-all duration-500 overflow-hidden ${
          showCommandCenter ? 'lg:w-1/2' : 'lg:w-0'
        }`}>
          <CommandCenter
            newPostId={newPostId}
            onHide={() => setShowCommandCenter(false)}
          />
        </div>
      </div>

      {/* Hidden HUD Modal (secret gestures) */}
      <HiddenHUD
        isOpen={showHUD}
        onClose={() => setShowHUD(false)}
      />
    </div>
  );
}
