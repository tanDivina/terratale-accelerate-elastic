const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  const apiKey = Deno.env.get('GOOGLE_API_KEY');
  const model = 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: 'Say hello' }] }]
    })
  });
  
  const text = await response.text();
  
  return new Response(JSON.stringify({
    status: response.status,
    statusText: response.statusText,
    result: text.substring(0, 500)
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
});