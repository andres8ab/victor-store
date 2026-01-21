"use client";

import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    // Simulate form submission
    // In a real app, you would send this to an API endpoint
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmitStatus("success");
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
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
                Tu dirección aquí
                <br />
                Ciudad, Estado, Código Postal
              </p>
            </div>
            <div>
              <h3 className="text-body-medium text-dark-900">Teléfono</h3>
              <p className="text-body text-dark-700">+1 (555) 123-4567</p>
            </div>
            <div>
              <h3 className="text-body-medium text-dark-900">Email</h3>
              <p className="text-body text-dark-700">contacto@todo-electrico-victor.com</p>
            </div>
            <div>
              <h3 className="text-body-medium text-dark-900">Horario</h3>
              <p className="text-body text-dark-700">
                Lunes - Viernes: 9:00 AM - 6:00 PM
                <br />
                Sábado: 10:00 AM - 4:00 PM
                <br />
                Domingo: Cerrado
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
                ¡Mensaje enviado exitosamente! Nos pondremos en contacto
                contigo pronto.
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
