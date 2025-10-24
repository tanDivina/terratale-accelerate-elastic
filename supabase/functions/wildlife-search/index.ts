import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SearchParams {
  query?: string;
  size?: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const elasticUrl = Deno.env.get("ELASTIC_CLOUD_URL");
    const elasticApiKey = Deno.env.get("ELASTIC_API_KEY");
    const indexName = Deno.env.get("WILDLIFE_IMAGE_INDEX") || "wildlife-images";

    if (!elasticUrl || !elasticApiKey) {
      throw new Error("Elasticsearch configuration missing");
    }

    const url = new URL(req.url);
    const searchQuery = url.searchParams.get("q") || "";
    const size = parseInt(url.searchParams.get("size") || "100");

    const searchUrl = `${elasticUrl}/${indexName}/_search`;
    
    let elasticQuery;
    if (searchQuery.trim() === "") {
      elasticQuery = {
        query: {
          match_all: {}
        },
        size: size
      };
    } else {
      elasticQuery = {
        query: {
          multi_match: {
            query: searchQuery,
            fields: ["common_name^2", "species_name^2", "photo_description", "conservation_status", "location"],
            fuzziness: "AUTO",
            operator: "or"
          }
        },
        size: size
      };
    }

    const response = await fetch(searchUrl, {
      method: "POST",
      headers: {
        "Authorization": `ApiKey ${elasticApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(elasticQuery),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Elasticsearch error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    const allImages = result.hits.hits.map((hit: any) => ({
      id: hit._id,
      score: hit._score || 0,
      ...hit._source
    }));

    const speciesMap = new Map<string, any>();

    for (const image of allImages) {
      const existing = speciesMap.get(image.species_name);

      if (!existing) {
        speciesMap.set(image.species_name, image);
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
          speciesMap.set(image.species_name, image);
        } else if (!existingIsCemetery && !isCemetery && image.score > existing.score) {
          speciesMap.set(image.species_name, image);
        }
      }
    }

    const images = Array.from(speciesMap.values());

    return new Response(
      JSON.stringify({ images, total: images.length }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error searching wildlife images:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});