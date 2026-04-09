import { useState } from 'react';
import { checkCode } from '../api';

export default function LoginScreen({ onLogin }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
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
    <main
      id="main-content"
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#0a0a0a' }}
    >
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
            style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}
          >
            <span className="text-black text-2xl font-syne font-bold">R</span>
          </div>
          <h1 className="font-syne font-bold text-4xl text-white tracking-tight">RESPONDE</h1>
          <p className="text-[#a3a3a3] text-sm mt-2">Asistente IA para tu negocio</p>
        </div>

        {/* Card */}
        <div
          className="rounded-xl p-8"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label
                htmlFor="login-codigo"
                className="block text-sm font-medium text-[#a3a3a3] mb-3"
              >
                Código de acceso
              </label>
              <input
                id="login-codigo"
                type="text"
                value={code}
                onChange={handleChange}
                placeholder="7K2"
                maxLength={3}
                autoCapitalize="characters"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                inputMode="text"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: `2px solid ${code.length > 0 ? '#22c55e' : 'rgba(255,255,255,0.1)'}`,
                  boxShadow: code.length > 0 ? '0 0 0 4px rgba(34,197,94,0.12)' : 'none',
                  fontSize: '28px',
                  letterSpacing: '0.5em',
                  touchAction: 'manipulation',
                }}
                className="w-full rounded-lg px-4 py-4 text-center font-mono font-bold
                           text-white placeholder-[#737373] transition-all duration-200
                           focus:outline-none"
              />
              <p className="text-center text-xs text-[#737373] mt-2">{code.length}/3 caracteres</p>
            </div>

            <div role="alert" aria-live="polite" className="min-h-[20px]">
              {error && (
                <p className="text-[#ef4444] text-sm text-center">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={!ready}
              style={{
                background: ready
                  ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                  : '#2a2a2a',
                color: ready ? '#000' : '#737373',
                boxShadow: ready ? '0 4px 14px rgba(34,197,94,0.3)' : 'none',
              }}
              className="w-full py-4 rounded-xl font-semibold text-base
                         transition-all duration-200 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner /> Verificando...
                </span>
              ) : 'Ingresar'}
            </button>

          </form>
        </div>

      </div>
    </main>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
