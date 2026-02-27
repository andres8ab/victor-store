import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const SUBJECT_LABELS: Record<string, string> = {
  product: "Consulta sobre producto",
  order: "Consulta sobre pedido",
  support: "Soporte técnico",
  other: "Otro",
};

export async function POST(req: Request) {
  try {
    const { name, email, phone, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Faltan campos requeridos." },
        { status: 400 },
      );
    }

    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASS
    ) {
      console.error("SMTP environment variables are not fully configured.");
      return NextResponse.json(
        { error: "El servicio de correo no está configurado." },
        { status: 500 },
      );
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const to =
      process.env.CONTACT_RECIPIENT_EMAIL ||
      "todoelectricovictor@gmail.com";

    const subjectLabel = SUBJECT_LABELS[subject as keyof typeof SUBJECT_LABELS] ?? subject;

    const text = `Nuevo mensaje de contacto desde la web:

Nombre: ${name}
Email: ${email}
Teléfono: ${phone || "No proporcionado"}
Asunto: ${subjectLabel}

Mensaje:
${message}
`;

    const html = `<p>Nuevo mensaje de contacto desde la web:</p>
<ul>
  <li><strong>Nombre:</strong> ${name}</li>
  <li><strong>Email:</strong> ${email}</li>
  <li><strong>Teléfono:</strong> ${phone || "No proporcionado"}</li>
  <li><strong>Asunto:</strong> ${subjectLabel}</li>
</ul>
<p><strong>Mensaje:</strong></p>
<p>${message.replace(/\n/g, "<br />")}</p>`;

    await transporter.sendMail({
      from:
        process.env.SMTP_FROM_EMAIL ||
        `"Web Todo Eléctrico Victor" <${process.env.SMTP_USER}>`,
      replyTo: email,
      to,
      subject: `Nuevo mensaje de contacto: ${subjectLabel}`,
      text,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending contact email", error);
    return NextResponse.json(
      { error: "No se pudo enviar el mensaje." },
      { status: 500 },
    );
  }
}

