import { useState } from "react";
import { Phone } from "lucide-react";

/**
 * Componente para input de teléfono paraguayo
 * Valida formato +595XXXXXXXXX (9 dígitos después de +595)
 */
export default function PhoneInput({ value, onChange, error, disabled }) {
  const [focused, setFocused] = useState(false);

  // Formatear automáticamente el número
  function handleChange(e) {
    let input = e.target.value;

    // Remover todo excepto números
    let digits = input.replace(/\D/g, "");

    // Si empieza con 595, agregar +
    if (digits.startsWith("595")) {
      digits = digits.substring(3);
      input = "+595" + digits;
    }
    // Si empieza con 0, convertir a formato internacional
    else if (digits.startsWith("0")) {
      digits = digits.substring(1);
      input = "+595" + digits;
    }
    // Si no tiene prefijo, agregar +595
    else if (!input.startsWith("+")) {
      input = "+595" + digits;
    }

    // Limitar a +595 + 9 dígitos
    if (input.length > 13) {
      input = input.substring(0, 13);
    }

    onChange(input);
  }

  // Validar formato paraguayo
  const isValid =
    value.length === 13 &&
    /^\+595[0-9]{9}$/.test(value) &&
    /^\+595(96|97|98|99|91|92|93|94|95)/.test(value);

  return (
    <div>
      <label className="block text-sm font-medium text-[#a3a3a3] mb-3">
        Número de teléfono
      </label>
      <div className="relative">
        <Phone
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]"
          size={18}
        />
        <input
          type="tel"
          value={value}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          placeholder="+595 98 123 4567"
          autoComplete="tel"
          style={{
            background: disabled
              ? "rgba(255,255,255,0.02)"
              : "rgba(255,255,255,0.04)",
            border: `2px solid ${
              error
                ? "#ef4444"
                : value && isValid
                  ? "#22c55e"
                  : focused
                    ? "rgba(255,255,255,0.2)"
                    : "rgba(255,255,255,0.1)"
            }`,
            boxShadow: error
              ? "0 0 0 4px rgba(239,68,68,0.12)"
              : value && isValid
                ? "0 0 0 4px rgba(34,197,94,0.12)"
                : "none",
            fontSize: "16px",
            touchAction: "manipulation",
          }}
          className="w-full rounded-lg pl-11 pr-4 py-3 text-white placeholder-[#737373]
                     transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
      {value && !isValid && value.length >= 4 && (
        <p className="text-xs text-[#ef4444] mt-2">
          Formato: +595 seguido de 9 dígitos (ej: +595981234567)
        </p>
      )}
      {error && <p className="text-xs text-[#ef4444] mt-2">{error}</p>}
    </div>
  );
}
