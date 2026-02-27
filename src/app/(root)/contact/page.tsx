"use client";

import { Toast } from "primereact/toast";
import { useRef, useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const toast = useRef<Toast>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "No se pudo enviar el mensaje. Por favor, intenta de nuevo.",
          life: 5000,
        });
        throw new Error("Failed to send message");
      }

      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail:
          "Mensaje enviado exitosamente. Nos pondremos en contacto contigo pronto.",
        life: 5000,
      });

      setSubmitStatus("success");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("Error sending contact form", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
      <Toast ref={toast} />
      <header className="py-6">
        <h1 className="text-heading-2 text-dark-900">Contacto</h1>
        <p className="mt-2 text-body text-dark-700">
          ¿Tienes alguna pregunta? Estamos aquí para ayudarte.
        </p>
      </header>

      <div className="grid gap-8 pb-12 md:grid-cols-2">
        <section>
          <h2 className="mb-4 text-heading-3 text-dark-900">
            Información de Contacto
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-body-medium text-dark-900">Dirección</h3>
              <p className="text-body text-dark-700">
                Carrera 38 #43-07
                <br />
                Barranquilla, Atlántico, 08001 Colombia
              </p>
            </div>
            <div>
              <h3 className="text-body-medium text-dark-900">Teléfono</h3>
              <p className="text-body text-dark-700">+57 300 372 5519</p>
            </div>
            <div>
              <h3 className="text-body-medium text-dark-900">Email</h3>
              <p className="text-body text-dark-700">
                todoelectricovictor@gmail.com
              </p>
            </div>
            <div>
              <h3 className="text-body-medium text-dark-900">Horario</h3>
              <p className="text-body text-dark-700">
                Lunes a Sábado: 8:00 AM - 6:00 PM
                <br />
                Domingo: 9:00 AM - 1:00 PM
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-heading-3 text-dark-900">
            Envíanos un Mensaje
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-body-medium text-dark-900"
              >
                Nombre *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-light-300 px-4 py-2 text-body text-dark-900 focus:border-dark-500 focus:outline-none focus:ring-2 focus:ring-dark-500"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-body-medium text-dark-900"
              >
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-light-300 px-4 py-2 text-body text-dark-900 focus:border-dark-500 focus:outline-none focus:ring-2 focus:ring-dark-500"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-body-medium text-dark-900"
              >
                Teléfono
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-light-300 px-4 py-2 text-body text-dark-900 focus:border-dark-500 focus:outline-none focus:ring-2 focus:ring-dark-500"
              />
            </div>

            <div>
              <label
                htmlFor="subject"
                className="block text-body-medium text-dark-900"
              >
                Asunto *
              </label>
              <select
                id="subject"
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-light-300 px-4 py-2 text-body text-dark-900 focus:border-dark-500 focus:outline-none focus:ring-2 focus:ring-dark-500"
              >
                <option value="">Selecciona un asunto</option>
                <option value="product">Consulta sobre producto</option>
                <option value="order">Consulta sobre pedido</option>
                <option value="support">Soporte técnico</option>
                <option value="other">Otro</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-body-medium text-dark-900"
              >
                Mensaje *
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                value={formData.message}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-light-300 px-4 py-2 text-body text-dark-900 focus:border-dark-500 focus:outline-none focus:ring-2 focus:ring-dark-500"
              />
            </div>

            {submitStatus === "success" && (
              <div className="rounded-lg bg-green-50 p-4 text-body text-green-800">
                ¡Mensaje enviado exitosamente! Nos pondremos en contacto contigo
                pronto.
              </div>
            )}

            {submitStatus === "error" && (
              <div className="rounded-lg bg-red-50 p-4 text-body text-red-800">
                Hubo un error al enviar el mensaje. Por favor, intenta de nuevo.
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-dark-900 px-6 py-3 text-body-medium text-light-100 transition-colors hover:bg-dark-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Enviando..." : "Enviar Mensaje"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
