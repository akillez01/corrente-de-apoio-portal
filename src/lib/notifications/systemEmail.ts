import "server-only";

const DEFAULT_RECIPIENT = "daimesolidariedade@gmail.com";

export async function sendSystemEmailNotification({
  event,
  recordId,
  path,
}: {
  event: string;
  recordId: string;
  path: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (!apiKey || !from) {
    console.warn(
      "[system-email] Notification not sent: configure RESEND_API_KEY and RESEND_FROM_EMAIL.",
    );
    return false;
  }

  const recipient = process.env.SYSTEM_NOTIFICATION_EMAIL?.trim() || DEFAULT_RECIPIENT;
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  const text = [
    "O portal Daime Solidariedade recebeu um novo cadastro.",
    `Tipo: ${event}`,
    `Referência: ${recordId}`,
    "Acesse o portal para consultar: {{portalLink}}",
    "",
    "Este aviso não contém dados pessoais nem anexos. Consulte as informações somente após autenticar-se no portal.",
  ].join("\n");

  try {
    const link = new URL(path, baseUrl).toString();
    const emailText = text.replace("{{portalLink}}", link);
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [recipient],
        subject: `Daime Solidariedade: novo cadastro (${event})`,
        text: emailText,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      console.error(`[system-email] Notification delivery failed (HTTP ${response.status}).`);
      return false;
    }
    return true;
  } catch (error) {
    console.error(
      "[system-email] Notification delivery failed.",
      error instanceof Error ? error.name : "UnknownError",
    );
    return false;
  }
}
