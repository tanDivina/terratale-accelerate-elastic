import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

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

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const elasticUrl = Deno.env.get("ELASTIC_CLOUD_URL")!;
    const elasticApiKey = Deno.env.get("ELASTIC_API_KEY")!;
    const indexName = Deno.env.get("WILDLIFE_IMAGE_INDEX") || "wildlife-images";

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Fetching images from Supabase...");
    const { data: images, error } = await supabase
      .from("wildlife_images")
      .select("*");

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    console.log(`Fetched ${images.length} images from Supabase`);

    const elasticIndexUrl = `${elasticUrl}/${indexName}`;
    const headers = {
      "Authorization": `ApiKey ${elasticApiKey}`,
      "Content-Type": "application/json",
    };

    console.log("Deleting existing index...");
    await fetch(elasticIndexUrl, {
      method: "DELETE",
      headers,
    });

    console.log("Creating new index with mappings...");
    const mapping = {
      mappings: {
        properties: {
          id: { type: "keyword" },
          photo_image_url: { type: "keyword" },
          photo_description: { type: "text" },
          species_name: { type: "text", fields: { keyword: { type: "keyword" } } },
          common_name: { type: "text", fields: { keyword: { type: "keyword" } } },
          location: { type: "text" },
          conservation_status: { type: "keyword" },
          created_at: { type: "date" },
          updated_at: { type: "date" },
        },
      },
    };

    const createResponse = await fetch(elasticIndexUrl, {
      method: "PUT",
      headers,
      body: JSON.stringify(mapping),
    });

    if (!createResponse.ok) {
      const error = await createResponse.text();
      throw new Error(`Failed to create index: ${error}`);
    }

    console.log("Index created successfully");

    console.log("Indexing documents...");
    const bulkUrl = `${elasticUrl}/${indexName}/_bulk`;
    const bulkHeaders = {
      "Authorization": `ApiKey ${elasticApiKey}`,
      "Content-Type": "application/x-ndjson",
    };

    const bulkData = images.map(img => {
      return `{"index":{"_id":"${img.id}"}}\n${JSON.stringify(img)}\n`;
    }).join("");

    const bulkResponse = await fetch(bulkUrl, {
      method: "POST",
      headers: bulkHeaders,
      body: bulkData,
    });

    if (!bulkResponse.ok) {
      const error = await bulkResponse.text();
      throw new Error(`Failed to bulk index: ${error}`);
    }

    const bulkResult = await bulkResponse.json();
    console.log("Bulk indexing completed");

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully synced ${images.length} wildlife images`,
        details: {
          total: images.length,
          errors: bulkResult.errors,
        },
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error syncing wildlife data:", error);
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
