import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import PhoneInput from "./PhoneInput";
import { loginWithPhone } from "../api";

/**
 * Formulario de login con teléfono y contraseña
 * (Sin OTP - solo credenciales)
 */
export default function PhoneLoginForm({ onSuccess }) {
  const [phone, setPhone] = useState("+595");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isValidPhone = phone.length === 13 && /^\+595[0-9]{9}$/.test(phone);
  const isValidPassword = password.length >= 8;

  async function handleSubmit(e) {
    e.preventDefault();

    if (!isValidPhone) {
      setError("Ingresá un número de teléfono válido");
      return;
    }

    if (!isValidPassword) {
      setError("Ingresá tu contraseña");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await loginWithPhone(phone, password);
      onSuccess(result); // Pasar { token, user } al App
    } catch (err) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PhoneInput
        value={phone}
        onChange={(value) => {
          setPhone(value);
          if (error) setError("");
        }}
        error={error && !isValidPhone ? error : ""}
        disabled={loading}
      />

      <div>
        <label
          htmlFor="phone-login-password"
          className="block text-sm font-medium text-[#a3a3a3] mb-3"
        >
          Contraseña
        </label>
        <div className="relative">
          <input
            id="phone-login-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError("");
            }}
            placeholder="Ingresá tu contraseña"
            autoComplete="current-password"
            disabled={loading}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: `2px solid ${
                password && isValidPassword
                  ? "#22c55e"
                  : "rgba(255,255,255,0.1)"
              }`,
              boxShadow:
                password && isValidPassword
                  ? "0 0 0 4px rgba(34,197,94,0.12)"
                  : "none",
              fontSize: "16px",
              touchAction: "manipulation",
            }}
            className="w-full rounded-lg px-4 py-3 pr-12 text-white placeholder-[#737373]
                       transition-all duration-200 focus:outline-none disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={loading}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373]
                       hover:text-white transition-colors disabled:opacity-50"
            aria-label={
              showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
            }
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-lg p-3">
          <p className="text-sm text-[#ef4444]">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!isValidPhone || !isValidPassword || loading}
        style={{
          background:
            isValidPhone && isValidPassword && !loading
              ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
              : "rgba(255,255,255,0.1)",
          touchAction: "manipulation",
        }}
        className="w-full rounded-lg px-4 py-3.5 font-medium text-black
                   transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Iniciando sesión..." : "Iniciar sesión"}
      </button>
    </form>
  );
}
