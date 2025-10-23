# TerraTale Backend Setup Guide

Complete step-by-step guide to set up and run the TerraTale backend.

## Step 1: Prerequisites Check

Ensure you have:
- [ ] Python 3.11 or higher installed
- [ ] Elastic Cloud project URL: `https://my-elasticsearch-project-ffe892.es.us-central1.gcp.elastic.cloud:443`
- [ ] Elastic API key with permissions
- [ ] Google Cloud API key with Gemini API access
- [ ] Elastic Agent Builder agent created (ID: `terratale-qa-agent`)

## Step 2: Install Python Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Step 3: Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` with your credentials:
```env
ELASTIC_CLOUD_URL=https://my-elasticsearch-project-ffe892.es.us-central1.gcp.elastic.cloud:443
ELASTIC_API_KEY=your_actual_api_key_here
ELASTIC_AGENT_ID=terratale-qa-agent

GOOGLE_API_KEY=your_google_api_key_here
GEMINI_MODEL=gemini-2.5-flash-native-audio-preview-09-2025

HOST=0.0.0.0
PORT=8000

WILDLIFE_IMAGE_INDEX=wildlife-images
```

## Step 4: Get Your Elastic API Key

1. Log in to Elastic Cloud: https://cloud.elastic.co/
2. Navigate to your project
3. Go to **Management** → **API Keys**
4. Create a new API key or use existing one
5. Copy the API key value
6. Ensure it has the following privileges:
   - `read_onechat` (for Agent Builder)
   - Index permissions for `wildlife-images`

## Step 5: Get Your Google API Key

1. Go to Google AI Studio: https://ai.google.dev/
2. Create a new API key or use existing one
3. Ensure you have access to Gemini 2.5 Flash models
4. Copy the API key value

## Step 6: Verify Elastic Agent Builder

1. Log in to Elastic Cloud
2. Navigate to **AI Agents** or **Agent Builder**
3. Verify you have an agent named `terratale-qa-agent`
4. If not, create a new agent:
   - Name: terratale-qa-agent
   - Description: AI guide for San San Pond Sak Wetlands
   - Knowledge base: Add information about the wetlands, wildlife, and ecosystem

## Step 7: Create Wildlife Image Index

Run the population script to create the index and add sample data:

```bash
python scripts/populate_wildlife_images.py
```

You should see output like:
```
✓ Index 'wildlife-images' created successfully
✓ Indexed: Great Blue Heron
✓ Indexed: Spectacled Owl
...
✓ Finished indexing 12 documents
```

## Step 8: Verify Index Creation

You can verify the index was created using curl:

```bash
curl -X GET "https://your-elasticsearch-url/wildlife-images/_search?size=1" \
  -H "Authorization: ApiKey YOUR_API_KEY"
```

## Step 9: Start the Backend Server

### Development mode (with auto-reload):
```bash
python -m app.main
```

Or using uvicorn:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Production mode:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## Step 10: Test the Backend

### Test HTTP endpoints:

1. Root endpoint:
```bash
curl http://localhost:8000/
```

Expected response:
```json
{
  "service": "TerraTale Backend",
  "status": "running",
  "version": "1.0.0"
}
```

2. Health check:
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy"
}
```

### Test WebSocket connection:

You can test the WebSocket using a simple Python script:

```python
import asyncio
import websockets
import json

async def test_websocket():
    uri = "ws://localhost:8000/ws"
    async with websockets.connect(uri) as websocket:
        # Send a message
        await websocket.send("Tell me about herons")

        # Receive responses
        while True:
            message = await websocket.recv()
            if isinstance(message, bytes):
                print(f"Received audio chunk: {len(message)} bytes")
            else:
                data = json.loads(message)
                print(f"Received: {data}")
                if data.get("type") == "audio_end":
                    break

asyncio.run(test_websocket())
```

## Step 11: Connect Frontend

Update your frontend's `.env` file:

```env
VITE_BACKEND_WS_URL=ws://localhost:8000/ws
```

Then start your frontend and test the full integration!

## Troubleshooting

### Issue: "Connection refused" error

**Solution:**
- Ensure the backend is running
- Check that port 8000 is not blocked by firewall
- Verify HOST and PORT in `.env`

### Issue: Elastic API returns 401 Unauthorized

**Solution:**
- Verify your API key is correct
- Check API key has required permissions
- Ensure API key hasn't expired

### Issue: No audio generated

**Solution:**
- Verify Google API key is valid
- Check you have Gemini API quota
- Ensure the model name is correct

### Issue: Image search returns no results

**Solution:**
- Run `python scripts/populate_wildlife_images.py` to index sample data
- Verify index exists: `curl -X GET "https://your-url/wildlife-images/_count"`
- Check search queries match indexed content

### Issue: "Module not found" errors

**Solution:**
```bash
pip install -r requirements.txt --upgrade
```

### Issue: Gemini API errors

**Solution:**
- Check your Google API key has Gemini access enabled
- Verify you're not exceeding rate limits
- Try a different model if current one is unavailable

## Next Steps

1. Customize the Agent Builder knowledge base with specific wetlands information
2. Add more wildlife images to the index
3. Adjust system instructions in `gemini_client.py` for desired tone
4. Configure logging for production monitoring
5. Set up SSL/TLS certificates for production deployment

## Support

For issues or questions:
- Check the main README.md
- Review API documentation
- Check Elastic Cloud documentation: https://www.elastic.co/docs
- Check Gemini API documentation: https://ai.google.dev/docs
