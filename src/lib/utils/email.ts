import nodemailer from "nodemailer";

type OrderEmailData = {
  orderId: string;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  totalAmount: number;
  items: { productName: string; quantity: number; priceAtPurchase: number }[];
  shippingAddress?: { line1: string; city: string } | null;
};

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function isSmtpConfigured() {
  return !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
}

export async function sendPaymentConfirmationEmail(order: OrderEmailData) {
  if (!isSmtpConfigured()) {
    console.warn("SMTP not configured, skipping customer confirmation email");
    return;
  }
  if (!order.customerEmail) return;

  const shortId = order.orderId.slice(0, 8);

  const itemsHtml = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #eee;">${item.productName}</td>
      <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
      <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">$${(item.priceAtPurchase * item.quantity).toLocaleString("es-CO")}</td>
    </tr>`,
    )
    .join("");

  const html = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a;">
  <h2 style="margin-bottom:4px;">¡Pago confirmado!</h2>
  <p style="color:#555;">Hola${order.customerName ? ` ${order.customerName}` : ""},</p>
  <p style="color:#555;">Recibimos tu pago correctamente. Nos pondremos en contacto contigo pronto para coordinar la entrega.</p>

  <h3 style="border-bottom:2px solid #eee;padding-bottom:8px;">Resumen — Pedido #${shortId}</h3>
  <table style="width:100%;border-collapse:collapse;font-size:14px;">
    <thead>
      <tr style="background:#f5f5f5;">
        <th style="padding:8px 0;text-align:left;">Producto</th>
        <th style="padding:8px 0;text-align:center;">Cant.</th>
        <th style="padding:8px 0;text-align:right;">Subtotal</th>
      </tr>
    </thead>
    <tbody>${itemsHtml}</tbody>
    <tfoot>
      <tr>
        <td colspan="2" style="padding:12px 0;font-weight:bold;text-align:right;">Total</td>
        <td style="padding:12px 0;font-weight:bold;text-align:right;">$${order.totalAmount.toLocaleString("es-CO")}</td>
      </tr>
    </tfoot>
  </table>

  ${
    order.shippingAddress
      ? `<h3 style="margin-top:24px;">Dirección de envío</h3>
  <p style="color:#555;">${order.shippingAddress.line1}, ${order.shippingAddress.city}</p>`
      : ""
  }

  <p style="margin-top:24px;color:#888;font-size:13px;">
    Si tienes preguntas puedes responder a este correo.<br/>
    <strong>Todo Eléctrico Víctor</strong>
  </p>
</div>`;

  await createTransporter().sendMail({
    from:
      process.env.SMTP_FROM_EMAIL ||
      `"Todo Eléctrico Víctor" <${process.env.SMTP_USER}>`,
    to: order.customerEmail,
    subject: `¡Pago confirmado! Pedido #${shortId} — Todo Eléctrico Víctor`,
    html,
  });
}

export async function sendAdminOrderNotificationEmail(order: OrderEmailData) {
  if (!isSmtpConfigured()) {
    console.warn("SMTP not configured, skipping admin notification email");
    return;
  }

  const adminEmail =
    process.env.CONTACT_RECIPIENT_EMAIL ||
    "todoelectricovictorautopartes@gmail.com";
  const shortId = order.orderId.slice(0, 8);
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://todoelectricovictor.com";

  const itemsHtml = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding:6px 0;border-bottom:1px solid #eee;">${item.productName}</td>
      <td style="padding:6px 0;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
      <td style="padding:6px 0;border-bottom:1px solid #eee;text-align:right;">$${(item.priceAtPurchase * item.quantity).toLocaleString("es-CO")}</td>
    </tr>`,
    )
    .join("");

  const html = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a;">
  <h2 style="color:#16a34a;">Nuevo pedido pagado — #${shortId}</h2>

  <h3>Cliente</h3>
  <table style="font-size:14px;width:100%;">
    <tr><td style="padding:4px 0;color:#555;width:100px;">Nombre</td><td><strong>${order.customerName ?? "—"}</strong></td></tr>
    <tr><td style="padding:4px 0;color:#555;">Teléfono</td><td><strong>${order.customerPhone ?? "—"}</strong></td></tr>
    <tr><td style="padding:4px 0;color:#555;">Email</td><td>${order.customerEmail ?? "—"}</td></tr>
    ${order.shippingAddress ? `<tr><td style="padding:4px 0;color:#555;">Dirección</td><td>${order.shippingAddress.line1}, ${order.shippingAddress.city}</td></tr>` : ""}
  </table>

  <h3 style="margin-top:24px;">Productos</h3>
  <table style="width:100%;border-collapse:collapse;font-size:14px;">
    <thead>
      <tr style="background:#f5f5f5;">
        <th style="padding:6px 0;text-align:left;">Producto</th>
        <th style="padding:6px 0;text-align:center;">Cant.</th>
        <th style="padding:6px 0;text-align:right;">Subtotal</th>
      </tr>
    </thead>
    <tbody>${itemsHtml}</tbody>
    <tfoot>
      <tr>
        <td colspan="2" style="padding:10px 0;font-weight:bold;text-align:right;">Total</td>
        <td style="padding:10px 0;font-weight:bold;text-align:right;font-size:16px;">$${order.totalAmount.toLocaleString("es-CO")}</td>
      </tr>
    </tfoot>
  </table>

  <p style="margin-top:24px;">
    <a href="${siteUrl}/admin/orders/${order.orderId}"
       style="background:#16a34a;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px;">
      Ver pedido en admin →
    </a>
  </p>
</div>`;

  await createTransporter().sendMail({
    from:
      process.env.SMTP_FROM_EMAIL ||
      `"Todo Eléctrico Víctor" <${process.env.SMTP_USER}>`,
    to: adminEmail,
    subject: `Nuevo pedido pagado #${shortId} — $${order.totalAmount.toLocaleString("es-CO")}`,
    html,
  });
}

/** Send a WhatsApp message to yourself via CallMeBot (free service).
 *  Requires CALLMEBOT_API_KEY env var.
 *  Register at https://www.callmebot.com/blog/free-api-whatsapp-messages/
 */
export async function sendAdminWhatsAppNotification(order: OrderEmailData) {
  const apiKey = process.env.CALLMEBOT_API_KEY;
  const phone =
    process.env.CALLMEBOT_PHONE || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  if (!apiKey || !phone) return;

  const shortId = order.orderId.slice(0, 8);
  const itemsText = order.items
    .map((i) => `  • ${i.productName} x${i.quantity}`)
    .join("\n");

  const message = [
    `🛒 Nuevo pedido pagado #${shortId}`,
    `Cliente: ${order.customerName ?? "—"} | ${order.customerPhone ?? "—"}`,
    `Productos:\n${itemsText}`,
    `Total: $${order.totalAmount.toLocaleString("es-CO")}`,
  ].join("\n");

  const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(message)}&apikey=${apiKey}`;

  await fetch(url).catch((err) =>
    console.error("WhatsApp notification failed:", err),
  );
}
