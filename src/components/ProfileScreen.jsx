import { useState } from 'react';
import { saveProfile } from '../api';

const FIELDS = [
  { key: 'nombre',   label: 'Nombre del negocio',       placeholder: 'Ej: Ferretería Don José' },
  { key: 'rubro',    label: 'Rubro',                    placeholder: 'Ej: Ferretería, ropa, comidas...' },
  { key: 'publico',  label: 'Público objetivo',         placeholder: 'Ej: Familias, jóvenes, empresas...' },
  { key: 'zona',     label: 'Zona / ciudad',            placeholder: 'Ej: Asunción, Buenos Aires...' },
  { key: 'horarios', label: 'Horarios de atención',     placeholder: 'Ej: Lun-Sáb 8 a 18hs' },
  { key: 'pagos',    label: 'Métodos de pago aceptados', placeholder: 'Ej: Efectivo, tarjeta, MercadoPago' },
];

export default function ProfileScreen({ accessCode, initialProfile, onSaved, onSkip }) {
  const [form, setForm] = useState({
    nombre:   initialProfile?.nombre   || '',
    rubro:    initialProfile?.rubro    || '',
    publico:  initialProfile?.publico  || '',
    zona:     initialProfile?.zona     || '',
    horarios: initialProfile?.horarios || '',
    pagos:    initialProfile?.pagos    || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!initialProfile;

  function handleChange(key, value) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nombre.trim()) {
      setError('El nombre del negocio es obligatorio.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const saved = await saveProfile(accessCode, form);
      onSaved(saved);
    } catch {
      setError('No se pudo guardar el perfil. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
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
        {onSkip && (
          <button
            onClick={onSkip}
            className="text-zinc-500 hover:text-zinc-300 text-xs transition-colors"
          >
            Omitir
          </button>
        )}
      </div>

      {/* Title */}
      <div className="mb-6">
        <h2 className="text-white text-lg font-semibold">
          {isEdit ? 'Editá tu perfil' : 'Configurá tu negocio'}
        </h2>
        <p className="text-zinc-400 text-sm mt-1">
          {isEdit
            ? 'Estos datos se inyectan automáticamente en cada respuesta.'
            : 'Completá estos datos una vez. Se usan para personalizar cada respuesta.'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {FIELDS.map(({ key, label, placeholder }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              {label}
              {key === 'nombre' && <span className="text-brand ml-1">*</span>}
            </label>
            <input
              type="text"
              value={form[key]}
              onChange={e => handleChange(key, e.target.value)}
              placeholder={placeholder}
              maxLength={150}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3
                         text-white placeholder-zinc-600 text-sm
                         focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand
                         transition-colors"
            />
          </div>
        ))}

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand hover:bg-brand-dark disabled:bg-zinc-700 disabled:cursor-not-allowed
                     text-black font-semibold rounded-xl py-3 text-sm transition-colors mt-2"
        >
          {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Guardar y continuar'}
        </button>
      </form>

    </div>
  );
}
