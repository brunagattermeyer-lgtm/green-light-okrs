import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const LoginPage: React.FC = () => {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const { error: err } = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password);

    if (err) {
      setError(err.message);
    } else if (isSignUp) {
      setSuccess('Conta criada! Verifique seu email para confirmar.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-okr-bg">
      <div className="bg-okr-su rounded-xl shadow-card p-8 w-full max-w-sm border border-okr-bl">
        <div className="mb-6 text-center">
          <span className="inline-block bg-okr-dk text-[#a8d8a8] text-xs font-medium tracking-wider px-3 py-1 rounded-full mb-3">
            Time Igrejas · 2T 2026
          </span>
          <h1 className="text-xl font-semibold text-okr-dk">OKRs — Gestão Operacional</h1>
          <p className="text-sm text-okr-mi mt-1">{isSignUp ? 'Criar conta' : 'Entrar'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-okr-lt uppercase tracking-wider mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-okr-bl bg-okr-su text-okr-dk text-sm focus:outline-none focus:ring-2 focus:ring-okr-fo"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-okr-lt uppercase tracking-wider mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 rounded-lg border border-okr-bl bg-okr-su text-okr-dk text-sm focus:outline-none focus:ring-2 focus:ring-okr-fo"
            />
          </div>

          {error && <p className="text-red-600 text-xs">{error}</p>}
          {success && <p className="text-okr-fo text-xs">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-okr-fo text-white text-sm font-medium rounded-lg hover:bg-okr-dk transition-colors disabled:opacity-50"
          >
            {loading ? '...' : isSignUp ? 'Criar conta' : 'Entrar'}
          </button>
        </form>

        <button
          onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccess(''); }}
          className="mt-4 w-full text-center text-xs text-okr-lt hover:text-okr-fo transition-colors"
        >
          {isSignUp ? 'Já tem conta? Entrar' : 'Não tem conta? Criar'}
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
