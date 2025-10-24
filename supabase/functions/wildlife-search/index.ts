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
            fields: ["common_name", "english_name", "species_name", "photo_description", "conservation_status"],
            fuzziness: "AUTO"
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
      ...hit._source
    }));

    const seenSpecies = new Set<string>();
    const images = allImages.filter((image: any) => {
      if (seenSpecies.has(image.species_name)) {
        return false;
      }
      seenSpecies.add(image.species_name);
      return true;
    });

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
