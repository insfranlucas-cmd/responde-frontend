import { useState, useRef } from 'react';
import { generateResponse } from '../api';
import UsageBar from './UsageBar';
import ReportButton from './ReportButton';

export default function GenerateScreen({ accessCode, initialData, profile, welcome, onEditProfile, onLogout }) {
  const [mensaje, setMensaje] = useState('');
  const [contexto, setContexto] = useState('');
  const [respuesta, setRespuesta] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const respuestaRef = useRef(null);
  const [usage, setUsage] = useState(initialData.usage);
  const [showWelcome, setShowWelcome] = useState(!!welcome);
  const [showContexto, setShowContexto] = useState(false);
  const [showProfileBanner, setShowProfileBanner] = useState(() => {
    const p = profile || {};
    const filled = [
      p.nombre, p.rubro, p.descripcion, p.horarios, p.pagos,
    ].filter(v => typeof v === 'string' && v.trim().length > 0).length
      + (Array.isArray(p.preguntas_frecuentes) && p.preguntas_frecuentes.length > 0 ? 1 : 0)
      + (Array.isArray(p.items) && p.items.length > 0 ? 1 : 0);
    return filled < 5;
  });

  async function handleGenerate(e) {
    e.preventDefault();
    if (!mensaje.trim() || loading) return;

    setLoading(true);
    setError('');
    setRespuesta('');
    setCopied(false);

    const extension = 'corta';

    try {
      const data = await generateResponse(accessCode, {
        mensaje: mensaje.trim(),
        tono: profile?.tono_respuesta || 'cercano',
        extension,
        ...(contexto.trim() && { contexto_adicional: contexto.trim() }),
      });
      setRespuesta(data.respuesta);
      setUsage(data.usage);
      setTimeout(() => respuestaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    } catch (err) {
      if (err.message === 'perfil_requerido') {
        onEditProfile();
      } else if (err.message.toLowerCase().includes('límite')) {
        setError('Usaste todas tus generaciones del piloto. Escribinos por WhatsApp para continuar.');
      } else {
        setError(err.message || 'Error al generar. Intentá de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!respuesta) return;
    await navigator.clipboard.writeText(respuesta);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main id="main-content" className="min-h-screen flex flex-col px-4 py-6 max-w-lg mx-auto w-full">

      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
            <span className="text-black text-sm font-bold">R</span>
          </div>
          <span className="text-white font-semibold">RESPONDE</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-zinc-500 text-xs">{initialData.user}</span>
          <button
            onClick={onLogout}
            className="text-zinc-500 hover:text-zinc-300 text-xs transition-colors"
          >
            Salir
          </button>
        </div>
      </header>

      {/* Banner bienvenida */}
      {showWelcome && welcome?.type === 'returning' && (
        <div className="flex items-start justify-between bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 mb-4">
          <div>
            <p className="text-white text-sm font-medium">Bienvenido de nuevo a RESPONDE</p>
            <p className="text-zinc-400 text-xs mt-0.5">
              Te quedan <strong className="text-white">{welcome.remaining}</strong> generaciones disponibles.
            </p>
          </div>
          <button onClick={() => setShowWelcome(false)} className="text-zinc-600 hover:text-zinc-400 text-lg leading-none ml-3">×</button>
        </div>
      )}

      {/* Perfil chip */}
      <button
        onClick={onEditProfile}
        className="w-full bg-zinc-900 border border-zinc-700 hover:border-zinc-600
                   rounded-xl px-4 py-3 mb-4 text-left transition-colors"
      >
        <p className="text-sm font-medium text-zinc-300">✏ Editar perfil de mi negocio</p>
        <p className="text-xs text-zinc-500 mt-0.5">{profile?.nombre || 'Sin perfil configurado'}</p>
      </button>

      {/* Banner: perfil incompleto */}
      {showProfileBanner && (
        <div className="flex items-center justify-between bg-yellow-950/60 border border-yellow-800/60
                        rounded-xl px-4 py-3 mb-4 gap-3">
          <p className="text-yellow-200 text-xs leading-snug flex-1">
            🚀 <strong>Mejorá tus respuestas</strong> — Completá tu perfil para que la IA conozca mejor tu negocio
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={onEditProfile}
              className="bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-semibold
                         px-3 py-1.5 rounded-lg transition-colors">
              Completar →
            </button>
            <button onClick={() => setShowProfileBanner(false)}
              className="text-yellow-700 hover:text-yellow-500 text-lg leading-none transition-colors">
              ×
            </button>
          </div>
        </div>
      )}

      {/* Usage bar */}
      <div className="mb-5">
        <UsageBar usage={usage} plan={initialData.plan} />
      </div>

      {/* Input form */}
      <form onSubmit={handleGenerate} className="space-y-3 mb-5">
        <div>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Paso 1 — Mensaje del cliente</p>
          <label htmlFor="gen-mensaje" className="block text-sm font-medium text-zinc-300 mb-2">
            Mensaje del cliente
          </label>
          <textarea
            id="gen-mensaje"
            value={mensaje}
            onChange={e => setMensaje(e.target.value)}
            placeholder="Pegá o escribí el mensaje que recibiste por WhatsApp..."
            maxLength={500}
            rows={4}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3
                       text-white placeholder-zinc-600 text-sm resize-none
                       focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand
                       transition-colors"
          />
          <p className="text-right text-xs text-zinc-600 mt-1">{mensaje.length}/500</p>
        </div>

        <button
          type="button"
          onClick={() => setShowContexto(v => !v)}
          className="text-zinc-500 text-sm hover:text-zinc-300 transition-colors"
        >
          {showContexto ? '− Ocultar contexto' : '+ Agregar contexto del momento (opcional)'}
        </button>

        {showContexto && (
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 mt-3">Paso 2 — Contexto del momento</p>
            <label htmlFor="gen-contexto" className="block text-sm font-medium text-zinc-300 mb-1">
              ⚡ Contexto del momento
            </label>
            <p className="text-zinc-500 text-xs mb-2">La IA prioriza esto sobre todo lo del perfil. Stock de hoy, precios actuales, promociones activas, excepciones. Escribí como quieras.</p>
            <textarea
              id="gen-contexto"
              value={contexto}
              onChange={e => setContexto(e.target.value)}
              placeholder={"Ej: tenemos el Nike Air Force 1 blanco talle 42 a 350mil, sin talle 40. Hacemos envíos hoy hasta las 18hs. Aceptamos Tigo Money."}
              maxLength={500}
              rows={3}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3
                         text-white placeholder-zinc-600 text-sm resize-none
                         focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand
                         transition-colors"
            />
            <p className="text-right text-xs text-zinc-600 mt-1">{contexto.length}/500</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !mensaje.trim() || usage.remaining === 0}
          className="w-full bg-brand hover:bg-brand-dark disabled:bg-zinc-800 disabled:text-zinc-600
                     disabled:cursor-not-allowed text-black font-semibold rounded-xl py-3 text-sm
                     transition-colors"
        >
          {loading ? 'Generando...' : '⚡ Generar respuesta'}
        </button>
      </form>

      {/* Error */}
      <div role="alert" aria-live="polite">
        {error && (
          <div className="bg-red-950 border border-red-800 rounded-xl px-4 py-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Response */}
      {respuesta && (
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Resultado</p>
      )}
      {respuesta && (
        <div ref={respuestaRef} aria-label="Respuesta generada" className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-4 pt-3 pb-1">
            <span className="text-xs font-medium text-zinc-400">Respuesta generada</span>
          </div>
          <div className="px-4 py-4">
            <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{respuesta}</p>
          </div>
          <div className="px-4 pb-4 space-y-2">
            <button
              onClick={handleCopy}
              className="w-full bg-brand hover:bg-brand-dark text-black font-semibold rounded-xl py-3 text-sm transition-colors"
            >
              {copied ? '✓ Copiado' : 'Copiar respuesta'}
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(respuesta)}`}
              target="_blank"
              rel="noreferrer"
              className="block w-full bg-transparent border border-green-600 text-green-500 font-semibold rounded-xl py-3 text-sm text-center transition-colors hover:bg-green-950"
            >
              Abrir en WhatsApp
            </a>
          </div>
        </div>
      )}

      <ReportButton accessCode={accessCode} />
    </main>
  );
}
