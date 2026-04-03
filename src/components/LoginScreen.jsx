import { useState } from 'react';
import { checkCode } from '../api';

export default function LoginScreen({ onLogin }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;

    setLoading(true);
    setError('');

    try {
      const data = await checkCode(trimmed);
      onLogin(trimmed, data);
    } catch {
      setError('Código inválido. Verificá que esté escrito correctamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand mb-4">
            <span className="text-black text-2xl font-bold">R</span>
          </div>
          <h1 className="text-2xl font-bold text-white">RESPONDE</h1>
          <p className="text-zinc-400 text-sm mt-1">Asistente WhatsApp para tu negocio</p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Código de acceso
            </label>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="Ej: ALPHA001"
              maxLength={50}
              autoCapitalize="characters"
              autoComplete="off"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3
                         text-white placeholder-zinc-500 text-sm
                         focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand
                         transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full bg-brand hover:bg-brand-dark disabled:bg-zinc-700 disabled:cursor-not-allowed
                       text-black font-semibold rounded-xl py-3 text-sm
                       transition-colors"
          >
            {loading ? 'Verificando...' : 'Ingresar'}
          </button>
        </form>

      </div>
    </div>
  );
}
