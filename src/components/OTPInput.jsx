import { useRef, useState } from "react";

/**
 * Componente para input de código OTP de 6 dígitos
 * Auto-focus y navegación entre inputs
 */
export default function OTPInput({ value, onChange, error }) {
  const inputsRef = useRef([]);
  const [focused, setFocused] = useState(-1);

  // Dividir el valor en array de 6 dígitos
  const digits = value.padEnd(6, " ").split("").slice(0, 6);

  function handleChange(index, newValue) {
    // Solo permitir dígitos
    const digit = newValue.replace(/\D/g, "").slice(-1);

    const newDigits = [...digits];
    newDigits[index] = digit || " ";
    const newCode = newDigits.join("").trim();

    onChange(newCode);

    // Auto-focus al siguiente input
    if (digit && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index, e) {
    // Backspace: borrar y volver al anterior
    if (e.key === "Backspace") {
      if (!digits[index] || digits[index] === " ") {
        if (index > 0) {
          inputsRef.current[index - 1]?.focus();
        }
      } else {
        handleChange(index, "");
      }
    }
    // Arrow keys: navegación
    else if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    onChange(pastedData);

    // Focus al último dígito pegado o al final
    const lastIndex = Math.min(pastedData.length - 1, 5);
    setTimeout(() => inputsRef.current[lastIndex]?.focus(), 10);
  }

  return (
    <div>
      <label className="block text-sm font-medium text-[#a3a3a3] mb-3 text-center">
        Código de verificación
      </label>
      <div className="flex gap-2 justify-center">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputsRef.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit === " " ? "" : digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => setFocused(index)}
            onBlur={() => setFocused(-1)}
            autoComplete="one-time-code"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: `2px solid ${
                error
                  ? "#ef4444"
                  : digit && digit !== " "
                    ? "#22c55e"
                    : focused === index
                      ? "rgba(255,255,255,0.2)"
                      : "rgba(255,255,255,0.1)"
              }`,
              boxShadow: error
                ? "0 0 0 4px rgba(239,68,68,0.12)"
                : digit && digit !== " "
                  ? "0 0 0 4px rgba(34,197,94,0.12)"
                  : "none",
              fontSize: "24px",
              fontWeight: "600",
              touchAction: "manipulation",
            }}
            className="w-12 h-14 rounded-lg text-white text-center
                       transition-all duration-200 focus:outline-none
                       caret-[#22c55e]"
          />
        ))}
      </div>
      {error && (
        <p className="text-xs text-[#ef4444] mt-3 text-center">{error}</p>
      )}
      <p className="text-xs text-[#737373] mt-3 text-center">
        Ingresá el código de 6 dígitos que recibiste por SMS
      </p>
    </div>
  );
}
