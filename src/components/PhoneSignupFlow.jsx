import { useState, useEffect } from "react";
import { Eye, EyeOff, ArrowLeft, CheckCircle2 } from "lucide-react";
import PhoneInput from "./PhoneInput";
import OTPInput from "./OTPInput";
import { requestPhoneVerification, verifyPhone, signupWithPhone } from "../api";

/**
 * Flujo de registro con teléfono en 3 pasos:
 * 1. Ingresar teléfono y solicitar código
 * 2. Verificar código OTP
 * 3. Crear contraseña y nombre
 */
export default function PhoneSignupFlow({ onSuccess, onBack }) {
  // Paso actual: 1=teléfono, 2=OTP, 3=password
  const [step, setStep] = useState(1);

  // Datos del formulario
  const [phone, setPhone] = useState("+595");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

  // Countdown para reenvío de código
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Validaciones
  const isValidPhone = phone.length === 13 && /^\+595[0-9]{9}$/.test(phone);
  const isValidCode = code.length === 6 && /^[0-9]{6}$/.test(code);
  const isValidPassword = password.length >= 8;
  const isValidName = name.trim().length >= 2;

  // PASO 1: Solicitar código por SMS
  async function handleRequestCode(e) {
    e.preventDefault();
    if (!isValidPhone) {
      setError("Ingresá un número de teléfono válido");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await requestPhoneVerification(phone);

      // Si es modo mock, mostrar el código en consola
      if (result.mock) {
        console.log(
          "🔐 Código OTP (modo desarrollo):",
          result.code || "Ver logs del servidor",
        );
      }

      setStep(2);
      setCountdown(60); // 60 segundos antes de poder reenviar
    } catch (err) {
      setError(err.message || "Error al enviar el código");
    } finally {
      setLoading(false);
    }
  }

  // PASO 2: Verificar código OTP
  async function handleVerifyCode(e) {
    e.preventDefault();
    if (!isValidCode) {
      setError("Ingresá el código de 6 dígitos");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await verifyPhone(phone, code);
      setStep(3);
    } catch (err) {
      setError(err.message || "Código incorrecto o expirado");
      setCode(""); // Limpiar código incorrecto
    } finally {
      setLoading(false);
    }
  }

  // PASO 3: Crear cuenta con contraseña y nombre
  async function handleSignup(e) {
    e.preventDefault();

    if (!isValidName) {
      setError("Ingresá tu nombre completo");
      return;
    }

    if (!isValidPassword) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await signupWithPhone(phone, password, name);
      onSuccess(result); // Pasar { token, user } al App
    } catch (err) {
      setError(err.message || "Error al crear la cuenta");
    } finally {
      setLoading(false);
    }
  }

  // Reenviar código
  async function handleResendCode() {
    if (countdown > 0) return;

    setLoading(true);
    setError("");
    setCode("");

    try {
      const result = await requestPhoneVerification(phone);

      if (result.mock) {
        console.log(
          "🔐 Código OTP reenviado (modo desarrollo):",
          result.code || "Ver logs del servidor",
        );
      }

      setCountdown(60);
      setError("");
    } catch (err) {
      setError(err.message || "Error al reenviar el código");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Indicador de pasos */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {[1, 2, 3].map((num) => (
          <div
            key={num}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              num === step
                ? "w-8 bg-[#22c55e]"
                : num < step
                  ? "w-6 bg-[#22c55e]/50"
                  : "w-6 bg-[#ffffff]/10"
            }`}
          />
        ))}
      </div>

      {/* PASO 1: Teléfono */}
      {step === 1 && (
        <form onSubmit={handleRequestCode} className="space-y-5">
          <div className="text-center mb-4">
            <h2 className="font-syne font-semibold text-xl text-white mb-2">
              Registrate con tu teléfono
            </h2>
            <p className="text-sm text-[#737373]">
              Te enviaremos un código de verificación
            </p>
          </div>

          <PhoneInput
            value={phone}
            onChange={setPhone}
            error={error}
            disabled={loading}
          />

          <button
            type="submit"
            disabled={!isValidPhone || loading}
            style={{
              background:
                isValidPhone && !loading
                  ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
                  : "rgba(255,255,255,0.1)",
              touchAction: "manipulation",
            }}
            className="w-full rounded-lg px-4 py-3.5 font-medium text-black
                       transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Enviando..." : "Enviar código"}
          </button>

          <button
            type="button"
            onClick={onBack}
            className="w-full text-sm text-[#a3a3a3] hover:text-white transition-colors
                       flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} />
            Volver
          </button>
        </form>
      )}

      {/* PASO 2: Verificar OTP */}
      {step === 2 && (
        <form onSubmit={handleVerifyCode} className="space-y-5">
          <div className="text-center mb-4">
            <h2 className="font-syne font-semibold text-xl text-white mb-2">
              Verificá tu teléfono
            </h2>
            <p className="text-sm text-[#737373]">
              Enviamos un código a {phone}
            </p>
          </div>

          <OTPInput value={code} onChange={setCode} error={error} />

          <button
            type="submit"
            disabled={!isValidCode || loading}
            style={{
              background:
                isValidCode && !loading
                  ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
                  : "rgba(255,255,255,0.1)",
              touchAction: "manipulation",
            }}
            className="w-full rounded-lg px-4 py-3.5 font-medium text-black
                       transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verificando..." : "Verificar código"}
          </button>

          <div className="text-center">
            {countdown > 0 ? (
              <p className="text-sm text-[#737373]">
                Podés reenviar el código en {countdown}s
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResendCode}
                disabled={loading}
                className="text-sm text-[#22c55e] hover:text-[#16a34a] transition-colors disabled:opacity-50"
              >
                Reenviar código
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setStep(1);
              setCode("");
              setError("");
            }}
            className="w-full text-sm text-[#a3a3a3] hover:text-white transition-colors
                       flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} />
            Cambiar número
          </button>
        </form>
      )}

      {/* PASO 3: Crear contraseña */}
      {step === 3 && (
        <form onSubmit={handleSignup} className="space-y-5">
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#22c55e]/20 mb-3">
              <CheckCircle2 className="text-[#22c55e]" size={24} />
            </div>
            <h2 className="font-syne font-semibold text-xl text-white mb-2">
              Teléfono verificado
            </h2>
            <p className="text-sm text-[#737373]">
              Completá tu perfil para continuar
            </p>
          </div>

          <div>
            <label
              htmlFor="signup-name"
              className="block text-sm font-medium text-[#a3a3a3] mb-3"
            >
              Nombre completo
            </label>
            <input
              id="signup-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
              placeholder="Juan Pérez"
              autoComplete="name"
              disabled={loading}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: `2px solid ${
                  name && isValidName ? "#22c55e" : "rgba(255,255,255,0.1)"
                }`,
                boxShadow:
                  name && isValidName
                    ? "0 0 0 4px rgba(34,197,94,0.12)"
                    : "none",
                fontSize: "16px",
                touchAction: "manipulation",
              }}
              className="w-full rounded-lg px-4 py-3 text-white placeholder-[#737373]
                         transition-all duration-200 focus:outline-none disabled:opacity-50"
            />
          </div>

          <div>
            <label
              htmlFor="signup-password"
              className="block text-sm font-medium text-[#a3a3a3] mb-3"
            >
              Contraseña
            </label>
            <div className="relative">
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
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
            {password && password.length < 8 && (
              <p className="text-xs text-[#737373] mt-2">
                Mínimo 8 caracteres ({password.length}/8)
              </p>
            )}
          </div>

          {error && (
            <div className="bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-lg p-3">
              <p className="text-sm text-[#ef4444]">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={!isValidName || !isValidPassword || loading}
            style={{
              background:
                isValidName && isValidPassword && !loading
                  ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
                  : "rgba(255,255,255,0.1)",
              touchAction: "manipulation",
            }}
            className="w-full rounded-lg px-4 py-3.5 font-medium text-black
                       transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>
      )}
    </div>
  );
}
