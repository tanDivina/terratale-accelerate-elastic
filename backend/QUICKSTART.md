# TerraTale Backend - Quick Start Guide

Since the backend needs to run on your local machine (not in the browser), follow these steps:

## Prerequisites

You need:
1. **Elastic API Key** - Get from https://cloud.elastic.co/
   - Navigate to your project
   - Go to Management → API Keys
   - Create or copy an API key with `read_onechat` permissions

2. **Google API Key** - Get from https://ai.google.dev/
   - Create a new API key
   - Ensure Gemini 2.5 Flash access is enabled

## Setup Steps

### 1. Edit the `.env` file

Open `backend/.env` and replace the placeholder values:

```env
ELASTIC_API_KEY=your_actual_elastic_api_key_here
GOOGLE_API_KEY=your_actual_google_api_key_here
```

### 2. Install Dependencies

Open a terminal in the `backend` directory and run:

```bash
# Create virtual environment
python3 -m venv venv

# Activate it
# On Mac/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Populate Wildlife Data

#### A. Populate Wildlife Images (Required)
Run this script to create the Elasticsearch index and add sample wildlife photos:

```bash
python scripts/populate_wildlife_images.py
```

You should see:
```
✓ Index 'wildlife-images' created successfully
✓ Indexed: Great Blue Heron
✓ Indexed: Green Sea Turtle
...
```

#### B. Sync Species Database (Optional - Recommended)
Run this to sync 71 wildlife species from Supabase to Elasticsearch:

```bash
python scripts/sync_supabase_to_elastic.py
```

You should see:
```
============================================================
Wildlife Species Sync: Supabase → Elasticsearch
============================================================

[1/3] Fetching species from Supabase...
✓ Fetched 71 species from Supabase

[2/3] Creating/verifying Elasticsearch index...
✓ Index 'wildlife-species' created successfully

[3/3] Syncing species to Elasticsearch...
✓ Successfully indexed 71 species to Elasticsearch

============================================================
✓ Sync completed successfully!

Summary:
  - Total species synced: 71
  - By category:
    • bird: 30
    • mammal: 10
    • plant: 24
    • reptile: 7
============================================================
```

This creates a searchable database of San San Pond Sak species including endangered manatees, sea turtles, jaguars, and primates.

### 4. Start the Backend Server

```bash
python -m app.main
```

You should see:
```
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 5. Test It Works

Open a new terminal and test:

```bash
curl http://localhost:8000/health
```

Should return:
```json
{"status": "healthy"}
```

## Your Frontend is Ready!

Your frontend is already configured to connect to `ws://localhost:8000/ws`.

Once the backend is running, refresh your frontend and start chatting!

## Testing the Integration

Try these queries in the chat:
- "Tell me about herons in the wetlands"
- "Show me pictures of sloths"
- "What animals live in the mangroves?"

## Troubleshooting

### Port 8000 already in use?

Change the port in `backend/.env`:
```env
PORT=8001
```

Then update frontend `.env`:
```env
VITE_BACKEND_WS_URL=ws://localhost:8001/ws
```

### Elastic API key not working?

1. Check your API key has `read_onechat` privileges
2. Verify the Elastic Cloud URL is correct
3. Ensure your agent `terratale-qa-agent` exists

### Google API errors?

1. Verify your API key is active
2. Check you have Gemini 2.5 Flash access
3. Ensure you haven't exceeded rate limits

### No images found?

Re-run the population script:
```bash
python scripts/populate_wildlife_images.py
```

## Need Help?

Check the detailed guides:
- `backend/SETUP.md` - Complete setup guide
- `backend/README.md` - API documentation
