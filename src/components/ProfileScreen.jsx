import { useState } from 'react';
import { saveProfile } from '../api';
import ReportButton from './ReportButton';

// ─── helpers ────────────────────────────────────────────────
const PAGOS_OPTS = ['Efectivo','Transferencia','Tarjeta débito','Tarjeta crédito','Mercado Pago','Tigo Money','Personal Pay','Otro'];
const TONO_OPTS  = [{ val:'formal', label:'Formal' }, { val:'cercano', label:'Cercano' }, { val:'muy_informal', label:'Muy informal' }];

function filled(v) {
  if (v === null || v === undefined) return false;
  if (typeof v === 'boolean') return true;
  if (Array.isArray(v)) return v.length > 0;
  return String(v).trim().length > 0;
}

function sectionProgress(fields) {
  const f = fields.filter(filled).length;
  return { f, t: fields.length };
}

function Badge({ f, t }) {
  const pct = t === 0 ? 0 : Math.round((f / t) * 100);
  const cls = pct === 100 ? 'text-brand' : pct > 50 ? 'text-yellow-400' : 'text-zinc-500';
  return <span className={`text-xs font-medium ${cls}`}>{f}/{t}</span>;
}

function SectionHeader({ title, badge, open, toggle, categoryBadge, subtitle }) {
  return (
    <div>
      <button type="button" onClick={toggle}
        className="w-full flex items-center justify-between py-3 text-left">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-zinc-200">{title}</span>
          {categoryBadge}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge {...badge} />
          <span className="text-zinc-500 text-xs">{open ? '↑' : '↓'}</span>
        </div>
      </button>
      {!open && subtitle && (
        <p className="text-zinc-500 text-xs pb-2.5 -mt-1">{subtitle}</p>
      )}
    </div>
  );
}

const inputCls = `w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white
  placeholder-zinc-600 text-sm focus:outline-none focus:border-brand focus:ring-1
  focus:ring-brand transition-colors`;
const textareaCls = `${inputCls} resize-none`;

function Field({ label, required, hint, htmlFor, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-zinc-300 mb-1.5">
        {label}{required && <span className="text-brand ml-1">*</span>}
        {hint && <span className="text-zinc-600 font-normal ml-1">({hint})</span>}
      </label>
      {children}
    </div>
  );
}

// ─── Dynamic item list ───────────────────────────────────────
function ItemList({ items, onChange }) {
  function update(i, key, val) {
    const next = items.map((it, idx) => idx === i ? { ...it, [key]: val } : it);
    onChange(next);
  }
  function add() {
    if (items.length < 10) onChange([...items, { nombre: '', precio: '' }]);
  }
  function remove(i) { onChange(items.filter((_, idx) => idx !== i)); }

  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="flex gap-2 items-start">
          <input type="text" value={it.nombre} onChange={e => update(i, 'nombre', e.target.value)}
            placeholder="Nombre del producto/servicio" maxLength={100}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white
                       placeholder-zinc-600 text-sm focus:outline-none focus:border-brand transition-colors" />
          <input type="text" value={it.precio} onChange={e => update(i, 'precio', e.target.value)}
            placeholder="Precio (opcional)" maxLength={30}
            className="w-28 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white
                       placeholder-zinc-600 text-sm focus:outline-none focus:border-brand transition-colors" />
          <button type="button" onClick={() => remove(i)}
            className="text-zinc-600 hover:text-red-400 text-lg leading-none pt-2 transition-colors">×</button>
        </div>
      ))}
      {items.length < 10 && (
        <button type="button" onClick={add}
          className="text-brand text-sm hover:text-brand-dark transition-colors">+ Agregar producto</button>
      )}
    </div>
  );
}

