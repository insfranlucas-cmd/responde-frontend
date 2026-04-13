import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { login, signup, loginWithCode } from "../api";

export default function LoginScreen({ onLogin, expiredMessage }) {
  // Modo de autenticación: 'email-login' | 'signup' | 'code'
  const [mode, setMode] = useState("email-login");

  // Campos
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Mostrar mensaje de sesión expirada si existe
  useEffect(() => {
    if (expiredMessage) {
      setError(expiredMessage);
    }
  }, [expiredMessage]);

  // Validaciones
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPassword = (pwd) => pwd.length >= 8;

  function handleCodeChange(e) {
    const val = e.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 3);
    setCode(val);
    if (error) setError("");
  }

  function handleEmailChange(e) {
    setEmail(e.target.value.toLowerCase().trim());
    if (error) setError("");
  }

  function handlePasswordChange(e) {
    setPassword(e.target.value);
    if (error) setError("");
  }

  function handleNameChange(e) {
    setName(e.target.value);
    if (error) setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let result;

      if (mode === "code") {
        // Login con código de 3 caracteres
        if (code.length !== 3) {
          setError("El código debe tener exactamente 3 caracteres.");
          setLoading(false);
          return;
        }
        result = await loginWithCode(code);
      } else if (mode === "signup") {
        // Registro con email y contraseña
        if (!name.trim()) {
          setError("Ingresá tu nombre completo.");
          setLoading(false);
          return;
        }
        if (!isValidEmail(email)) {
          setError("Ingresá un email válido.");
          setLoading(false);
          return;
        }
        if (!isValidPassword(password)) {
          setError("La contraseña debe tener al menos 8 caracteres.");
          setLoading(false);
          return;
        }
        result = await signup(name, email, password);
      } else {
        // Login con email y contraseña
        if (!isValidEmail(email)) {
          setError("Ingresá un email válido.");
          setLoading(false);
          return;
        }
        if (!password) {
          setError("Ingresá tu contraseña.");
          setLoading(false);
          return;
        }
        result = await login(email, password);
      }

      // Login exitoso - pasamos { token, user } al App
      onLogin(result);
    } catch (err) {
      setError(err.message || "Error al iniciar sesión. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  // Determinar si el botón debe estar habilitado
  const canSubmit = () => {
    if (loading) return false;
    if (mode === "code") return code.length === 3;
    if (mode === "signup")
      return name.trim() && isValidEmail(email) && isValidPassword(password);
    return isValidEmail(email) && isValidPassword(password);
  };

  const ready = canSubmit();

  return (
    <main
      id="main-content"
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#0a0a0a" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
            style={{
              background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
            }}
          >
            <span className="text-black text-2xl font-syne font-bold">R</span>
          </div>
          <h1 className="font-syne font-bold text-4xl text-white tracking-tight">
            RESPONDE
          </h1>
          <p className="text-[#a3a3a3] text-sm mt-2">
            Asistente IA para tu negocio
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-xl p-8"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* ──────────────────────────────────────────── */}
            {/* MODO: LOGIN CON EMAIL */}
            {/* ──────────────────────────────────────────── */}
            {mode === "email-login" && (
              <>
                <div>
                  <label
                    htmlFor="login-email"
                    className="block text-sm font-medium text-[#a3a3a3] mb-3"
                  >
                    Email
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="tu@email.com"
                    autoComplete="email"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: `2px solid ${email && isValidEmail(email) ? "#22c55e" : "rgba(255,255,255,0.1)"}`,
                      boxShadow:
                        email && isValidEmail(email)
                          ? "0 0 0 4px rgba(34,197,94,0.12)"
                          : "none",
                      fontSize: "16px",
                      touchAction: "manipulation",
                    }}
                    className="w-full rounded-lg px-4 py-3 text-white placeholder-[#737373]
                               transition-all duration-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="login-password"
                    className="block text-sm font-medium text-[#a3a3a3] mb-3"
                  >
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={handlePasswordChange}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "2px solid rgba(255,255,255,0.1)",
                        fontSize: "16px",
                        touchAction: "manipulation",
                        paddingRight: "48px",
                      }}
                      className="w-full rounded-lg px-4 py-3 text-white placeholder-[#737373]
                                 transition-all duration-200 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-4 text-[#737373]
                                 hover:text-[#a3a3a3] transition-colors"
                      aria-label={
                        showPassword
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"
                      }
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* ──────────────────────────────────────────── */}
            {/* MODO: SIGNUP */}
            {/* ──────────────────────────────────────────── */}
            {mode === "signup" && (
              <>
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
                    onChange={handleNameChange}
                    placeholder="Juan Pérez"
                    autoComplete="name"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: `2px solid ${name.trim() ? "#22c55e" : "rgba(255,255,255,0.1)"}`,
                      boxShadow: name.trim()
                        ? "0 0 0 4px rgba(34,197,94,0.12)"
                        : "none",
                      fontSize: "16px",
                      touchAction: "manipulation",
                    }}
                    className="w-full rounded-lg px-4 py-3 text-white placeholder-[#737373]
                               transition-all duration-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="signup-email"
                    className="block text-sm font-medium text-[#a3a3a3] mb-3"
                  >
                    Email
                  </label>
                  <input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="tu@email.com"
                    autoComplete="email"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: `2px solid ${email && isValidEmail(email) ? "#22c55e" : "rgba(255,255,255,0.1)"}`,
                      boxShadow:
                        email && isValidEmail(email)
                          ? "0 0 0 4px rgba(34,197,94,0.12)"
                          : "none",
                      fontSize: "16px",
                      touchAction: "manipulation",
                    }}
                    className="w-full rounded-lg px-4 py-3 text-white placeholder-[#737373]
                               transition-all duration-200 focus:outline-none"
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
                      onChange={handlePasswordChange}
                      placeholder="Mínimo 8 caracteres"
                      autoComplete="new-password"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: `2px solid ${isValidPassword(password) ? "#22c55e" : "rgba(255,255,255,0.1)"}`,
                        boxShadow: isValidPassword(password)
                          ? "0 0 0 4px rgba(34,197,94,0.12)"
                          : "none",
                        fontSize: "16px",
                        touchAction: "manipulation",
                        paddingRight: "48px",
                      }}
                      className="w-full rounded-lg px-4 py-3 text-white placeholder-[#737373]
                                 transition-all duration-200 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-4 text-[#737373]
                                 hover:text-[#a3a3a3] transition-colors"
                      aria-label={
                        showPassword
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"
                      }
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {password && !isValidPassword(password) && (
                    <p className="text-xs text-[#737373] mt-2">
                      {password.length}/8 caracteres
                    </p>
                  )}
                </div>
              </>
            )}

            {/* ──────────────────────────────────────────── */}
            {/* MODO: CÓDIGO */}
            {/* ──────────────────────────────────────────── */}
            {mode === "code" && (
              <div>
                <label
                  htmlFor="login-codigo"
                  className="block text-sm font-medium text-[#a3a3a3] mb-3"
                >
                  Código de acceso
                </label>
                <input
                  id="login-codigo"
                  type="text"
                  value={code}
                  onChange={handleCodeChange}
                  placeholder="7K2"
                  maxLength={3}
                  autoCapitalize="characters"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  inputMode="text"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: `2px solid ${code.length > 0 ? "#22c55e" : "rgba(255,255,255,0.1)"}`,
                    boxShadow:
                      code.length > 0
                        ? "0 0 0 4px rgba(34,197,94,0.12)"
                        : "none",
                    fontSize: "28px",
                    letterSpacing: "0.5em",
                    touchAction: "manipulation",
                  }}
                  className="w-full rounded-lg px-4 py-4 text-center font-mono font-bold
                             text-white placeholder-[#737373] transition-all duration-200
                             focus:outline-none"
                />
                <p className="text-center text-xs text-[#737373] mt-2">
                  {code.length}/3 caracteres
                </p>
              </div>
            )}

            {/* Error message */}
            <div role="alert" aria-live="polite" className="min-h-[20px]">
              {error && (
                <p className="text-[#ef4444] text-sm text-center">{error}</p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={!ready}
              style={{
                background: ready
                  ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
                  : "#2a2a2a",
                color: ready ? "#000" : "#737373",
                boxShadow: ready ? "0 4px 14px rgba(34,197,94,0.3)" : "none",
              }}
              className="w-full py-4 rounded-xl font-semibold text-base
                         transition-all duration-200 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner />
                  {mode === "signup"
                    ? "Creando cuenta..."
                    : mode === "code"
                      ? "Verificando..."
                      : "Iniciando sesión..."}
                </span>
              ) : mode === "signup" ? (
                "Crear cuenta"
              ) : mode === "code" ? (
                "Ingresar"
              ) : (
                "Iniciar sesión"
              )}
            </button>

            {/* ──────────────────────────────────────────── */}
            {/* LINKS PARA CAMBIAR DE MODO */}
            {/* ──────────────────────────────────────────── */}
            <div className="pt-4 border-t border-[rgba(255,255,255,0.08)] space-y-2">
              {mode === "email-login" && (
                <>
                  <p className="text-center text-sm text-[#a3a3a3]">
                    ¿No tenés cuenta?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode("signup");
                        setError("");
                      }}
                      className="text-[#22c55e] hover:text-[#16a34a] font-medium transition-colors"
                    >
                      Crear cuenta
                    </button>
                  </p>
                  <p className="text-center text-sm text-[#a3a3a3]">
                    ¿Tenés un código de acceso?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode("code");
                        setError("");
                      }}
                      className="text-[#22c55e] hover:text-[#16a34a] font-medium transition-colors"
                    >
                      Ingresar con código
                    </button>
                  </p>
                </>
              )}

              {mode === "signup" && (
                <p className="text-center text-sm text-[#a3a3a3]">
                  ¿Ya tenés cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("email-login");
                      setError("");
                    }}
                    className="text-[#22c55e] hover:text-[#16a34a] font-medium transition-colors"
                  >
                    Iniciar sesión
                  </button>
                </p>
              )}

              {mode === "code" && (
                <p className="text-center text-sm text-[#a3a3a3]">
                  ¿Querés usar email?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("email-login");
                      setError("");
                    }}
                    className="text-[#22c55e] hover:text-[#16a34a] font-medium transition-colors"
                  >
                    Iniciar sesión
                  </button>
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
