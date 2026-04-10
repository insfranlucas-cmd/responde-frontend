import { useState, useRef } from 'react';
import { LogOut, Pencil, Zap, MessageCircle, Copy, RotateCcw, Plus, Minus } from 'lucide-react';
import { generateResponse } from '../api';
import ReportButton from './ReportButton';

export default function GenerateScreen({ accessCode, initialData, profile, onEditProfile, onLogout }) {
  const [mensaje, setMensaje]       = useState('');
  const [contexto, setContexto]     = useState('');
  const [respuesta, setRespuesta]   = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [copied, setCopied]         = useState(false);
  const respuestaRef                = useRef(null);
  const [usage, setUsage]           = useState(initialData.usage);
  const [showContexto, setShowContexto] = useState(false);

  // Profile completeness — show CTA if < 6 out of 7 fields filled (~80%)
  const profileIncomplete = (() => {
    const p = profile || {};
    const filled =
      [p.nombre, p.rubro, p.descripcion, p.horarios, p.pagos]
        .filter(v => typeof v === 'string' && v.trim().length > 0).length
      + (Array.isArray(p.preguntas_frecuentes) && p.preguntas_frecuentes.length > 0 ? 1 : 0)
      + (Array.isArray(p.items) && p.items.length > 0 ? 1 : 0);
    return filled < 6;
  })();

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
    if (navigator.vibrate) navigator.vibrate(50);
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
  const progressGradient =
    usagePct >= 90 ? 'linear-gradient(90deg, #FF4444, #CC0000)'
    : usagePct >= 80 ? 'linear-gradient(90deg, #FFB020, #FF8C00)'
    : 'linear-gradient(90deg, #00D66C, #00A854)';
  const usageCountColor =
    usagePct >= 90 ? '#FF4444' : usagePct >= 80 ? '#FFB020' : '#00D66C';
  const canGenerate = !loading && mensaje.trim().length > 0 && usage.remaining > 0;

  return (
    <div className="min-h-screen" style={{ background: '#000000', fontFamily: '"DM Sans", system-ui, sans-serif' }}>

      {/* Header */}
      <header
        className="sticky top-0 z-20"
        style={{
          background: 'rgba(0,0,0,0.9)',
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
              style={{ background: '#00D66C' }}
            >
              <span className="text-black text-sm font-bold">R</span>
            </div>
            <span className="font-semibold text-white text-base">RESPONDE</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[#808080] text-xs hidden sm:block">{initialData.user}</span>
            <button
              onClick={onLogout}
              className="flex items-center justify-center px-4 rounded-lg
                         text-[#B3B3B3] text-sm font-medium transition-all duration-200
                         hover:text-white"
              style={{ border: '1px solid rgba(255,255,255,0.12)', minHeight: '44px', gap: '6px' }}
            >
              <LogOut size={18} />
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main id="main-content" className="max-w-2xl mx-auto px-4 py-6 md:px-6 space-y-4 pb-20">

        {/* ── Profile card ── */}
        <div
          className="rounded-xl p-6"
          style={{
            background: '#0F0F0F',
            border: '1px solid rgba(255,255,255,0.08)',
            position: 'relative',
          }}
        >
          {/* Edit icon — top-right corner */}
          <button
            onClick={onEditProfile}
            aria-label="Editar perfil del negocio"
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              width: '36px',
              height: '36px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#808080',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(0, 214, 108, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(0, 214, 108, 0.3)';
              e.currentTarget.style.color = '#00D66C';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.color = '#808080';
            }}
          >
            <Pencil size={16} />
          </button>

          {/* Business name */}
          <h2
            style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#00D66C',
              letterSpacing: '-0.02em',
              lineHeight: '1.2',
              marginBottom: '8px',
              paddingRight: '50px',
            }}
          >
            {profile?.nombre || 'Sin perfil configurado'}
          </h2>

          {/* Business description */}
          <p
            style={{
              fontSize: '14px',
              color: '#B3B3B3',
              lineHeight: '1.5',
              marginBottom: '20px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {profile?.descripcion || profile?.rubro || 'Completá tu perfil para mejores respuestas'}
          </p>

          {/* Usage */}
          <div>
            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: '#808080' }}>
                ⚡ Generaciones · <span style={{ color: '#B3B3B3', fontWeight: '500' }}>{initialData.plan}</span>
              </span>
              <span style={{ fontSize: '18px', fontWeight: '700', color: usageCountColor }}>
                {usage.used} / {usage.limit}
              </span>
            </div>

            {/* Progress bar */}
            <div
              style={{
                height: '10px',
                background: 'rgba(255,255,255,0.08)',
                borderRadius: '999px',
                overflow: 'hidden',
                position: 'relative',
                marginBottom: '8px',
              }}
            >
              <div
                className="progress-shimmer"
                style={{
                  height: '100%',
                  width: `${usagePct}%`,
                  background: progressGradient,
                  borderRadius: '999px',
                  transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            </div>

            {/* Meta */}
            <p style={{ fontSize: '12px', color: '#808080', display: 'flex', gap: '12px' }}>
              <span>{usage.remaining} restante{usage.remaining !== 1 ? 's' : ''}</span>
              {usagePct >= 90 && <span>⏰ Límite casi alcanzado</span>}
            </p>
          </div>
        </div>

        {/* ── Complete profile CTA (only if < 80% filled) ── */}
        {profileIncomplete && (
          <button
            onClick={onEditProfile}
            className="transition-all duration-200"
            style={{
              width: '100%',
              minHeight: '48px',
              padding: '14px 24px',
              background: 'rgba(255, 176, 32, 0.1)',
              border: '2px solid rgba(255, 176, 32, 0.3)',
              color: '#FFB020',
              fontSize: '14px',
              fontWeight: '600',
              borderRadius: '12px',
              cursor: 'pointer',
              fontFamily: '"DM Sans", system-ui, sans-serif',
            }}
          >
            ⚠️ Completar perfil para respuestas más precisas
          </button>
        )}

        {/* ── Form ── */}
        <form onSubmit={handleGenerate} className="space-y-4">

          {/* Message textarea */}
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
                background: '#0F0F0F',
                border: `2px solid ${mensaje.length > 0 ? '#00D66C' : 'rgba(255,255,255,0.1)'}`,
                boxShadow: mensaje.length > 0 ? '0 0 0 4px rgba(0, 214, 108, 0.08)' : 'none',
                borderRadius: '12px',
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
              className="placeholder-[#808080]"
            />
            <p className="text-right text-xs mt-1" style={{ color: '#808080' }}>{mensaje.length}/500</p>
          </div>

          {/* Context toggle */}
          <button
            type="button"
            onClick={() => setShowContexto(v => !v)}
            className="flex items-center gap-2 w-full -mx-3 px-3 rounded-lg transition-all duration-200"
            style={{ color: '#B3B3B3', fontSize: '14px', minHeight: '44px' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#ffffff'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#B3B3B3'; }}
          >
            <span
              className="w-5 h-5 flex items-center justify-center rounded-full shrink-0"
              style={{ border: '1px solid rgba(255,255,255,0.2)' }}
            >
              {showContexto ? <Minus size={12} /> : <Plus size={12} />}
            </span>
            <span className="font-medium">
              {showContexto ? 'Ocultar contexto adicional' : 'Agregar contexto del momento'}
            </span>
            {!showContexto && (
              <span style={{ color: '#808080', fontSize: '12px' }}>(opcional)</span>
            )}
          </button>

          {showContexto && (
            <div>
              <label
                htmlFor="gen-contexto"
                className="block font-medium mb-1"
                style={{ fontSize: '14px', color: '#B3B3B3' }}
              >
                Contexto del momento
              </label>
              <p className="text-xs mb-2" style={{ color: '#808080' }}>
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
                  background: '#0F0F0F',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '16px',
                  fontSize: '16px',
                  color: '#ffffff',
                  resize: 'none',
                  outline: 'none',
                  touchAction: 'manipulation',
                  fontFamily: '"DM Sans", system-ui, sans-serif',
                }}
                className="placeholder-[#808080] focus:border-[#00D66C] transition-colors"
              />
              <p className="text-right text-xs mt-1" style={{ color: '#808080' }}>{contexto.length}/500</p>
            </div>
          )}

          {/* Generate button */}
          <button
            type="submit"
            disabled={!canGenerate}
            className={loading ? 'btn-generating' : ''}
            style={{
              width: '100%',
              minHeight: '56px',
              padding: '18px 24px',
              borderRadius: '16px',
              fontSize: '16px',
              fontWeight: '700',
              border: 'none',
              cursor: canGenerate ? 'pointer' : 'not-allowed',
              background: canGenerate
                ? 'linear-gradient(135deg, #00D66C 0%, #00A854 100%)'
                : '#1A1A1A',
              color: canGenerate ? '#000000' : '#4D4D4D',
              boxShadow: canGenerate ? '0 6px 20px rgba(0, 214, 108, 0.35)' : 'none',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontFamily: '"DM Sans", system-ui, sans-serif',
            }}
            onMouseEnter={e => {
              if (!canGenerate || loading) return;
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 214, 108, 0.45)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = canGenerate ? '0 6px 20px rgba(0, 214, 108, 0.35)' : 'none';
            }}
          >
            {loading ? (
              <><Spinner /> Generando...</>
            ) : <><Zap size={20} /> Generar respuesta</>}
          </button>

        </form>

        {/* Error */}
        <div role="alert" aria-live="polite">
          {error && (
            <div
              className="rounded-xl px-4 py-4"
              style={{
                background: 'rgba(255,68,68,0.08)',
                border: '1px solid rgba(255,68,68,0.3)',
              }}
            >
              <p className="text-sm" style={{ color: '#FF4444' }}>⚠️ {error}</p>
            </div>
          )}
        </div>

        {/* ── Response card ── */}
        {respuesta && (
          <div
            ref={respuestaRef}
            aria-label="Respuesta generada"
            className="response-appear"
            style={{
              background: 'linear-gradient(to bottom, rgba(0, 214, 108, 0.08) 0%, rgba(0, 214, 108, 0.02) 100%)',
              border: '2px solid rgba(0, 214, 108, 0.3)',
              borderRadius: '16px',
              padding: '24px',
              marginTop: '8px',
              boxShadow: '0 8px 32px rgba(0, 214, 108, 0.15)',
            }}
          >
            {/* Response header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '16px', fontWeight: '600', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ✨ Respuesta generada
              </span>
            </div>

            {/* Response text — with left border accent */}
            <div
              style={{
                background: '#0F0F0F',
                borderLeft: '4px solid #00D66C',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '20px',
              }}
            >
              <p
                style={{
                  fontSize: '16px',
                  lineHeight: '1.6',
                  color: '#FFFFFF',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  margin: 0,
                }}
              >
                {respuesta}
              </p>
            </div>

            {/* Action buttons — 3-column grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {/* WhatsApp — primary */}
              <a
                href={`https://wa.me/?text=${encodeURIComponent(respuesta)}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  minHeight: '48px',
                  padding: '14px',
                  background: '#00D66C',
                  color: '#000000',
                  border: '1px solid #00D66C',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <MessageCircle size={18} /> WhatsApp
              </a>

              {/* Copy */}
              <button
                onClick={handleCopy}
                style={{
                  minHeight: '48px',
                  padding: '14px',
                  background: copied ? '#00A854' : '#1A1A1A',
                  color: copied ? '#FFFFFF' : '#B3B3B3',
                  border: `1px solid ${copied ? '#00A854' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: '"DM Sans", system-ui, sans-serif',
                }}
              >
                {copied ? '✓ Copiado' : <><Copy size={16} /> Copiar</>}
              </button>

              {/* Nueva */}
              <button
                onClick={handleNueva}
                style={{
                  minHeight: '48px',
                  padding: '14px',
                  background: '#1A1A1A',
                  color: '#B3B3B3',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: '"DM Sans", system-ui, sans-serif',
                }}
              >
                <RotateCcw size={16} /> Nueva
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
