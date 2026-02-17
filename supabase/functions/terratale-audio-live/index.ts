import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface LiveAPIConfig {
  model: string;
  systemInstruction?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  const upgrade = req.headers.get("upgrade") || "";
  
  if (upgrade.toLowerCase() !== "websocket") {
    return new Response(
      JSON.stringify({ error: "Expected WebSocket upgrade" }),
      {
        status: 426,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    const geminiApiKey = Deno.env.get('GOOGLE_API_KEY');
    const geminiModel = 'gemini-2.0-flash-live-001';

    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: 'Gemini API key not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { socket: clientSocket, response } = Deno.upgradeWebSocket(req);

    const geminiWsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${geminiApiKey}`;
    
    let geminiSocket: WebSocket | null = null;

    clientSocket.onopen = () => {
      console.log('Client connected to proxy');
      
      geminiSocket = new WebSocket(geminiWsUrl);

      geminiSocket.onopen = () => {
        console.log('Connected to Gemini Live API');
        
        const setupMessage = {
          setup: {
            model: `models/${geminiModel}`,
            generation_config: {
              response_modalities: ["AUDIO"],
              temperature: 0.7,
            },
            system_instruction: {
              parts: [{
                text: `You are TerraTale AI, a knowledgeable guide for the San San Pond Sak Wetlands in Bocas del Toro, Panama. You help visitors learn about the wetlands' diverse wildlife including jaguars, manatees, sea turtles, and hundreds of bird species. Provide engaging, educational responses that inspire appreciation for this natural treasure. Keep responses conversational and natural since you're speaking to the visitor.`
              }]
            }
          }
        };
        
        geminiSocket!.send(JSON.stringify(setupMessage));
      };

      geminiSocket.onmessage = (event) => {
        try {
          if (clientSocket.readyState === WebSocket.OPEN) {
            clientSocket.send(event.data);
          }
        } catch (error) {
          console.error('Error forwarding to client:', error);
        }
      };

      geminiSocket.onerror = (error) => {
        console.error('Gemini WebSocket error:', error);
        if (clientSocket.readyState === WebSocket.OPEN) {
          clientSocket.send(JSON.stringify({ error: 'Gemini API error' }));
        }
      };

      geminiSocket.onclose = () => {
        console.log('Gemini WebSocket closed');
        if (clientSocket.readyState === WebSocket.OPEN) {
          clientSocket.close();
        }
      };
    };

    clientSocket.onmessage = (event) => {
      try {
        if (geminiSocket && geminiSocket.readyState === WebSocket.OPEN) {
          geminiSocket.send(event.data);
        }
      } catch (error) {
        console.error('Error forwarding to Gemini:', error);
      }
    };

    clientSocket.onerror = (error) => {
      console.error('Client WebSocket error:', error);
    };

    clientSocket.onclose = () => {
      console.log('Client disconnected');
      if (geminiSocket && geminiSocket.readyState === WebSocket.OPEN) {
        geminiSocket.close();
      }
    };

    return response;

  } catch (error) {
    console.error('WebSocket setup error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