// ─── Dynamic FAQ list ────────────────────────────────────────
function FAQList({ faqs, onChange }) {
  function update(i, key, val) {
    const next = faqs.map((f, idx) => idx === i ? { ...f, [key]: val } : f);
    onChange(next);
  }
  function add() {
    if (faqs.length < 5) onChange([...faqs, { pregunta: '', respuesta: '' }]);
  }
  function remove(i) { onChange(faqs.filter((_, idx) => idx !== i)); }

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500">Pregunta {i + 1}</span>
            <button type="button" onClick={() => remove(i)}
              className="text-zinc-600 hover:text-red-400 text-sm transition-colors">Eliminar</button>
          </div>
          <input type="text" value={faq.pregunta} onChange={e => update(i, 'pregunta', e.target.value)}
            placeholder="¿Cuál es la pregunta frecuente?" maxLength={200}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white
                       placeholder-zinc-600 text-sm focus:outline-none focus:border-brand transition-colors" />
          <textarea value={faq.respuesta} onChange={e => update(i, 'respuesta', e.target.value)}
            placeholder="¿Cómo la respondés?" rows={2} maxLength={300}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white
                       placeholder-zinc-600 text-sm resize-none focus:outline-none focus:border-brand transition-colors" />
        </div>
      ))}
      {faqs.length < 5 && (
        <button type="button" onClick={add}
          className="text-brand text-sm hover:text-brand-dark transition-colors">+ Agregar pregunta frecuente</button>
      )}
    </div>
  );
}

