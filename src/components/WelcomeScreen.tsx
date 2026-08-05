import { useState } from 'react';
import { Heart, Shield, Users, MapPin, ArrowRight, Sparkles } from 'lucide-react';

interface WelcomeScreenProps {
  onContinue: () => void;
}

export function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: <Heart className="w-16 h-16" />,
      title: 'Connect with Friends',
      description: 'Share moments, stories, and experiences with people you care about.',
      gradient: 'from-pink-500 to-rose-500',
    },
    {
      icon: <Shield className="w-16 h-16" />,
      title: 'Stay Protected',
      description: 'Advanced safety features work silently in the background to keep you secure.',
      gradient: 'from-indigo-500 to-purple-500',
    },
    {
      icon: <Users className="w-16 h-16" />,
      title: 'Trusted Network',
      description: 'Your emergency contacts are just one tap away when you need them.',
      gradient: 'from-cyan-500 to-blue-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Stars */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.7 + 0.3,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/30 shadow-2xl">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold text-white italic">SafeConnect</span>
          </div>
          <p className="text-white/70 text-lg">Your safe space to connect</p>
        </div>

        {/* Slides */}
        <div className="w-full max-w-md">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`transition-all duration-500 ${
                currentSlide === index
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 absolute translate-x-10 pointer-events-none'
              }`}
            >
              <div className="text-center mb-8">
                <div className={`w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br ${slide.gradient} flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform`}>
                  <div className="text-white">{slide.icon}</div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">{slide.title}</h2>
                <p className="text-white/70 leading-relaxed">{slide.description}</p>
              </div>
            </div>
          ))}

          {/* Dots */}
          <div className="flex justify-center gap-2 mb-8">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentSlide === index
                    ? 'w-8 bg-white'
                    : 'bg-white/30'
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            {currentSlide < slides.length - 1 ? (
              <>
                <button
                  onClick={() => setCurrentSlide((s) => s + 1)}
                  className="flex-1 py-4 rounded-2xl bg-white/10 backdrop-blur text-white font-medium hover:bg-white/20 transition-colors border border-white/20"
                >
                  Next
                </button>
                <button
                  onClick={onContinue}
                  className="py-4 px-6 rounded-2xl text-white/70 hover:text-white transition-colors"
                >
                  Skip
                </button>
              </>
            ) : (
              <button
                onClick={onContinue}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
              >
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        </div>

        {/* Bottom text */}
        <p className="mt-8 text-white/40 text-sm text-center">
          By continuing, you agree to help create a safer community
        </p>
      </div>
    </div>
  );
}
