import { useState } from 'react';
import { checkCode } from '../api';

export default function LoginScreen({ onLogin }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    // Auto-uppercase, máximo 3 caracteres alfanuméricos
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3);
    setCode(val);
    if (error) setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (code.length !== 3) {
      setError('El código debe tener exactamente 3 caracteres.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await checkCode(code);
      onLogin(code, data);
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('inactivo') || msg.includes('nactivo')) {
        setError('Este código aún no fue activado. Contactá a tu asesor RESPONDE.');
      } else {
        setError('Código no reconocido. Verificá con tu asesor RESPONDE.');
      }
    } finally {
      setLoading(false);
    }
  }

  const ready = code.length === 3 && !loading;

  return (
    <main id="main-content" className="min-h-screen flex items-center justify-center px-4">
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
        <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <div>
            <label htmlFor="login-codigo" className="block text-sm font-medium text-zinc-300 mb-2">
              Código de acceso
            </label>
            <input
              id="login-codigo"
              type="text"
              value={code}
              onChange={handleChange}
              placeholder="Ej: 7K2"
              maxLength={3}
              autoCapitalize="characters"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              inputMode="text"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3
                         text-white placeholder-zinc-500 text-sm tracking-widest text-center font-mono
                         focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand
                         transition-colors"
            />
            <p className="text-center text-xs text-zinc-600 mt-1">{code.length}/3 caracteres</p>
          </div>

          <p role="alert" aria-live="polite" className="text-red-400 text-sm text-center min-h-[1.25rem]">{error}</p>

          <button
            type="submit"
            disabled={!ready}
            className="w-full bg-brand hover:bg-brand-dark disabled:bg-zinc-700 disabled:cursor-not-allowed
                       text-black font-semibold rounded-xl py-3 text-sm transition-colors"
          >
            {loading ? 'Verificando...' : 'Ingresar'}
          </button>
        </form>

      </div>
    </main>
  );
}
