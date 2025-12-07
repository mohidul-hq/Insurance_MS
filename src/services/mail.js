// Lightweight client-side email alert using EmailJS.
// Configure the following Vite env vars:
// VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID_LOGIN, VITE_EMAILJS_PUBLIC_KEY
// The login template should accept: email, name, time, userAgent, origin.

// Accepts optional ipAddress and message to match EmailJS template variables
export async function sendLoginAlert({ email, name, ipAddress, message }) {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID_LOGIN
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

  // If not configured, silently skip to avoid breaking login
  if (!serviceId || !templateId || !publicKey) return

  // Best-effort public IP resolution if not provided.
  let resolvedIp = typeof ipAddress === 'string' && ipAddress.trim() ? ipAddress.trim() : ''
  try {
    if (!resolvedIp) {
      const ipRes = await fetch('https://api.ipify.org?format=json')
      if (ipRes.ok) {
        const data = await ipRes.json()
        if (data && typeof data.ip === 'string') resolvedIp = data.ip
      }
    }
  } catch {
    // Non-blocking: ignore failures
  }

  const safe = (v) => (v == null ? '' : String(v))

  const payload = {
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey,
    template_params: {
      // Keep variable names aligned with the EmailJS template.
      // Variables expected: email, name, time, userAgent, origin, ipadress, message
      email: safe(email),
      name: safe(name || email),
      time: new Date().toLocaleString(),
      userAgent: safe(navigator.userAgent),
      origin: safe(window.location.origin),
      // Note: template uses misspelled key "ipadress"; match exactly.
      ipadress: safe(resolvedIp || 'unknown'),
      message: safe(message),
    },
  }

  // EmailJS REST endpoint
  const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    // Non-blocking failure; throw to allow optional catch by caller
    const text = await res.text().catch(() => '')
    throw new Error(`Login alert email failed: ${res.status} ${text}`)
  }
}
