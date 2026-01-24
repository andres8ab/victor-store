"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Toast } from "primereact/toast";

type Props = {
  mode: "sign-in" | "sign-up";
  onSubmit: (
    formData: FormData,
  ) => Promise<{ ok: boolean; userId?: string; error?: string } | void>;
};

export default function AuthForm({ mode, onSubmit }: Props) {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useRef<Toast>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await onSubmit(formData);

      if (result?.ok) {
        toast.current?.show({
          severity: "success",
          summary: "Éxito",
          detail: mode === "sign-in" 
            ? "Sesión iniciada correctamente" 
            : "Cuenta creada exitosamente",
          life: 3000,
        });
        // Small delay to show the toast before redirecting
        setTimeout(() => {
          router.push("/");
        }, 500);
      } else if (result?.error) {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: result.error,
          life: 5000,
        });
      }
    } catch (e) {
      console.log("error", e);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Ocurrió un error inesperado. Por favor intenta nuevamente.",
        life: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Toast ref={toast} />
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-body text-dark-700 hover:text-dark-900 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Volver al inicio</span>
      </Link>

      <div className="text-center">
        <p className="text-caption text-dark-700">
          {mode === "sign-in"
            ? "¿No tienes una cuenta? "
            : "¿Ya tienes una cuenta? "}
          <Link
            href={mode === "sign-in" ? "/sign-up" : "/sign-in"}
            className="underline"
          >
            {mode === "sign-in" ? "Regístrate" : "Inicia Sesión"}
          </Link>
        </p>
        <h1 className="mt-3 text-heading-3 text-dark-900">
          {mode === "sign-in" ? "¡Bienvenido de Nuevo!" : "¡Únete a Victor Hoy!"}
        </h1>
        <p className="mt-1 text-body text-dark-700">
          {mode === "sign-in"
            ? "Inicia sesión para continuar tu viaje"
            : "Crea tu cuenta para comenzar tu viaje fitness"}
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {mode === "sign-up" && (
          <div className="space-y-1">
            <label htmlFor="name" className="text-caption text-dark-900">
              Nombre
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Ingresa tu nombre"
              className="w-full rounded-xl border border-light-300 bg-light-100 px-4 py-3 text-body text-dark-900 placeholder:text-dark-500 focus:outline-none focus:ring-2 focus:ring-dark-900/10"
              autoComplete="name"
            />
          </div>
        )}

        <div className="space-y-1">
          <label htmlFor="email" className="text-caption text-dark-900">
            Correo Electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="tumail@gmail.com"
            className="w-full rounded-xl border border-light-300 bg-light-100 px-4 py-3 text-body text-dark-900 placeholder:text-dark-500 focus:outline-none focus:ring-2 focus:ring-dark-900/10"
            autoComplete="email"
            required
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="text-caption text-dark-900">
            Contraseña
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={show ? "text" : "password"}
              placeholder="mínimo 8 caracteres"
              className="w-full rounded-xl border border-light-300 bg-light-100 px-4 py-3 pr-12 text-body text-dark-900 placeholder:text-dark-500 focus:outline-none focus:ring-2 focus:ring-dark-900/10"
              autoComplete={
                mode === "sign-in" ? "current-password" : "new-password"
              }
              minLength={8}
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center px-3 text-dark-700 hover:text-dark-900"
              onClick={() => setShow((v) => !v)}
              aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {show ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-full bg-dark-900 px-6 py-3 text-body-medium text-light-100 hover:bg-dark-700 focus:outline-none focus:ring-2 focus:ring-dark-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading 
            ? (mode === "sign-in" ? "Iniciando sesión..." : "Registrando...") 
            : (mode === "sign-in" ? "Iniciar Sesión" : "Registrarse")
          }
        </button>

        {mode === "sign-up" && (
          <p className="text-center text-footnote text-dark-700">
            Al registrarte, aceptas nuestros{" "}
            <a href="#" className="underline">
              Términos de Servicio
            </a>{" "}
            y{" "}
            <a href="#" className="underline">
              Política de Privacidad
            </a>
          </p>
        )}
      </form>
    </div>
  );
}