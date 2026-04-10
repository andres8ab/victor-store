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

      <div className="grid md:gap-8 lg:gap-20 pb-12 md:grid-cols-2">
        <section>
          <h2 className="mb-4 text-heading-3 text-dark-900">
            Información de Contacto
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-body-medium text-dark-900">Dirección</h3>
              <p className="text-body text-dark-700">
                <strong>Principal:</strong> Carrera 38 #43-07
                <br />
                <strong>Sede Norte:</strong> Carrera 46 #75-109
                <br />
                Barranquilla, Atlántico, 08001 Colombia
              </p>
            </div>
            <div>
              <h3 className="text-body-medium text-dark-900">Teléfono</h3>
              <p className="text-body text-dark-700">+57 300 372 5519</p>
              {process.env.NEXT_PUBLIC_WHATSAPP_NUMBER && (
                <a
                  href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 text-body-medium text-white transition-opacity hover:opacity-90"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Escríbenos por WhatsApp
                </a>
              )}
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
                className="mt-1 w-full rounded-lg border border-dark-500 px-4 py-2 text-body text-dark-900 focus:border-dark-500 focus:outline-none focus:ring-2 focus:ring-dark-500"
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
                className="mt-1 w-full rounded-lg border border-dark-500 px-4 py-2 text-body text-dark-900 focus:border-dark-500 focus:outline-none focus:ring-2 focus:ring-dark-500"
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
                className="mt-1 w-full rounded-lg border border-dark-500 px-4 py-2 text-body text-dark-900 focus:border-dark-500 focus:outline-none focus:ring-2 focus:ring-dark-500"
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
                className="mt-1 w-full rounded-lg border border-dark-500 px-4 py-2 text-body text-dark-900 focus:border-dark-500 focus:outline-none focus:ring-2 focus:ring-dark-500"
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
                className="mt-1 w-full rounded-lg border border-dark-500 px-4 py-2 text-body text-dark-900 focus:border-dark-500 focus:outline-none focus:ring-2 focus:ring-dark-500"
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