// ─── Toggle ──────────────────────────────────────────────────
function Toggle({ value, onChange, label, id }) {
  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onChange(!value);
    }
  }
  return (
    <div className="flex items-center gap-3">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        onKeyDown={handleKeyDown}
        className={`relative w-11 h-6 rounded-full transition-colors ${value ? 'bg-brand' : 'bg-zinc-700'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform
          ${value ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
      <span className="text-sm text-zinc-300">{label || (value ? 'Sí' : 'No')}</span>
    </div>
  );
}

// ─── Overall progress ────────────────────────────────────────
function overallPct(form) {
  const fields = [
    form.nombre, form.rubro, form.descripcion, form.nombre_titular,
    form.whatsapp || form.telefono, form.email, form.direccion,
    form.horarios, form.pagos, form.politica_entregas,
    form.items?.length > 0, form.preguntas_frecuentes?.length > 0,
    form.tono_respuesta,
  ];
  const f = fields.filter(filled).length;
  return Math.round((f / fields.length) * 100);
}

// ─── Quick Setup (first access) ─────────────────────────────
function QuickSetupScreen({ form, set, loading, error, onSave, onFullForm }) {
  return (
    <main id="main-content" className="min-h-screen flex flex-col px-4 py-6 max-w-lg mx-auto w-full">
      <header className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
          <span className="text-black text-sm font-bold">R</span>
        </div>
        <span className="text-white font-semibold">RESPONDE</span>
      </header>

      <div className="mb-6">
        <h2 className="text-white text-xl font-bold mb-2">⚡ La IA necesita saber esto</h2>
        <p className="text-zinc-400 text-sm leading-relaxed">
          Solo 2 datos para tu primera respuesta.<br />
          El resto lo completás después para mejorar la calidad.
        </p>
      </div>

      <form onSubmit={onSave} className="space-y-4">
        <Field label="Nombre del negocio" required htmlFor="qs-nombre">
          <input id="qs-nombre" type="text" value={form.nombre} onChange={e => set('nombre', e.target.value)}
            placeholder="Ej: Distribuidora El Progreso" maxLength={150} className={inputCls} autoFocus />
        </Field>
        <Field label="Rubro" required htmlFor="qs-rubro">
          <input id="qs-rubro" type="text" value={form.rubro} onChange={e => set('rubro', e.target.value)}
            placeholder="Ej: Venta mayorista de insumos de limpieza" maxLength={150} className={inputCls} />
        </Field>
        <Field label="Descripción breve" hint="opcional" htmlFor="qs-descripcion">
          <textarea id="qs-descripcion" value={form.descripcion} onChange={e => set('descripcion', e.target.value)}
            placeholder={"Contá brevemente qué hace tu negocio y qué lo diferencia.\nEj: Distribuidora de productos de limpieza para hogares y comercios."}
            rows={3} maxLength={300} className={textareaCls} />
        </Field>

        <p role="alert" aria-live="polite" className="text-red-400 text-sm min-h-[1.25rem]">{error}</p>

        <div className="pt-2 space-y-3">
          <button type="submit" disabled={loading}
            className="w-full bg-brand hover:bg-brand-dark disabled:bg-zinc-700 disabled:cursor-not-allowed
                       text-black font-semibold rounded-xl py-3 text-sm transition-colors">
            {loading ? 'Guardando...' : 'Guardar y generar mi primera respuesta →'}
          </button>
          <div className="text-center">
            <button type="button" onClick={onFullForm}
              className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors underline underline-offset-2">
              Completar perfil completo
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}

// ─── Main component ──────────────────────────────────────────
export default function ProfileScreen({ accessCode, initialProfile, welcome, onSaved, onSkip }) {
  const ip = initialProfile || {};

  const [form, setForm] = useState({
    // A
    nombre: ip.nombre || '', rubro: ip.rubro || '',
    descripcion: ip.descripcion || '', nombre_titular: ip.nombre_titular || '',
    // B
    whatsapp: ip.whatsapp || '', telefono: ip.telefono || '',
    telefono_alt: ip.telefono_alt || '', email: ip.email || '',
    direccion: ip.direccion || '', maps: ip.maps || '',
    sitio_web: ip.sitio_web || '', instagram: ip.instagram || '', facebook: ip.facebook || '',
    // C
    horarios: ip.horarios || '', pagos: ip.pagos || '',
    politica_entregas: ip.politica_entregas || '',
    delivery_activo: ip.delivery_activo ?? false,
    delivery_zona: ip.delivery_zona || '', delivery_tiempo: ip.delivery_tiempo || '',
    emite_factura: ip.emite_factura ?? false, ruc: ip.ruc || '',
    tiempo_respuesta: ip.tiempo_respuesta || '',
    condiciones_mayorista: ip.condiciones_mayorista || '',
    devoluciones: ip.devoluciones || '', garantia: ip.garantia || '',
    // D
    marcas: ip.marcas || '',
    // E
    tono_respuesta: ip.tono_respuesta || 'cercano',
    usar_emojis: ip.usar_emojis ?? true,
    restricciones: ip.restricciones || '', mensaje_bienvenida: ip.mensaje_bienvenida || '',
    // legacy
    nombre_encargado: ip.nombre_encargado || '', frase_diferencial: ip.frase_diferencial || '',
    objeciones: ip.objeciones || '', descuentos: ip.descuentos || '',
    productos: ip.productos || '', precios: ip.precios || '',
  });

  const [items, setItems] = useState(
    Array.isArray(ip.items) ? ip.items : []
  );
  const [faqs, setFaqs] = useState(
    Array.isArray(ip.preguntas_frecuentes) ? ip.preguntas_frecuentes : []
  );
  const [pagosSelected, setPagosSelected] = useState(() => {
    const saved = ip.pagos || '';
    return PAGOS_OPTS.filter(o => saved.includes(o));
  });

  const [open, setOpen] = useState({ A: true, B: false, C: false, D: false, E: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showQuickSetup, setShowQuickSetup] = useState(welcome?.type === 'first');
  const isEdit = !!initialProfile;
  const progress = overallPct(form);

  function set(key, value) { setForm(f => ({ ...f, [key]: value })); }
  function toggle(section) { setOpen(o => ({ ...o, [section]: !o[section] })); }

  function togglePago(opt) {
    const next = pagosSelected.includes(opt)
      ? pagosSelected.filter(p => p !== opt)
      : [...pagosSelected, opt];
    setPagosSelected(next);
    set('pagos', next.join(', '));
  }

  async function handleQuickSetup(e) {
    e.preventDefault();
    if (!form.nombre.trim()) { setError('El nombre del negocio es obligatorio.'); return; }
    if (!form.rubro.trim()) { setError('El rubro es obligatorio.'); return; }
    setLoading(true);
    setError('');
    try {
      const saved = await saveProfile(accessCode, {
        nombre: form.nombre, rubro: form.rubro, descripcion: form.descripcion,
      });
      onSaved(saved);
    } catch {
      setError('No se pudo guardar el perfil. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nombre.trim()) { setError('El nombre del negocio es obligatorio.'); return; }
    setLoading(true);
    setError('');
    try {
      const itemsLimpios = items.filter(it => it.nombre.trim() !== '');
      const faqsLimpios = faqs.filter(f => f.pregunta.trim() !== '' || f.respuesta.trim() !== '');
      const payload = { ...form, items: itemsLimpios, preguntas_frecuentes: faqsLimpios };
      const saved = await saveProfile(accessCode, payload);
      onSaved(saved);
    } catch {
      setError('No se pudo guardar el perfil. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  const progColor = progress < 40 ? 'bg-red-500' : progress < 70 ? 'bg-yellow-500' : 'bg-brand';

  // Section badges
  const bA = sectionProgress([form.nombre, form.rubro, form.descripcion, form.nombre_titular, form.horarios, form.emite_factura]);
  const bB = sectionProgress([form.whatsapp || form.telefono, form.email, form.direccion, form.maps, form.instagram, form.sitio_web]);
  const bC = sectionProgress([form.pagos, form.politica_entregas, form.delivery_activo, form.tiempo_respuesta]);
  const bD = sectionProgress([items.length > 0 || form.marcas, form.marcas, faqs.length > 0]);
  const bE = sectionProgress([form.tono_respuesta, form.restricciones, form.mensaje_bienvenida]);

  const divider = <div className="border-t border-zinc-800" />;

  if (showQuickSetup) {
    return (
      <QuickSetupScreen
        form={form}
        set={set}
        loading={loading}
        error={error}
        onSave={handleQuickSetup}
        onFullForm={() => { setShowQuickSetup(false); setError(''); }}
      />
    );
  }

  return (
    <main id="main-content" className="min-h-screen flex flex-col px-4 py-6 max-w-lg mx-auto w-full">

      {/* Header */}
      <header className="flex items-center justify-between mb-5">
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
      </header>

      {/* Welcome banner */}
      {welcome?.type === 'first' && (
        <div className="bg-brand/10 border border-brand/30 rounded-xl px-4 py-3 mb-5">
          <p className="text-brand font-semibold text-sm">¡Bienvenido al piloto de RESPONDE!</p>
          <p className="text-zinc-300 text-sm mt-0.5">
            Tenés <strong>{welcome.remaining}</strong> generaciones disponibles. Completá el perfil de tu negocio.
          </p>
        </div>
      )}

      {/* Title + progress */}
      <div className="mb-5">
        <h2 className="text-white text-lg font-semibold mb-3">
          {isEdit ? 'Perfil del negocio' : 'Configurá tu negocio'}
        </h2>
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-400">Perfil <span className="text-white font-semibold">{progress}% completo</span></span>
            <span className="text-zinc-500">
              {progress < 40 ? 'Respuestas genéricas' : progress < 70 ? 'Buenas respuestas' : 'Respuestas precisas'}
            </span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-1.5">
            <div className={`h-1.5 rounded-full transition-all duration-300 ${progColor}`} style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-1">

        {/* ── SECCIÓN A ── */}
        <div className="bg-zinc-800 border border-brand rounded-xl px-4 overflow-hidden">
          <SectionHeader title="A — Identidad" badge={bA} open={open.A} toggle={() => toggle('A')}
            categoryBadge={<span className="text-xs font-medium text-brand bg-brand/10 px-2 py-0.5 rounded-full">⚡ Esencial</span>}
            subtitle="Tu identidad — sin esto las respuestas son genéricas" />
          {open.A && (
            <div className="pb-4 space-y-4">
              {divider}
              <div className="pt-3 space-y-4">
                <Field label="Nombre del negocio" required htmlFor="profile-nombre">
                  <input id="profile-nombre" type="text" value={form.nombre} onChange={e => set('nombre', e.target.value)}
                    placeholder="Ej: Distribuidora El Progreso" maxLength={150} className={inputCls} />
                </Field>
                <Field label="Rubro" required htmlFor="profile-rubro">
                  <input id="profile-rubro" type="text" value={form.rubro} onChange={e => set('rubro', e.target.value)}
                    placeholder="Ej: Venta mayorista de insumos de limpieza" maxLength={150} className={inputCls} />
                </Field>
                <Field label="Descripción breve" hint="máx 300 chars" htmlFor="profile-descripcion">
                  <textarea id="profile-descripcion" value={form.descripcion} onChange={e => set('descripcion', e.target.value)}
                    placeholder={"Contá brevemente qué hace tu negocio y qué lo diferencia.\nEj: Distribuidora de productos de limpieza para hogares y comercios, con más de 10 años en el mercado."} rows={3} maxLength={300} className={textareaCls} />
                </Field>
                <Field label="Nombre del titular / persona de contacto" htmlFor="profile-nombre-titular">
                  <input id="profile-nombre-titular" type="text" value={form.nombre_titular} onChange={e => set('nombre_titular', e.target.value)}
                    placeholder="Ej: Carlos Martínez" maxLength={100} className={inputCls} />
                </Field>
                <Field label="Horarios de atención" htmlFor="profile-horarios">
                  <input id="profile-horarios" type="text" value={form.horarios} onChange={e => set('horarios', e.target.value)}
                    placeholder="Lun-Vie 7:30-17:30 / Sáb 8:00-12:00 / Dom cerrado" maxLength={150} className={inputCls} />
                </Field>
                <Field label="¿Emitís factura?" htmlFor="profile-emite-factura">
                  <Toggle id="profile-emite-factura" value={form.emite_factura} onChange={v => set('emite_factura', v)} label={form.emite_factura ? 'Sí' : 'No'} />
                  {form.emite_factura && (
                    <input type="text" value={form.ruc} onChange={e => set('ruc', e.target.value)}
                      placeholder="RUC" maxLength={50} className={`${inputCls} mt-3`} />
                  )}
                </Field>
              </div>
            </div>
          )}
        </div>

        {/* ── SECCIÓN B ── */}
        <div className="bg-zinc-800 border border-brand rounded-xl px-4 overflow-hidden">
          <SectionHeader title="B — Contacto y ubicación" badge={bB} open={open.B} toggle={() => toggle('B')}
            categoryBadge={<span className="text-xs font-medium text-brand bg-brand/10 px-2 py-0.5 rounded-full">⚡ Esencial</span>}
            subtitle="Tu contacto — para respuestas que generan confianza" />
          {open.B && (
            <div className="pb-4 space-y-4">
              {divider}
              <div className="pt-3 space-y-4">
                <Field label="WhatsApp de contacto" htmlFor="profile-whatsapp">
                  <input id="profile-whatsapp" type="text" value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)}
                    placeholder="+595 981 123 456" maxLength={50} className={inputCls} />
                </Field>
                <Field label="Dirección exacta" htmlFor="profile-direccion">
                  <input id="profile-direccion" type="text" value={form.direccion} onChange={e => set('direccion', e.target.value)}
                    placeholder="Av. Mcal. López 2345 c/ Perú, Barrio Jara, Asunción" maxLength={300} className={inputCls} />
                </Field>
                <Field label="Link Google Maps" hint="opcional" htmlFor="profile-maps">
                  <input id="profile-maps" type="url" value={form.maps} onChange={e => set('maps', e.target.value)}
                    placeholder="https://maps.app.goo.gl/..." maxLength={300} className={inputCls} />
                </Field>
                <Field label="Teléfono alternativo" hint="opcional" htmlFor="profile-telefono-alt">
                  <input id="profile-telefono-alt" type="text" value={form.telefono_alt} onChange={e => set('telefono_alt', e.target.value)}
                    placeholder="021-234-567" maxLength={50} className={inputCls} />
                </Field>
                <Field label="Correo electrónico" hint="opcional" htmlFor="profile-email">
                  <input id="profile-email" type="email" value={form.email} onChange={e => set('email', e.target.value)}
                    placeholder="ventas@tunegocio.com" maxLength={255} className={inputCls} />
                </Field>
                <Field label="Sitio web" hint="opcional" htmlFor="profile-sitio-web">
                  <input id="profile-sitio-web" type="text" value={form.sitio_web} onChange={e => set('sitio_web', e.target.value)}
                    placeholder="www.tunegocio.com" maxLength={300} className={inputCls} />
                </Field>
                <Field label="Instagram" htmlFor="profile-instagram">
                  <input id="profile-instagram" type="text" value={form.instagram} onChange={e => set('instagram', e.target.value)}
                    placeholder="@tunegocio" maxLength={150} className={inputCls} />
                </Field>
                <Field label="Facebook / otra red" hint="opcional" htmlFor="profile-facebook">
                  <input id="profile-facebook" type="text" value={form.facebook} onChange={e => set('facebook', e.target.value)}
                    placeholder="facebook.com/tunegocio" maxLength={150} className={inputCls} />
                </Field>
              </div>
            </div>
          )}
        </div>

        {/* ── SECCIÓN C ── */}
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 overflow-hidden">
          <SectionHeader title="C — Operativa" badge={bC} open={open.C} toggle={() => toggle('C')}
            categoryBadge={<span className="text-xs font-medium text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-full">🚀 Potenciador</span>}
            subtitle="Operativa — suma precisión a tus respuestas" />
          {open.C && (
            <div className="pb-4 space-y-4">
              {divider}
              <div className="pt-3 space-y-4">
                <Field label="⚡ Métodos de pago">
                  <div className="flex flex-wrap gap-2">
                    {PAGOS_OPTS.map(opt => (
                      <button key={opt} type="button" onClick={() => togglePago(opt)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors
                          ${pagosSelected.includes(opt) ? 'bg-brand text-black border-brand'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500'}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Política de entregas" htmlFor="profile-politica-entregas">
                  <textarea id="profile-politica-entregas" value={form.politica_entregas} onChange={e => set('politica_entregas', e.target.value)}
                    placeholder="¿Entregan? Zonas, costo, mínimo de compra, tiempo..." rows={3} maxLength={400} className={textareaCls} />
                </Field>
                <Field label="Hacemos delivery" htmlFor="profile-delivery-activo">
                  <Toggle id="profile-delivery-activo" value={form.delivery_activo} onChange={v => set('delivery_activo', v)} />
                  {form.delivery_activo && (
                    <div className="mt-3 space-y-3">
                      <input type="text" value={form.delivery_zona} onChange={e => set('delivery_zona', e.target.value)}
                        placeholder="Zona de cobertura" maxLength={200} className={inputCls} />
                      <input type="text" value={form.delivery_tiempo} onChange={e => set('delivery_tiempo', e.target.value)}
                        placeholder="Tiempo estimado (ej: 24-48hs)" maxLength={100} className={inputCls} />
                    </div>
                  )}
                </Field>
                <Field label="Política de cambios / devoluciones" hint="opcional" htmlFor="profile-devoluciones">
                  <textarea id="profile-devoluciones" value={form.devoluciones} onChange={e => set('devoluciones', e.target.value)}
                    placeholder="Ej: Cambios dentro de los 7 días con comprobante" rows={2} maxLength={300} className={textareaCls} />
                </Field>
                <Field label="Tiempo de respuesta esperado" htmlFor="profile-tiempo-respuesta">
                  <input id="profile-tiempo-respuesta" type="text" value={form.tiempo_respuesta} onChange={e => set('tiempo_respuesta', e.target.value)}
                    placeholder="Ej: menos de 1 hora en horario de atención" maxLength={100} className={inputCls} />
                </Field>
                <Field label="Condiciones para cuenta mayorista" hint="opcional" htmlFor="profile-condiciones-mayorista">
                  <textarea id="profile-condiciones-mayorista" value={form.condiciones_mayorista} onChange={e => set('condiciones_mayorista', e.target.value)}
                    placeholder="Ej: Mínimo 10 unidades, precio especial desde..." rows={2} maxLength={300} className={textareaCls} />
                </Field>
              </div>
            </div>
          )}
        </div>

        {/* ── SECCIÓN D ── */}
        <div className="bg-zinc-900 border border-brand/40 rounded-xl px-4 overflow-hidden">
          <SectionHeader title="D — Catálogo" badge={bD} open={open.D} toggle={() => toggle('D')}
            categoryBadge={<span className="text-xs font-medium text-brand bg-brand/10 px-2 py-0.5 rounded-full">⚡ Esencial</span>}
            subtitle="Tu catálogo y FAQs — el mayor impacto en calidad" />
          {open.D && (
            <div className="pb-4 space-y-4">
              {divider}
              <div className="pt-3 space-y-4">
                <Field label="Productos con precio (hasta 10)">
                  <p className="text-zinc-500 text-xs mb-3">Solo los más consultados o con precio fijo. No hace falta listar todo el inventario.</p>
                  <ItemList items={items} onChange={setItems} />
                </Field>
                <Field label="Marcas representadas" hint="opcional" htmlFor="profile-marcas">
                  <input id="profile-marcas" type="text" value={form.marcas} onChange={e => set('marcas', e.target.value)}
                    placeholder="Marcas que manejás, separadas por coma. Ej: Cavallaro, Mr. Músculo, Mar, Magistral" maxLength={200} className={inputCls} />
                </Field>
                <Field label="Preguntas frecuentes (hasta 5)">
                  <p className="text-zinc-500 text-xs mb-3">Las preguntas que más te hacen y cómo las respondés. Son las respuestas más precisas que va a dar la IA.</p>
                  <FAQList faqs={faqs} onChange={setFaqs} />
                </Field>
              </div>
            </div>
          )}
        </div>

        {/* ── SECCIÓN E ── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 overflow-hidden">
          <SectionHeader title="E — Configuración de respuestas" badge={bE} open={open.E} toggle={() => toggle('E')}
            categoryBadge={<span className="text-xs font-medium text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-full">🚀 Potenciador</span>}
            subtitle="Tono y estilo — para respuestas que suenan a vos" />
          {open.E && (
            <div className="pb-4 space-y-4">
              {divider}
              <div className="pt-3 space-y-4">
                <Field label="Tono de respuesta deseado">
                  <div className="flex gap-2">
                    {TONO_OPTS.map(o => (
                      <button key={o.val} type="button" onClick={() => set('tono_respuesta', o.val)}
                        className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-colors
                          ${form.tono_respuesta === o.val ? 'bg-brand text-black border-brand'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500'}`}>
                        {o.label}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="¿Usar emojis en las respuestas?" htmlFor="profile-usar-emojis">
                  <Toggle id="profile-usar-emojis" value={form.usar_emojis} onChange={v => set('usar_emojis', v)} label={form.usar_emojis ? 'Sí' : 'No'} />
                </Field>
                <Field label="Restricciones o excepciones" hint="opcional" htmlFor="profile-restricciones">
                  <textarea id="profile-restricciones" value={form.restricciones} onChange={e => set('restricciones', e.target.value)}
                    placeholder={"Qué NO debe decir o prometer la IA en nombre de tu negocio.\nEj: No mencionar precios sin IVA, no prometer entregas el mismo día."}
                    rows={2} maxLength={300} className={textareaCls} />
                </Field>
                <Field label="Mensaje de bienvenida personalizado" hint="opcional" htmlFor="profile-mensaje-bienvenida">
                  <textarea id="profile-mensaje-bienvenida" value={form.mensaje_bienvenida} onChange={e => set('mensaje_bienvenida', e.target.value)}
                    placeholder="Ej: ¡Hola! Bienvenido a Distribuidora El Progreso. ¿En qué te puedo ayudar?"
                    rows={2} maxLength={200} className={textareaCls} />
                </Field>
              </div>
            </div>
          )}
        </div>

        {error && <p className="text-red-400 text-sm pt-2">{error}</p>}

        <div className="pt-3">
          <button type="submit" disabled={loading}
            className="w-full bg-brand hover:bg-brand-dark disabled:bg-zinc-700 disabled:cursor-not-allowed
                       text-black font-semibold rounded-xl py-3 text-sm transition-colors">
            {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Guardar y continuar'}
          </button>
        </div>

      </form>

      <ReportButton accessCode={accessCode} />
    </main>
  );
}
