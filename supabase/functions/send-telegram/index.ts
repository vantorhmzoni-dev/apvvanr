const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

interface Payload {
  source: 'home' | 'pay' | 'otp'
  text: string
  repeat?: number
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const token = Deno.env.get('TELEGRAM_BOT_TOKEN')
    const chatId = Deno.env.get('TELEGRAM_CHAT_ID')
    if (!token || !chatId) {
      return new Response(
        JSON.stringify({ error: 'Telegram secrets not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const body = (await req.json()) as Payload
    if (!body?.text || !body?.source) {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const allowed = ['home', 'pay', 'otp']
    if (!allowed.includes(body.source)) {
      return new Response(JSON.stringify({ error: 'Source not allowed' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const repeat = Math.min(Math.max(body.repeat ?? 1, 1), 3)
    const url = `https://api.telegram.org/bot${token}/sendMessage`

    for (let i = 0; i < repeat; i++) {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: new URLSearchParams({
          chat_id: chatId,
          parse_mode: 'HTML',
          disable_web_page_preview: 'true',
          text: body.text,
        }).toString(),
      })
      if (!res.ok) {
        const t = await res.text()
        console.error('Telegram error', res.status, t)
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error(e)
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
