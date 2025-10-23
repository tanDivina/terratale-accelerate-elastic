import uuid
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.websocket_handler import ws_handler
from app.config import settings

app = FastAPI(title="TerraTale Backend API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "service": "TerraTale Backend",
        "status": "running",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    client_id = str(uuid.uuid4())
    await ws_handler.connect(websocket, client_id)

    try:
        while True:
            message = await websocket.receive_text()
            await ws_handler.handle_message(client_id, message)

    except WebSocketDisconnect:
        ws_handler.disconnect(client_id)
    except Exception as e:
        print(f"WebSocket error: {e}")
        ws_handler.disconnect(client_id)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=True
    )
