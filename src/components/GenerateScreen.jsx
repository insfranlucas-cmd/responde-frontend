import { useState, useRef } from 'react';
import { generateResponse } from '../api';
import ReportButton from './ReportButton';

export default function GenerateScreen({ accessCode, initialData, profile, onEditProfile, onLogout }) {
  const [mensaje, setMensaje] = useState('');
  const [contexto, setContexto] = useState('');
  const [respuesta, setRespuesta] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const respuestaRef = useRef(null);
  const [usage, setUsage] = useState(initialData.usage);
  const [showContexto, setShowContexto] = useState(false);
  const [showBanner, setShowBanner] = useState(() => {
    const p = profile || {};
    const filled = [p.nombre, p.rubro, p.descripcion, p.horarios, p.pagos]
      .filter(v => typeof v === 'string' && v.trim().length > 0).length
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
    try {
      const data = await generateResponse(accessCode, {
        mensaje: mensaje.trim(),
        tono: profile?.tono_respuesta || 'cercano',
        extension: 'corta',
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

  function handleNueva() {
    setRespuesta('');
    setMensaje('');
    setContexto('');
    setError('');
    setCopied(false);
  }

  const usagePct = Math.min((usage.used / usage.limit) * 100, 100);
  const usageColor = usagePct >= 90 ? '#ef4444' : usagePct >= 80 ? '#f59e0b' : '#22c55e';
  const canGenerate = !loading && mensaje.trim().length > 0 && usage.remaining > 0;

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a', fontFamily: '"DM Sans", system-ui, sans-serif' }}>

      {/* Header */}
      <header
        className="sticky top-0 z-20"
        style={{
          background: 'rgba(10,10,10,0.9)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <div
          className="max-w-2xl mx-auto flex items-center justify-between"
          style={{ height: '64px', padding: '0 20px' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}
            >
              <span className="text-black text-sm font-syne font-bold">R</span>
            </div>
            <span className="font-syne font-bold text-white text-lg tracking-tight">RESPONDE</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[#737373] text-xs hidden sm:block">{initialData.user}</span>
            <button
              onClick={onLogout}
              className="flex items-center justify-center min-h-[44px] px-4 rounded-lg
                         text-[#a3a3a3] text-sm font-medium transition-all duration-200
                         hover:text-white"
              style={{ border: '1px solid rgba(255,255,255,0.12)' }}
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main id="main-content" className="max-w-2xl mx-auto px-4 py-6 md:px-6 space-y-4 pb-20">

        {/* Profile + Usage card */}
        <div
          className="rounded-xl p-6"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {/* Business identity */}
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="min-w-0 flex-1">
              <h2
                className="font-syne font-bold text-[#22c55e] truncate leading-tight"
                style={{ fontSize: '24px' }}
              >
                {profile?.nombre || 'Sin perfil configurado'}
              </h2>
              <p
                className="text-[#a3a3a3] mt-1 leading-snug"
                style={{
                  fontSize: '14px',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {profile?.descripcion || profile?.rubro || 'Completá tu perfil para mejores respuestas'}
              </p>
            </div>
            <button
              onClick={onEditProfile}
              className="flex items-center justify-center shrink-0 min-h-[44px] px-4 rounded-lg
                         text-sm font-medium text-[#a3a3a3] transition-all duration-200
                         hover:text-white"
              style={{ border: '1px solid rgba(255,255,255,0.12)' }}
            >
              Editar perfil
            </button>
          </div>

          {/* Usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[#737373]">
                ⚡ Generaciones · <span className="text-[#a3a3a3] font-medium">{initialData.plan}</span>
              </span>
              <span className="text-[13px] font-semibold" style={{ color: usageColor }}>
                {usage.used} / {usage.limit}
              </span>
            </div>
            <div className="rounded-full overflow-hidden" style={{ height: '8px', background: '#2a2a2a' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${usagePct}%`, background: usageColor }}
              />
            </div>
            <p className="text-[12px]" style={{ color: '#737373' }}>
              {usage.remaining} restante{usage.remaining !== 1 ? 's' : ''}
              {usagePct >= 90 && ' · ⚠️ Límite casi alcanzado'}
            </p>
          </div>
        </div>

        {/* Profile incomplete banner */}
        {showBanner && (
          <div
            className="rounded-xl p-4 flex items-center gap-4"
            style={{
              background: 'rgba(34,197,94,0.05)',
              border: '1px solid rgba(34,197,94,0.2)',
            }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">Mejorá tus respuestas</p>
              <p className="text-xs text-[#a3a3a3] mt-0.5">
                Completá tu perfil para que la IA conozca tu negocio.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onEditProfile}
                className="flex items-center justify-center min-h-[36px] px-3 rounded-lg
                           text-xs font-semibold text-black transition-all"
                style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}
              >
                Completar
              </button>
              <button
                onClick={() => setShowBanner(false)}
                aria-label="Cerrar"
                className="flex items-center justify-center w-8 h-8 rounded-lg
                           text-[#737373] hover:text-white transition-colors text-lg"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleGenerate} className="space-y-4">

          {/* Message input */}
          <div>
            <label
              htmlFor="gen-mensaje"
              className="block font-semibold text-white mb-2"
              style={{ fontSize: '15px' }}
            >
              Mensaje del cliente
            </label>
            <textarea
              id="gen-mensaje"
              value={mensaje}
              onChange={e => setMensaje(e.target.value)}
              disabled={loading}
              placeholder="Pegá o escribí el mensaje que recibiste por WhatsApp..."
              maxLength={500}
              rows={5}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.03)',
                border: `2px solid ${mensaje.length > 0 ? '#22c55e' : 'rgba(255,255,255,0.1)'}`,
                boxShadow: mensaje.length > 0 ? '0 0 0 4px rgba(34,197,94,0.08)' : 'none',
                borderRadius: '8px',
                padding: '16px',
                fontSize: '16px',
                color: '#ffffff',
                resize: 'none',
                outline: 'none',
                minHeight: '120px',
                touchAction: 'manipulation',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                opacity: loading ? 0.6 : 1,
                fontFamily: '"DM Sans", system-ui, sans-serif',
              }}
              className="placeholder-[#737373]"
            />
            <p className="text-right text-xs text-[#737373] mt-1">{mensaje.length}/500</p>
          </div>

          {/* Context toggle */}
          <button
            type="button"
            onClick={() => setShowContexto(v => !v)}
            className="flex items-center gap-2 w-full min-h-[44px] px-3 -mx-3
                       text-[#a3a3a3] text-sm hover:text-white transition-all duration-200
                       rounded-lg hover:bg-[rgba(255,255,255,0.04)]"
          >
            <span
              className="w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold shrink-0"
              style={{ border: '1px solid rgba(255,255,255,0.2)' }}
            >
              {showContexto ? '−' : '+'}
            </span>
            <span className="font-medium">
              {showContexto ? 'Ocultar contexto adicional' : 'Agregar contexto del momento'}
            </span>
            {!showContexto && (
              <span className="text-[#737373] text-xs">(opcional)</span>
            )}
          </button>

          {showContexto && (
            <div>
              <label
                htmlFor="gen-contexto"
                className="block text-sm font-medium text-[#a3a3a3] mb-1"
              >
                Contexto del momento
              </label>
              <p className="text-xs text-[#737373] mb-2">
                Stock actual, precios de hoy, promociones. La IA lo prioriza sobre todo.
              </p>
              <textarea
                id="gen-contexto"
                value={contexto}
                onChange={e => setContexto(e.target.value)}
                disabled={loading}
                placeholder="Ej: Nike Air Force talle 42 a 350mil. Envíos hoy hasta las 18hs."
                maxLength={500}
                rows={3}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '16px',
                  fontSize: '16px',
                  color: '#ffffff',
                  resize: 'none',
                  outline: 'none',
                  touchAction: 'manipulation',
                  fontFamily: '"DM Sans", system-ui, sans-serif',
                }}
                className="placeholder-[#737373] focus:border-brand transition-colors"
              />
              <p className="text-right text-xs text-[#737373] mt-1">{contexto.length}/500</p>
            </div>
          )}

          {/* Generate button */}
          <button
            type="submit"
            disabled={!canGenerate}
            style={{
              width: '100%',
              padding: '16px 24px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: canGenerate ? 'pointer' : 'not-allowed',
              background: canGenerate
                ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                : '#2a2a2a',
              color: canGenerate ? '#000000' : '#737373',
              boxShadow: canGenerate ? '0 4px 14px rgba(34,197,94,0.25)' : 'none',
              border: 'none',
              transition: 'all 0.2s ease',
              fontFamily: '"DM Sans", system-ui, sans-serif',
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Spinner /> Generando...
              </span>
            ) : '⚡ Generar respuesta'}
          </button>

        </form>

        {/* Error */}
        <div role="alert" aria-live="polite">
          {error && (
            <div
              className="rounded-xl px-4 py-4"
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.3)',
              }}
            >
              <p className="text-[#ef4444] text-sm">⚠️ {error}</p>
            </div>
          )}
        </div>

        {/* Response */}
        {respuesta && (
          <div
            ref={respuestaRef}
            aria-label="Respuesta generada"
            className="rounded-xl overflow-hidden"
            style={{
              background: 'rgba(34,197,94,0.04)',
              border: '1px solid rgba(34,197,94,0.2)',
            }}
          >
            {/* Response header */}
            <div
              className="flex items-center justify-between px-5 py-3"
              style={{ borderBottom: '1px solid rgba(34,197,94,0.12)' }}
            >
              <span className="text-sm font-semibold text-white">Respuesta generada</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 min-h-[36px] px-3 rounded-lg
                           text-sm font-medium transition-all duration-200"
                style={{
                  color: copied ? '#22c55e' : '#a3a3a3',
                  background: copied ? 'rgba(34,197,94,0.1)' : 'transparent',
                }}
              >
                {copied ? '✓ Copiado' : '📋 Copiar'}
              </button>
            </div>

            {/* Response text */}
            <div className="px-5 py-5">
              <p
                className="text-white whitespace-pre-wrap"
                style={{ fontSize: '16px', lineHeight: '1.65' }}
              >
                {respuesta}
              </p>
            </div>

            {/* Action buttons */}
            <div className="px-5 pb-5 space-y-3">
              <button
                onClick={handleCopy}
                className="w-full rounded-xl font-semibold text-sm text-black transition-all"
                style={{
                  padding: '14px 24px',
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  boxShadow: '0 4px 14px rgba(34,197,94,0.25)',
                }}
              >
                {copied ? '✓ Copiado' : '📋 Copiar respuesta'}
              </button>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(respuesta)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center w-full rounded-xl font-semibold text-sm
                           transition-all duration-200 min-h-[52px]"
                style={{
                  border: '1px solid rgba(34,197,94,0.4)',
                  color: '#22c55e',
                  background: 'transparent',
                }}
              >
                💬 Abrir en WhatsApp
              </a>

              <button
                onClick={handleNueva}
                className="w-full rounded-xl text-sm font-medium text-[#a3a3a3]
                           transition-all duration-200 hover:text-white min-h-[44px]"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}
              >
                Nueva consulta
              </button>
            </div>
          </div>
        )}

      </main>

      <ReportButton accessCode={accessCode} />
    </div>
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
