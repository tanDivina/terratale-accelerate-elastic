import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ChatRequest {
  message: string;
  conversationId?: string;
}

interface ElasticSearchResponse {
  hits: {
    hits: Array<{
      _id: string;
      _score: number;
      _source: {
        photo_image_url: string;
        photo_description: string;
        species_name?: string;
        common_name?: string;
      };
    }>;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const geminiApiKey = Deno.env.get('GOOGLE_API_KEY');
    const elasticUrl = Deno.env.get('ELASTIC_CLOUD_URL');
    const elasticApiKey = Deno.env.get('ELASTIC_API_KEY');

    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({
          type: 'text',
          content: 'The chat service is not fully configured yet. Please set up the GOOGLE_API_KEY environment variable in your Supabase project settings.',
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { message, conversationId }: ChatRequest = await req.json();

    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid message' }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const messageLower = message.toLowerCase();
    const shouldSearchImages = checkIfImageSearch(messageLower);

    if (shouldSearchImages && elasticUrl && elasticApiKey) {
      const images = await searchWildlifeImages(messageLower);
      return new Response(
        JSON.stringify({
          type: 'image_search_results',
          content: images,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const response = await queryGemini(message, conversationId);

    return new Response(
      JSON.stringify({
        type: 'text',
        content: response,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error('Chat error:', error);
    return new Response(
      JSON.stringify({
        type: 'text',
        content: `I apologize, but I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please make sure the Edge Function is properly configured.`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function checkIfImageSearch(message: string): boolean {
  const explicitImageKeywords = [
    'show me', 'show images', 'show pictures', 'show photos',
    'pictures of', 'photos of', 'images of'
  ];

  for (const phrase of explicitImageKeywords) {
    if (message.includes(phrase)) return true;
  }

  const questionPatterns = [
    'what is', 'what could', 'what might', 'what would',
    'i saw', 'i spotted', 'i found', 'i noticed',
    'looks like', 'resembles', 'similar to', 'reminds me'
  ];

  for (const pattern of questionPatterns) {
    if (message.includes(pattern)) return false;
  }

  return false;
}

async function searchWildlifeImages(query: string): Promise<any[]> {
  const elasticUrl = Deno.env.get('ELASTIC_CLOUD_URL');
  const elasticApiKey = Deno.env.get('ELASTIC_API_KEY');
  const wildlifeIndex = Deno.env.get('WILDLIFE_IMAGE_INDEX') || 'wildlife-images';

  if (!elasticUrl || !elasticApiKey) {
    throw new Error('Elastic credentials not configured');
  }

  const searchUrl = `${elasticUrl.replace(/\/$/, '')}/${wildlifeIndex}/_search`;

  const searchBody = {
    query: {
      multi_match: {
        query: query,
        fields: ['photo_description', 'species_name', 'common_name'],
        fuzziness: 'AUTO',
      },
    },
    size: 6,
  };

  const response = await fetch(searchUrl, {
    method: 'POST',
    headers: {
      'Authorization': `ApiKey ${elasticApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(searchBody),
  });

  if (!response.ok) {
    throw new Error(`Elastic search failed: ${response.statusText}`);
  }

  const result: ElasticSearchResponse = await response.json();
  const hits = result.hits?.hits || [];

  return hits.map(hit => ({
    _id: hit._id,
    _score: hit._score,
    fields: {
      photo_image_url: [hit._source.photo_image_url],
      photo_description: [hit._source.photo_description],
    },
  }));
}

async function queryGemini(
  input: string,
  conversationId?: string
): Promise<string> {
  const geminiApiKey = Deno.env.get('GOOGLE_API_KEY');
  const geminiModel = Deno.env.get('GEMINI_MODEL') || 'gemini-2.5-flash-native-audio-preview-09-2025';

  if (!geminiApiKey) {
    throw new Error('Gemini API key not configured');
  }

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`;

  const systemPrompt = `You are TerraTale AI, a knowledgeable guide for the San San Pond Sak Wetlands in Bocas del Toro, Panama.

You help visitors:
- Learn about the wetlands' diverse wildlife including jaguars, manatees, sea turtles, and hundreds of bird species
- Understand the importance of this Ramsar-designated protected area
- Explore the unique ecosystem including mangroves, peat swamps, and coastal forests
- Discover conservation efforts and sustainable tourism practices

Provide engaging, educational responses that inspire appreciation for this natural treasure. Keep responses concise and conversational.`;

  const payload = {
    contents: [{
      parts: [{
        text: `${systemPrompt}\n\nUser question: ${input}`
      }]
    }],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    }
  };

  const response = await fetch(geminiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API error:', errorText);
    throw new Error(`Gemini API failed (${response.status}): ${response.statusText}`);
  }

  const result = await response.json();

  const completionText = result.candidates?.[0]?.content?.parts?.[0]?.text || '';

  return completionText || 'I apologize, but I could not generate a response.';
}
