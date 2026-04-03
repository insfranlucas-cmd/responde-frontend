import { useState } from 'react';
import { generateResponse } from '../api';
import UsageBar from './UsageBar';

export default function GenerateScreen({ accessCode, initialData, onLogout }) {
  const [mensaje, setMensaje] = useState('');
  const [respuesta, setRespuesta] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [usage, setUsage] = useState(initialData.usage);

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
        tono: 'profesional',
        extension: 'corta',
      });
      setRespuesta(data.respuesta);
      setUsage(data.usage);
    } catch (err) {
      if (err.message.includes('límite') || err.message.includes('Límite')) {
        setError('Alcanzaste el límite diario. Volvé mañana a las 00:00 (Paraguay).');
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
    <div className="min-h-screen flex flex-col px-4 py-6 max-w-lg mx-auto w-full">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
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
      </div>

      {/* Usage bar */}
      <div className="mb-5">
        <UsageBar usage={usage} plan={initialData.plan} />
      </div>

      {/* Input form */}
      <form onSubmit={handleGenerate} className="space-y-3 mb-5">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Mensaje del cliente
          </label>
          <textarea
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
      {error && (
        <div className="bg-red-950 border border-red-800 rounded-xl px-4 py-3 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Response */}
      {respuesta && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
            <span className="text-xs font-medium text-zinc-400">Respuesta generada</span>
            <button
              onClick={handleCopy}
              className="text-xs font-medium text-brand hover:text-brand-dark transition-colors"
            >
              {copied ? '✓ Copiado' : 'Copiar'}
            </button>
          </div>
          <div className="px-4 py-4">
            <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{respuesta}</p>
          </div>
        </div>
      )}

    </div>
  );
}
