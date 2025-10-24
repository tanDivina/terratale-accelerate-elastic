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

  const data = {
    SUPABASE_URL: Deno.env.get('SUPABASE_URL'),
    SUPABASE_ANON_KEY: Deno.env.get('SUPABASE_ANON_KEY'),
    SUPABASE_SERVICE_ROLE_KEY: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
    GOOGLE_API_KEY: Deno.env.get('GOOGLE_API_KEY'),
    ELASTIC_CLOUD_URL: Deno.env.get('ELASTIC_CLOUD_URL'),
    ELASTIC_API_KEY: Deno.env.get('ELASTIC_API_KEY'),
    WILDLIFE_IMAGE_INDEX: Deno.env.get('WILDLIFE_IMAGE_INDEX'),
  };

  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
});