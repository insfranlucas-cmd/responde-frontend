import { useState } from 'react';
import { saveProfile } from '../api';

const PAGOS_OPTS = [
  'Efectivo', 'Transferencia', 'Tarjeta débito',
  'Tarjeta crédito', 'Mercado Pago', 'Otro'
];

function pct(form) {
  const level1 = [
    form.nombre, form.rubro, form.productos, form.precios,
    form.pagos, form.horarios, form.telefono,
    form.delivery_activo ? (form.delivery_zona || '') : 'ok'
  ];
  const level2 = [form.maps, form.instagram, form.devoluciones, form.garantia, form.marcas];
  const level3 = [form.nombre_encargado, form.frase_diferencial, form.objeciones, form.descuentos];
  const all = [...level1, ...level2, ...level3];
  const filled = all.filter(v => v && String(v).trim()).length;
  return Math.round((filled / all.length) * 100);
}

function Section({ title, children }) {
  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{title}</p>
      {children}
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-300 mb-1.5">
        {label}{required && <span className="text-brand ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = `w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3
  text-white placeholder-zinc-600 text-sm
  focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors`;

const textareaCls = `${inputCls} resize-none`;

export default function ProfileScreen({ accessCode, initialProfile, onSaved, onSkip }) {
  const [form, setForm] = useState({
    nombre:            initialProfile?.nombre            || '',
    rubro:             initialProfile?.rubro             || '',
    productos:         initialProfile?.productos         || '',
    precios:           initialProfile?.precios           || '',
    pagos:             initialProfile?.pagos             || '',
    delivery_activo:   initialProfile?.delivery_activo   ?? false,
    delivery_zona:     initialProfile?.delivery_zona     || '',
    delivery_tiempo:   initialProfile?.delivery_tiempo   || '',
    horarios:          initialProfile?.horarios          || '',
    telefono:          initialProfile?.telefono          || '',
    maps:              initialProfile?.maps              || '',
    instagram:         initialProfile?.instagram         || '',
    devoluciones:      initialProfile?.devoluciones      || '',
    garantia:          initialProfile?.garantia          || '',
    marcas:            initialProfile?.marcas            || '',
    nombre_encargado:  initialProfile?.nombre_encargado  || '',
    frase_diferencial: initialProfile?.frase_diferencial || '',
    objeciones:        initialProfile?.objeciones        || '',
    descuentos:        initialProfile?.descuentos        || '',
  });

  const [pagosSelected, setPagosSelected] = useState(() => {
    const saved = initialProfile?.pagos || '';
    return PAGOS_OPTS.filter(o => saved.includes(o));
  });

  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const isEdit = !!initialProfile;
  const progress = pct(form);

  function set(key, value) {
    setForm(f => ({ ...f, [key]: value }));
  }

  function togglePago(opt) {
    const next = pagosSelected.includes(opt)
      ? pagosSelected.filter(p => p !== opt)
      : [...pagosSelected, opt];
    setPagosSelected(next);
    set('pagos', next.join(', '));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nombre.trim()) { setError('El nombre del negocio es obligatorio.'); return; }
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

  const progressColor = progress < 40 ? 'bg-red-500' : progress < 70 ? 'bg-yellow-500' : 'bg-brand';

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
          <button onClick={onSkip} className="text-zinc-500 hover:text-zinc-300 text-xs transition-colors">
            Omitir
          </button>
        )}
      </div>

      {/* Title */}
      <div className="mb-5">
        <h2 className="text-white text-lg font-semibold">
          {isEdit ? 'Editá tu perfil' : 'Configurá tu negocio'}
        </h2>
        <p className="text-zinc-400 text-sm mt-1">
          Completá estos datos para que las respuestas sean precisas.
        </p>
      </div>

      {/* Progress bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 mb-6 space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-zinc-400">Perfil <span className="font-semibold text-white">{progress}% completo</span></span>
          <span className="text-zinc-500">
            {progress < 40 ? 'Las respuestas serán genéricas' : progress < 70 ? 'Buenas respuestas' : 'Respuestas precisas'}
          </span>
        </div>
        <div className="w-full bg-zinc-800 rounded-full h-1.5">
          <div className={`h-1.5 rounded-full transition-all duration-300 ${progressColor}`} style={{ width: `${progress}%` }} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* NIVEL 1 */}
        <Section title="Información principal">

          <Field label="Nombre del negocio" required>
            <input type="text" value={form.nombre} onChange={e => set('nombre', e.target.value)}
              placeholder="Ej: Ferretería Don José" maxLength={150} className={inputCls} />
          </Field>

          <Field label="Rubro" required>
            <input type="text" value={form.rubro} onChange={e => set('rubro', e.target.value)}
              placeholder="Ej: Ferretería, ropa de mujer, comidas..." maxLength={150} className={inputCls} />
          </Field>

          <Field label="Productos / servicios principales">
            <textarea value={form.productos} onChange={e => set('productos', e.target.value)}
              placeholder="Ej: Vendo ropa de mujer, tallas S a XL, marcas locales e importadas"
              rows={3} maxLength={500} className={textareaCls} />
          </Field>

          <Field label="Rango de precios">
            <textarea value={form.precios} onChange={e => set('precios', e.target.value)}
              placeholder="Ej: Remeras desde $15.000, pantalones desde $35.000"
              rows={2} maxLength={300} className={textareaCls} />
          </Field>

          <Field label="Métodos de pago">
            <div className="flex flex-wrap gap-2">
              {PAGOS_OPTS.map(opt => (
                <button key={opt} type="button" onClick={() => togglePago(opt)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors
                    ${pagosSelected.includes(opt)
                      ? 'bg-brand text-black border-brand'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500'}`}>
                  {opt}
                </button>
              ))}
            </div>
          </Field>

          {/* Delivery toggle */}
          <Field label="Hacemos delivery">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => set('delivery_activo', !form.delivery_activo)}
                className={`relative w-11 h-6 rounded-full transition-colors ${form.delivery_activo ? 'bg-brand' : 'bg-zinc-700'}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform
                  ${form.delivery_activo ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
              <span className="text-sm text-zinc-300">{form.delivery_activo ? 'Sí' : 'No'}</span>
            </div>
            {form.delivery_activo && (
              <div className="mt-3 space-y-3">
                <input type="text" value={form.delivery_zona} onChange={e => set('delivery_zona', e.target.value)}
                  placeholder="Zona de cobertura (ej: Capital y Gran Buenos Aires)"
                  maxLength={200} className={inputCls} />
                <input type="text" value={form.delivery_tiempo} onChange={e => set('delivery_tiempo', e.target.value)}
                  placeholder="Tiempo estimado (ej: 24-48hs, mismo día)"
                  maxLength={100} className={inputCls} />
              </div>
            )}
          </Field>

          <Field label="Horarios de atención">
            <input type="text" value={form.horarios} onChange={e => set('horarios', e.target.value)}
              placeholder="Ej: Lun-Sáb 9 a 18hs" maxLength={150} className={inputCls} />
          </Field>

          <Field label="WhatsApp / teléfono">
            <input type="text" value={form.telefono} onChange={e => set('telefono', e.target.value)}
              placeholder="Ej: +54 9 11 1234-5678" maxLength={50} className={inputCls} />
          </Field>

        </Section>

        {/* NIVELES 2 y 3 — colapsable */}
        <div>
          <button type="button" onClick={() => setExpanded(v => !v)}
            className="w-full flex items-center justify-between bg-zinc-900 border border-zinc-800
                       hover:border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-300 transition-colors">
            <span>Completar perfil avanzado</span>
            <span className="text-zinc-500 text-xs">{expanded ? '↑ Cerrar' : '↓ Expandir'}</span>
          </button>

          {expanded && (
            <div className="mt-4 space-y-6 border border-zinc-800 rounded-xl p-4">

              <Section title="Nivel 2 — Recomendado">
                <Field label="Link Google Maps o dirección exacta">
                  <input type="text" value={form.maps} onChange={e => set('maps', e.target.value)}
                    placeholder="Ej: https://maps.app.goo.gl/..." maxLength={300} className={inputCls} />
                </Field>
                <Field label="Instagram o sitio web">
                  <input type="text" value={form.instagram} onChange={e => set('instagram', e.target.value)}
                    placeholder="Ej: @minegocio o www.minegocio.com" maxLength={150} className={inputCls} />
                </Field>
                <Field label="Política de cambios / devoluciones">
                  <textarea value={form.devoluciones} onChange={e => set('devoluciones', e.target.value)}
                    placeholder="Ej: Cambios dentro de los 7 días con ticket de compra"
                    rows={2} maxLength={300} className={textareaCls} />
                </Field>
                <Field label="Garantía ofrecida">
                  <input type="text" value={form.garantia} onChange={e => set('garantia', e.target.value)}
                    placeholder="Ej: 6 meses en productos electrónicos" maxLength={200} className={inputCls} />
                </Field>
                <Field label="Marcas que manejamos">
                  <input type="text" value={form.marcas} onChange={e => set('marcas', e.target.value)}
                    placeholder="Ej: Nike, Adidas, marcas nacionales" maxLength={200} className={inputCls} />
                </Field>
              </Section>

              <Section title="Nivel 3 — Avanzado">
                <Field label="Nombre del dueño / encargado">
                  <input type="text" value={form.nombre_encargado} onChange={e => set('nombre_encargado', e.target.value)}
                    placeholder="Ej: María" maxLength={100} className={inputCls} />
                </Field>
                <Field label="Frase diferencial del negocio">
                  <input type="text" value={form.frase_diferencial} onChange={e => set('frase_diferencial', e.target.value)}
                    placeholder="Ej: Somos el único local de la zona con stock inmediato"
                    maxLength={200} className={inputCls} />
                </Field>
                <Field label="Objeciones frecuentes y cómo manejarlas">
                  <textarea value={form.objeciones} onChange={e => set('objeciones', e.target.value)}
                    placeholder={'Ej: Cuando dicen "está caro" respondo que nuestros productos tienen garantía y envío gratis'}
                    rows={3} maxLength={400} className={textareaCls} />
                </Field>
                <Field label="Política de descuentos por volumen">
                  <textarea value={form.descuentos} onChange={e => set('descuentos', e.target.value)}
                    placeholder="Ej: 10% de descuento comprando 3 o más unidades"
                    rows={2} maxLength={300} className={textareaCls} />
                </Field>
              </Section>

            </div>
          )}
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button type="submit" disabled={loading}
          className="w-full bg-brand hover:bg-brand-dark disabled:bg-zinc-700 disabled:cursor-not-allowed
                     text-black font-semibold rounded-xl py-3 text-sm transition-colors">
          {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Guardar y continuar'}
        </button>

      </form>
    </div>
  );
}
