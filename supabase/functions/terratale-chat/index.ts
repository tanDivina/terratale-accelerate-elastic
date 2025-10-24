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
        english_name?: string;
        location?: string;
        conservation_status?: string;
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
    const wantsBothTextAndImages = shouldSearchImages && (
      messageLower.includes('tell me') ||
      messageLower.includes('explain') ||
      messageLower.includes('about') ||
      messageLower.includes('what are') ||
      messageLower.includes('describe')
    );

    if (wantsBothTextAndImages && elasticUrl && elasticApiKey) {
      const searchQuery = await getContextualSearchQuery(messageLower, conversationId);
      const [images, textResponse] = await Promise.all([
        searchWildlifeImages(searchQuery),
        queryGemini(message, conversationId)
      ]);

      if (images.length === 0) {
        const enhancedResponse = await queryGemini(
          `${message}\n\nNote: We don't have photos of "${searchQuery}" in our collection yet. Include this information naturally in your response.`,
          conversationId
        );

        return new Response(
          JSON.stringify({
            type: 'text',
            content: enhancedResponse,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({
          type: 'combined',
          text: textResponse,
          images: images,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (shouldSearchImages && elasticUrl && elasticApiKey) {
      const searchQuery = await getContextualSearchQuery(messageLower, conversationId);
      const images = await searchWildlifeImages(searchQuery);

      if (images.length === 0) {
        const noImagesResponse = await queryGemini(
          `The user asked for photos of "${searchQuery}" but we don't have any photos of that species in our collection yet. Acknowledge this politely and provide a brief interesting description of the species if it's found in San San Pond Sak, or suggest they explore other wildlife we have documented.`,
          conversationId
        );

        return new Response(
          JSON.stringify({
            type: 'text',
            content: noImagesResponse,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

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
    'pictures of', 'photos of', 'images of',
    'do you have photos', 'do you have pictures', 'do you have images',
    'got any photos', 'got any pictures', 'got any images',
    'any photos', 'any pictures', 'any images',
    'can i see', 'let me see', 'want to see'
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

async function getContextualSearchQuery(message: string, conversationId?: string): Promise<string> {
  const vagueQuestions = [
    'what do they look like', 'show me', 'pictures', 'images', 'photos', 'what are they',
    'do you have photos', 'do you have pictures', 'any photos', 'any pictures', 'got photos'
  ];
  const isVague = vagueQuestions.some(q => message.includes(q)) && message.split(' ').length < 8;

  if (!isVague || !conversationId) {
    return message;
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseKey) {
    return message;
  }

  try {
    const messagesResponse = await fetch(
      `${supabaseUrl}/rest/v1/messages?conversation_id=eq.${conversationId}&order=created_at.desc&limit=5`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        }
      }
    );

    if (!messagesResponse.ok) {
      return message;
    }

    const messages = await messagesResponse.json();

    // First check for specific species mentions (look for capitalized species names)
    for (const msg of messages) {
      const content = msg.content || '';

      // Look for patterns like "Boat-billed Heron" or "Great Blue Heron"
      const speciesPattern = /\b([A-Z][a-z]+(?:-[A-Z][a-z]+)?(?:\s+[A-Z][a-z]+)*)\s+(Heron|Egret|Toucan|Parrot|Monkey|Sloth|Jaguar|Manatee|Turtle|Caiman|Crocodile|Frog|Snake|Bat|Dolphin|Kingfisher|Peccary)\b/g;
      const matches = content.match(speciesPattern);

      if (matches && matches.length > 0) {
        // Return the most recent specific species mention
        return matches[matches.length - 1];
      }
    }

    // Fall back to generic animal keywords
    const animals = ['boat-billed heron', 'manatee', 'jaguar', 'turtle', 'sloth', 'monkey', 'bird', 'toucan', 'parrot', 'heron', 'egret', 'caiman', 'crocodile', 'frog', 'snake', 'bat', 'dolphin', 'kingfisher'];

    for (const msg of messages) {
      const content = (msg.content || '').toLowerCase();
      for (const animal of animals) {
        if (content.includes(animal)) {
          return animal;
        }
      }
    }
  } catch (error) {
    console.error('Error getting contextual search:', error);
  }

  return message;
}

async function searchWildlifeImages(query: string): Promise<any[]> {
  const elasticUrl = Deno.env.get('ELASTIC_CLOUD_URL');
  const elasticApiKey = Deno.env.get('ELASTIC_API_KEY');
  const wildlifeIndex = Deno.env.get('WILDLIFE_IMAGE_INDEX') || 'wildlife-images';

  if (!elasticUrl || !elasticApiKey) {
    throw new Error('Elastic credentials not configured');
  }

  const searchUrl = `${elasticUrl.replace(/\/$/, '')}/${wildlifeIndex}/_search`;

  const conservationStatuses = [
    'critically endangered',
    'endangered',
    'vulnerable',
    'near threatened',
    'threatened',
    'declining'
  ];

  let searchBody: any;

  const queryLower = query.toLowerCase();
  const hasConservationKeyword = conservationStatuses.some(status =>
    queryLower.includes(status) && queryLower.includes('species')
  );

  if (hasConservationKeyword) {
    const matchedStatus = conservationStatuses.find(status => queryLower.includes(status));
    searchBody = {
      query: {
        match: {
          conservation_status: matchedStatus
        }
      },
      size: 50,
    };
  } else {
    searchBody = {
      query: {
        bool: {
          should: [
            {
              multi_match: {
                query: query,
                fields: ['english_name^3', 'common_name^3', 'species_name^2'],
                type: 'best_fields',
                fuzziness: '1',
              }
            },
            {
              multi_match: {
                query: query,
                fields: ['photo_description'],
                type: 'phrase',
              }
            }
          ],
          minimum_should_match: 1,
        }
      },
      min_score: 2.0,
      size: 20,
    };
  }

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

  const allImages = hits.map(hit => ({
    _id: hit._id,
    _score: hit._score,
    ...hit._source,
  }));

  const speciesMap = new Map<string, any>();

  for (const image of allImages) {
    const existing = speciesMap.get(image.species_name || '');

    if (!existing) {
      speciesMap.set(image.species_name || '', image);
    } else {
      const currentDesc = (image.photo_description || '').toLowerCase();
      const existingDesc = (existing.photo_description || '').toLowerCase();
      const currentUrl = (image.photo_image_url || '').toLowerCase();
      const existingUrl = (existing.photo_image_url || '').toLowerCase();

      const isCemetery = currentUrl.includes('cemetery') || currentDesc.includes('cemetery') ||
                        currentDesc.includes('grave') || currentDesc.includes('tomb');
      const existingIsCemetery = existingUrl.includes('cemetery') || existingDesc.includes('cemetery') ||
                                 existingDesc.includes('grave') || existingDesc.includes('tomb');

      if (existingIsCemetery && !isCemetery) {
        speciesMap.set(image.species_name || '', image);
      } else if (!existingIsCemetery && !isCemetery && image._score > existing._score) {
        speciesMap.set(image.species_name || '', image);
      }
    }
  }

  const queryLowerForCheck = query.toLowerCase();
  const conservationStatusesCheck = [
    'critically endangered', 'endangered', 'vulnerable',
    'near threatened', 'threatened', 'declining'
  ];
  const isConservationSearch = conservationStatusesCheck.some(status =>
    queryLowerForCheck.includes(status) && queryLowerForCheck.includes('species')
  );

  const maxResults = isConservationSearch ? 12 : 6;
  const uniqueImages = Array.from(speciesMap.values()).slice(0, maxResults);

  return uniqueImages.map(img => ({
    _id: img._id,
    _score: img._score,
    fields: {
      photo_image_url: [img.photo_image_url],
      photo_description: [img.english_name ? `${img.english_name} (${img.species_name})` : img.photo_description],
    },
  }));
}

async function queryGemini(
  input: string,
  conversationId?: string
): Promise<string> {
  const geminiApiKey = Deno.env.get('GOOGLE_API_KEY');
  const model = 'gemini-2.5-flash';

  if (!geminiApiKey) {
    throw new Error('Gemini API key not configured');
  }

  const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${geminiApiKey}`;

  const systemPrompt = `You are TerraTale AI, a knowledgeable guide for the San San Pond Sak Wetlands in Bocas del Toro, Panama.\n\nYou help visitors:\n- Learn about the wetlands' diverse wildlife including jaguars, manatees, sea turtles, and hundreds of bird species\n- Understand the importance of this Ramsar-designated protected area\n- Explore the unique ecosystem including mangroves, peat swamps, and coastal forests\n- Discover conservation efforts and sustainable tourism practices\n\nCRITICAL RULES ABOUT IMAGES:\n- NEVER say "you can see" or "here's a photo" or "let me show you" - the image system works separately\n- NEVER promise to show images that aren't already being displayed\n- NEVER say "As an AI, I can't display images" or similar phrases\n- If the user explicitly asks for photos (like "show me photos" or "do you have pictures"), suggest they ask "show me photos of [species]" to trigger the image search\n- Focus on describing wildlife and answering questions - let users request images explicitly when they want them\n\nProvide engaging, educational responses that inspire appreciation for this natural treasure. Keep responses concise and conversational.`;

  let conversationHistory = '';

  if (conversationId) {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (supabaseUrl && supabaseKey) {
      try {
        const messagesResponse = await fetch(
          `${supabaseUrl}/rest/v1/messages?conversation_id=eq.${conversationId}&order=created_at.asc&limit=10`,
          {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
            }
          }
        );

        if (messagesResponse.ok) {
          const messages = await messagesResponse.json();
          if (messages && messages.length > 0) {
            conversationHistory = '\n\nPrevious conversation:\n' +
              messages.map((msg: any) => `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n');
          }
        }
      } catch (error) {
        console.error('Error fetching conversation history:', error);
      }
    }
  }

  const payload = {
    contents: [{
      parts: [{
        text: `${systemPrompt}${conversationHistory}\n\nUser question: ${input}`
      }]
    }]
  };

  const response = await fetch(url, {
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