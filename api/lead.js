function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function clean(value, max = 300) {
  return String(value ?? '').trim().slice(0, max);
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const body = req.body || {};

  // Honeypot: bots often fill hidden fields.
  if (clean(body.website)) {
    return res.status(200).json({ ok: true });
  }

  const lead = {
    brand: clean(body.brand, 80),
    model: clean(body.model, 100),
    year: clean(body.year, 10),
    package: clean(body.package, 100),
    zones: Array.isArray(body.zones) ? body.zones.map(v => clean(v, 80)).slice(0, 20) : [],
    timeline: clean(body.timeline, 100),
    name: clean(body.name, 100),
    phone: clean(body.phone, 80),
    telegram: clean(body.telegram, 100),
    utm_source: clean(body.utm_source, 120),
    utm_medium: clean(body.utm_medium, 120),
    utm_campaign: clean(body.utm_campaign, 160),
    utm_content: clean(body.utm_content, 160),
    utm_term: clean(body.utm_term, 160),
    referrer: clean(body.referrer, 500),
    landing_page: clean(body.landing_page, 500),
    timestamp: clean(body.timestamp, 80) || new Date().toISOString(),
  };

  if (!lead.brand || !lead.model || !lead.package || !lead.timeline || (!lead.phone && !lead.telegram)) {
    return res.status(400).json({ ok: false, error: 'Missing required lead fields' });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error('Telegram env vars are not configured');
    return res.status(500).json({ ok: false, error: 'Lead delivery is not configured' });
  }

  const source = [lead.utm_source, lead.utm_medium].filter(Boolean).join(' / ') || 'direct';
  const car = [lead.brand, lead.model, lead.year].filter(Boolean).join(' ');
  const zones = lead.zones.length ? lead.zones.join(', ') : '—';

  const message = [
    '<b>🔥 Новый лид — PPF</b>',
    '',
    `🚘 <b>Авто:</b> ${escapeHtml(car)}`,
    `🛡 <b>Защита:</b> ${escapeHtml(lead.package)}`,
    `🧩 <b>Зоны:</b> ${escapeHtml(zones)}`,
    `⏱ <b>Когда:</b> ${escapeHtml(lead.timeline)}`,
    '',
    `👤 <b>Имя:</b> ${escapeHtml(lead.name || '—')}`,
    `📱 <b>Телефон / WhatsApp:</b> ${escapeHtml(lead.phone || '—')}`,
    `✈️ <b>Telegram:</b> ${escapeHtml(lead.telegram || '—')}`,
    '',
    `📣 <b>Источник:</b> ${escapeHtml(source)}`,
    lead.utm_campaign ? `🎯 <b>Campaign:</b> ${escapeHtml(lead.utm_campaign)}` : '',
    lead.utm_term ? `🔎 <b>Запрос:</b> ${escapeHtml(lead.utm_term)}` : '',
    `🔗 <b>Landing:</b> ${escapeHtml(lead.landing_page || '—')}`,
    `🕒 <b>Время:</b> ${escapeHtml(lead.timestamp)}`,
  ].filter(Boolean).join('\n');

  try {
    const tgResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    const tgResult = await tgResponse.json().catch(() => ({}));
    if (!tgResponse.ok || tgResult.ok === false) {
      console.error('Telegram error', tgResult);
      return res.status(502).json({ ok: false, error: 'Telegram delivery failed' });
    }

    // Optional Google Sheets mirror via Apps Script webhook.
    const sheetsWebhook = process.env.GOOGLE_SHEETS_WEBHOOK;
    if (sheetsWebhook) {
      try {
        const sheetResponse = await fetch(sheetsWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lead),
        });
        if (!sheetResponse.ok) console.error('Google Sheets webhook failed', sheetResponse.status);
      } catch (sheetError) {
        // Telegram is the primary notification channel; don't lose a valid lead because Sheets is down.
        console.error('Google Sheets webhook error', sheetError);
      }
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Lead handler error', error);
    return res.status(500).json({ ok: false, error: 'Lead delivery failed' });
  }
};
