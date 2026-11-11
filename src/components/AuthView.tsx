import React, { useState } from 'react';
import { authService } from '../services/authService';
import { Wallet, ShieldCheck, Lock, Mail, Sparkles } from 'lucide-react';

interface AuthViewProps {
  onLoginSuccess: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await authService.signUp(email, password);
        alert('Registration successful! Please confirm your email or sign in.');
        setIsSignUp(false);
      } else {
        await authService.signIn(email, password);
        onLoginSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Glow Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-fintech-blue/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="bg-gradient-to-br from-dark-card to-[#12161c] border border-dark-border/80 rounded-3xl w-full max-w-md p-10 shadow-2xl space-y-8 relative z-10 backdrop-blur-xl">
        
        <div className="text-center space-y-3">
          <div className="inline-flex p-3.5 bg-fintech-blue/10 text-fintech-blue rounded-2xl border border-fintech-blue/30 shadow-lg shadow-fintech-blue/20">
            <Wallet className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-fintech-blue uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Secure Financial Command Center
            </div>
            <h1 className="text-2xl font-black tracking-tight">MyFinance v1.0</h1>
            <p className="text-xs text-dark-muted">Manage, monitor, and control your complete wealth</p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-fintech-red/10 border border-fintech-red/30 text-fintech-red text-xs rounded-xl text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-dark-muted">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-dark-muted absolute left-4 top-3.5" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-xl pl-11 pr-4 py-3 text-dark-text text-sm focus:outline-none focus:border-fintech-blue transition"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-dark-muted">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-dark-muted absolute left-4 top-3.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-xl pl-11 pr-4 py-3 text-dark-text text-sm focus:outline-none focus:border-fintech-blue transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-fintech-blue hover:opacity-95 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-fintech-blue/25 mt-2"
          >
            {loading ? 'Please wait...' : isSignUp ? 'Create Secure Account' : 'Sign In to Dashboard'}
          </button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs font-semibold text-fintech-blue hover:underline"
          >
            {isSignUp ? 'Already have a portfolio? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>

        <div className="pt-6 border-t border-dark-border text-center flex items-center justify-center gap-2 text-xs text-dark-muted">
          <ShieldCheck className="w-4 h-4 text-fintech-green" />
          <span>Secured with Supabase Auth & Row Level Security</span>
        </div>

      </div>
    </div>
  );
};