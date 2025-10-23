# Edge Function Setup

The TerraTale chat functionality now uses a Supabase Edge Function instead of the Python backend. This allows the app to work immediately without needing to run a separate Python server.

## Required Environment Variables

To make the Edge Function work, you need to configure the following secrets in your Supabase project:

1. Go to your Supabase Dashboard
2. Navigate to **Project Settings** > **Edge Functions**
3. Add the following secrets:

```bash
ELASTIC_CLOUD_URL=your-elastic-cloud-url
ELASTIC_API_KEY=your-elastic-api-key
ELASTIC_AGENT_ID=terratale-qa-agent
WILDLIFE_IMAGE_INDEX=wildlife-images
```

## Using Supabase CLI (Alternative Method)

If you have the Supabase CLI installed, you can set secrets using:

```bash
supabase secrets set ELASTIC_CLOUD_URL=your-elastic-cloud-url
supabase secrets set ELASTIC_API_KEY=your-elastic-api-key
supabase secrets set ELASTIC_AGENT_ID=terratale-qa-agent
supabase secrets set WILDLIFE_IMAGE_INDEX=wildlife-images
```

## Testing the Edge Function

Once the secrets are configured, the chat interface will automatically connect to the Edge Function at:

```
https://your-project-ref.supabase.co/functions/v1/terratale-chat
```

The frontend is already configured to use this endpoint automatically.

## What Changed?

- **Before**: The app used WebSocket connections to a Python FastAPI backend
- **After**: The app uses HTTP requests to a Supabase Edge Function

This makes deployment simpler and eliminates the need to manage a separate Python server.
