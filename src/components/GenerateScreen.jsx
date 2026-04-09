import { useState, useRef } from 'react';
import { generateResponse } from '../api';
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

  const usagePct = Math.min((usage.used / usage.limit) * 100, 100);
  const almostFull = usage.remaining <= 10;

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
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 text-xs hidden sm:inline">{initialData.user}</span>
          <button
            onClick={onLogout}
            className="flex items-center justify-center min-h-[44px] px-3
                       text-zinc-400 text-xs font-medium
                       border border-zinc-700 hover:border-zinc-500 hover:text-zinc-200
                       rounded-lg transition-colors"
          >
            Salir
          </button>
        </div>
      </header>

      {/* Perfil + Usage — tarjeta unificada */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 mb-4">
        <div className="flex items-center justify-between mb-3 gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xl font-bold text-brand truncate leading-tight">
              {profile?.nombre || 'Sin perfil configurado'}
            </p>
            <p className="text-xs text-zinc-500 mt-1 truncate">
              {profile?.rubro || 'Completá tu perfil para mejores respuestas'}
            </p>
          </div>
          <button
            onClick={onEditProfile}
            className="flex items-center justify-center shrink-0
                       min-h-[44px] min-w-[44px] px-3
                       text-xs font-semibold text-zinc-300
                       border border-zinc-700 hover:border-zinc-500 hover:text-white
                       rounded-lg transition-colors"
          >
            Editar
          </button>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-500">
              Generaciones · <span className="text-zinc-400 font-medium">{initialData.plan}</span>
            </span>
            <span className={almostFull ? 'text-red-400 font-semibold' : 'text-zinc-300 font-medium'}>
              {usage.remaining} restante{usage.remaining !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${almostFull ? 'bg-red-500' : 'bg-brand'}`}
              style={{ width: `${usagePct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Banner: perfil incompleto */}
      {showProfileBanner && (
        <div className="flex items-center justify-between bg-brand/10 border border-brand/25
                        rounded-xl px-4 py-3 mb-4 gap-3">
          <p className="text-zinc-300 text-xs leading-snug flex-1">
            <strong className="text-white">Mejorá tus respuestas</strong> — completá tu perfil para que la IA conozca tu negocio.
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onEditProfile}
              className="bg-brand hover:bg-brand-dark text-black text-xs font-semibold
                         px-3 py-1.5 rounded-lg transition-colors"
            >
              Completar
            </button>
            <button
              onClick={() => setShowProfileBanner(false)}
              className="text-zinc-500 hover:text-zinc-300 text-lg leading-none transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Input form */}
      <form onSubmit={handleGenerate} className="space-y-3 mb-5">
        <div>
          <label htmlFor="gen-mensaje" className="block text-base font-semibold text-white mb-2">
            Mensaje del cliente
          </label>
          <textarea
            id="gen-mensaje"
            value={mensaje}
            onChange={e => setMensaje(e.target.value)}
            placeholder="Pegá o escribí el mensaje que recibiste por WhatsApp..."
            maxLength={500}
            rows={4}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3
                       text-white placeholder-zinc-600 text-sm resize-none
                       focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand
                       transition-colors"
          />
          <p className="text-right text-xs text-zinc-600 mt-1">{mensaje.length}/500</p>
        </div>

        <button
          type="button"
          onClick={() => setShowContexto(v => !v)}
          className="flex items-center gap-2 min-h-[44px] px-3 -mx-3
                     text-zinc-400 text-sm hover:text-zinc-200 transition-colors
                     rounded-lg hover:bg-zinc-800/50"
        >
          <span
            className="w-5 h-5 flex items-center justify-center rounded-full
                       border border-zinc-700 text-xs font-bold shrink-0"
          >
            {showContexto ? '−' : '+'}
          </span>
          <span>
            {showContexto ? 'Ocultar contexto' : 'Agregar contexto del momento'}
          </span>
          {!showContexto && <span className="text-zinc-600 text-xs">(opcional)</span>}
        </button>

        {showContexto && (
          <div>
            <label htmlFor="gen-contexto" className="block text-sm font-medium text-zinc-300 mb-1">
              ⚡ Contexto del momento
            </label>
            <p className="text-zinc-500 text-xs mb-2">La IA prioriza esto sobre todo lo del perfil. Stock de hoy, precios actuales, promociones activas, excepciones.</p>
            <textarea
              id="gen-contexto"
              value={contexto}
              onChange={e => setContexto(e.target.value)}
              placeholder="Ej: tenemos el Nike Air Force 1 blanco talle 42 a 350mil, sin talle 40. Hacemos envíos hoy hasta las 18hs."
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
                     disabled:cursor-not-allowed disabled:shadow-none
                     text-black font-bold rounded-xl py-4 text-base
                     shadow-lg shadow-brand/25 hover:shadow-brand/40
                     transition-all"
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
        <div ref={respuestaRef} aria-label="Respuesta generada"
             className="bg-brand/5 border border-brand/30 rounded-xl overflow-hidden mb-6">
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
              className="block w-full bg-transparent border border-green-500 text-green-400
                         font-semibold rounded-xl py-3 text-sm text-center transition-colors
                         hover:bg-green-950/50"
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
