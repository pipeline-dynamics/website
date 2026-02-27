import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_URL = "https://api.resend.com/emails";
const TO_EMAIL = Deno.env.get("CONTACT_TO_EMAIL") || "contact@example.com";
const FROM_EMAIL = "contact@pipelinedynamics.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  "project-type"?: string;
  message: string;
}

function validateFormData(data: unknown): { valid: true; data: ContactFormData } | { valid: false; error: string } {
  if (!data || typeof data !== "object") {
    return { valid: false, error: "Invalid request body" };
  }

  const form = data as Record<string, unknown>;

  if (!form.name || typeof form.name !== "string" || form.name.trim().length === 0) {
    return { valid: false, error: "Name is required" };
  }

  if (!form.email || typeof form.email !== "string") {
    return { valid: false, error: "Email is required" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(form.email.trim())) {
    return { valid: false, error: "Invalid email address" };
  }

  if (!form.message || typeof form.message !== "string" || form.message.trim().length === 0) {
    return { valid: false, error: "Message is required" };
  }

  if (form.name.trim().length > 200) {
    return { valid: false, error: "Name is too long" };
  }

  if (form.message.trim().length > 5000) {
    return { valid: false, error: "Message is too long" };
  }

  return {
    valid: true,
    data: {
      name: form.name.trim(),
      email: form.email.trim(),
      company: typeof form.company === "string" ? form.company.trim() : undefined,
      "project-type": typeof form["project-type"] === "string" ? form["project-type"].trim() : undefined,
      message: form.message.trim(),
    },
  };
}

function buildEmailHtml(data: ContactFormData): string {
  const projectTypeLabels: Record<string, string> = {
    pipelines: "Pipelines",
    warehouse: "Warehouse setup",
    analytics: "dbt / data modeling",
    migration: "Migration",
    infrastructure: "New data platform",
    embedded: "Ongoing / embedded work",
    other: "Something else",
  };

  const projectType = data["project-type"]
    ? projectTypeLabels[data["project-type"]] ?? data["project-type"]
    : "Not specified";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { border-bottom: 2px solid #6366f1; padding-bottom: 16px; margin-bottom: 24px; }
    .header h1 { font-size: 20px; margin: 0; color: #6366f1; }
    .field { margin-bottom: 16px; }
    .label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; }
    .value { font-size: 15px; margin-top: 4px; }
    .message-box { background: #f9fafb; border-left: 3px solid #6366f1; padding: 12px 16px; border-radius: 4px; white-space: pre-wrap; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="header">
    <h1>New Contact Form Submission</h1>
  </div>

  <div class="field">
    <div class="label">From</div>
    <div class="value">${escapeHtml(data.name)} &lt;${escapeHtml(data.email)}&gt;</div>
  </div>

  ${
    data.company
      ? `<div class="field">
    <div class="label">Company</div>
    <div class="value">${escapeHtml(data.company)}</div>
  </div>`
      : ""
  }

  <div class="field">
    <div class="label">Project Type</div>
    <div class="value">${escapeHtml(projectType)}</div>
  </div>

  <div class="field">
    <div class="label">Message</div>
    <div class="value message-box">${escapeHtml(data.message)}</div>
  </div>

  <div class="footer">
    Sent via pipelinedynamics.com contact form
  </div>
</body>
</html>
`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const validation = validateFormData(body);
  if (!validation.valid) {
    return new Response(JSON.stringify({ error: validation.error }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data } = validation;

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    console.error("RESEND_API_KEY environment variable is not set");
    return new Response(JSON.stringify({ error: "Server configuration error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!TO_EMAIL) {
    console.error("CONTACT_TO_EMAIL environment variable is not set");
    return new Response(JSON.stringify({ error: "Server configuration error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const emailPayload = {
    from: `Pipeline Dynamics Contact <${FROM_EMAIL}>`,
    to: [TO_EMAIL],
    reply_to: data.email,
    subject: `New enquiry from ${data.name}${data.company ? ` (${data.company})` : ""}`,
    html: buildEmailHtml(data),
  };

  let resendResponse: Response;
  try {
    resendResponse = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    });
  } catch (err) {
    console.error("Failed to reach Resend API:", err);
    return new Response(JSON.stringify({ error: "Failed to send email" }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!resendResponse.ok) {
    const resendError = await resendResponse.text();
    console.error("Resend API error:", resendResponse.status, resendError);
    return new Response(JSON.stringify({ error: "Failed to send email" }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
