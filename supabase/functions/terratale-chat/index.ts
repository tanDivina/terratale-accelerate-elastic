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
    const elasticUrl = Deno.env.get('ELASTIC_CLOUD_URL');
    const elasticApiKey = Deno.env.get('ELASTIC_API_KEY');

    if (!elasticUrl || !elasticApiKey) {
      return new Response(
        JSON.stringify({
          type: 'text',
          content: 'The chat service is not fully configured yet. Please set up the ELASTIC_CLOUD_URL and ELASTIC_API_KEY environment variables in your Supabase project settings.',
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

    if (shouldSearchImages) {
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

    const response = await queryElasticAgent(message, conversationId);

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
        content: `I apologize, but I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please make sure the Edge Function is properly configured with Elastic credentials.`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function checkIfImageSearch(message: string): boolean {
  const imageKeywords = [
    'show', 'see', 'picture', 'photo', 'image', 'look', 'view',
    'what does', 'how does', 'appearance', 'looks like'
  ];

  const animalKeywords = [
    'bird', 'fish', 'manatee', 'dolphin', 'heron', 'kingfisher',
    'turtle', 'sloth', 'monkey', 'iguana', 'crab', 'butterfly',
    'frog', 'snake', 'lizard', 'bat', 'otter', 'caiman'
  ];

  for (const keyword of imageKeywords) {
    if (message.includes(keyword)) return true;
  }

  for (const animal of animalKeywords) {
    if (message.includes(animal)) {
      const hasVisualContext = imageKeywords.some(k => message.includes(k));
      if (hasVisualContext) return true;
    }
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

async function queryElasticAgent(
  input: string,
  conversationId?: string
): Promise<string> {
  const elasticUrl = Deno.env.get('ELASTIC_CLOUD_URL');
  const elasticApiKey = Deno.env.get('ELASTIC_API_KEY');
  const agentId = Deno.env.get('ELASTIC_AGENT_ID') || 'terratale-qa-agent';

  if (!elasticUrl || !elasticApiKey) {
    throw new Error('Elastic credentials not configured');
  }

  const converseUrl = `${elasticUrl.replace(/\/$/, '')}/api/agent_builder/converse/async`;

  const payload: any = {
    input: input,
    agent_id: agentId,
  };

  if (conversationId) {
    payload.conversation_id = conversationId;
  }

  const response = await fetch(converseUrl, {
    method: 'POST',
    headers: {
      'Authorization': `ApiKey ${elasticApiKey}`,
      'kbn-xsrf': 'true',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Elastic agent failed: ${response.statusText}`);
  }

  let fullResponse = '';
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    throw new Error('No response body');
  }

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.trim() && line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          if (data.type === 'content' && data.content) {
            fullResponse += data.content;
          }
        } catch (e) {
          console.error('Failed to parse SSE data:', e);
        }
      }
    }
  }

  return fullResponse || 'I apologize, but I could not generate a response.';
}
