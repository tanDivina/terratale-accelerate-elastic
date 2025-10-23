# TerraTale Backend API

FastAPI backend integrating Elastic Agent Builder, Google Gemini LIVE API, and Elasticsearch for the TerraTale wildlife education platform.

## Features

- Real-time WebSocket communication with frontend
- Elastic Agent Builder integration for conversational AI
- Google Gemini LIVE API for natural audio responses
- Elasticsearch image search for wildlife photos
- Intent-based message routing (text vs image queries)
- Conversation state management

## Prerequisites

- Python 3.11+
- Elastic Cloud account with Agent Builder configured
- Google Cloud account with Gemini API access
- Elasticsearch index for wildlife images

## Installation

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
- `ELASTIC_CLOUD_URL`: Your Elastic Cloud URL
- `ELASTIC_API_KEY`: Your Elastic API key
- `ELASTIC_AGENT_ID`: terratale-qa-agent
- `GOOGLE_API_KEY`: Your Google Gemini API key
- `GEMINI_MODEL`: gemini-2.5-flash-native-audio-preview-09-2025

## Setting Up Elasticsearch Wildlife Image Index

Before the image search works, you need to create and populate the wildlife images index:

### Create the Index

```bash
curl -X PUT "https://your-elasticsearch-url/wildlife-images" \
  -H "Authorization: ApiKey YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "mappings": {
      "properties": {
        "photo_image_url": { "type": "keyword" },
        "photo_description": { "type": "text" },
        "species_name": { "type": "text" },
        "common_name": { "type": "text" },
        "location": { "type": "text" },
        "photographer": { "type": "keyword" },
        "date_taken": { "type": "date" }
      }
    }
  }'
```

### Populate Wildlife Data

We provide scripts to easily populate your Elasticsearch indices:

#### 1. Populate Wildlife Images (Required for image search)
```bash
python scripts/populate_wildlife_images.py
```
This will create and populate the `wildlife-images` index with sample wildlife photos.

#### 2. Sync Species Database (Optional - For hackathon)
```bash
python scripts/sync_supabase_to_elastic.py
```
This syncs the 71 wildlife species from Supabase to Elasticsearch, creating a `wildlife-species` index with:
- 30 bird species
- 24 plant species
- 10 mammal species
- 7 reptile species (including 3 endangered sea turtles)

**Note**: For the Elastic hackathon, we're using Elasticsearch as the primary database. Post-hackathon, the system will switch to Supabase as the primary database with Elasticsearch for search only.

## Running the Server

### Development Mode

```bash
python -m app.main
```

Or using uvicorn directly:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The server will start at `http://localhost:8000`

### Production Mode

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Endpoints

### HTTP Endpoints

- `GET /` - Service information
- `GET /health` - Health check

### WebSocket Endpoint

- `WS /ws` - Real-time bidirectional communication

## WebSocket Message Protocol

### Messages from Frontend

Simple text string containing user query:
```
"Show me pictures of herons"
```

### Messages to Frontend

**Text Response:**
```json
{
  "type": "text",
  "content": "Response text from agent"
}
```

**Audio Chunks:**
Binary audio data (audio/mpeg format)

**Audio End Signal:**
```json
{
  "type": "audio_end"
}
```

**Image Search Results:**
```json
{
  "type": "image_search_results",
  "content": [
    {
      "_id": "unique_id",
      "_score": 0.95,
      "fields": {
        "photo_image_url": ["https://..."],
        "photo_description": ["description"]
      }
    }
  ]
}
```

**Error:**
```json
{
  "type": "error",
  "content": "Error message"
}
```

## Architecture

### Components

1. **main.py** - FastAPI app setup and WebSocket endpoint
2. **websocket_handler.py** - WebSocket connection and message handling
3. **elastic_client.py** - Elastic Agent Builder and search integration
4. **gemini_client.py** - Google Gemini LIVE API for audio generation
5. **message_router.py** - Intent detection and query routing
6. **config.py** - Configuration and environment management

### Message Flow

1. Frontend sends text via WebSocket
2. Message router analyzes intent (text conversation vs image search)
3. For text queries:
   - Send to Elastic Agent Builder
   - Stream response to frontend
   - Generate audio with Gemini
   - Stream audio chunks to frontend
4. For image queries:
   - Search Elasticsearch wildlife index
   - Return formatted results to frontend

## Troubleshooting

### Connection Errors

- Verify Elastic Cloud URL is accessible
- Check API key has correct permissions ("read_onechat")
- Ensure agent ID matches your Elastic configuration

### Audio Not Working

- Verify Google API key is valid
- Check Gemini model name is correct
- Ensure you have Gemini API quota available

### No Image Results

- Confirm wildlife-images index exists
- Verify index has documents
- Check search query matches indexed content

## Development

### Running Tests

```bash
pytest
```

### Code Formatting

```bash
black app/
```

### Type Checking

```bash
mypy app/
```

## License

Proprietary - TerraTale Project
