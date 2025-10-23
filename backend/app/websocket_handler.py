import json
import asyncio
from typing import Dict, Optional
from fastapi import WebSocket
from app.elastic_client import elastic_client
from app.gemini_client import gemini_client
from app.message_router import message_router


class WebSocketHandler:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.conversation_ids: Dict[str, Optional[str]] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket
        self.conversation_ids[client_id] = None

    def disconnect(self, client_id: str):
        self.active_connections.pop(client_id, None)
        self.conversation_ids.pop(client_id, None)

    async def handle_message(self, client_id: str, message: str):
        websocket = self.active_connections.get(client_id)
        if not websocket:
            return

        try:
            intent = message_router.analyze_intent(message)

            if intent["search_images"] and intent["search_query"]:
                await self._handle_image_search(websocket, intent["search_query"])
            else:
                await self._handle_text_conversation(
                    websocket,
                    client_id,
                    message
                )

        except Exception as e:
            await self._send_error(websocket, str(e))

    async def _handle_text_conversation(
        self,
        websocket: WebSocket,
        client_id: str,
        message: str
    ):
        response_text = ""
        conversation_id = self.conversation_ids.get(client_id)

        try:
            async for event in elastic_client.converse_async(message, conversation_id):
                if event.get("type") == "conversationId":
                    self.conversation_ids[client_id] = event.get("conversationId")

                elif event.get("type") == "content":
                    content = event.get("content", "")
                    response_text += content

        except Exception as e:
            response_text = f"I apologize, but I encountered an error: {str(e)}"

        if response_text:
            await websocket.send_json({
                "type": "text",
                "content": response_text
            })

            try:
                async for audio_chunk in gemini_client.text_to_speech(response_text):
                    await websocket.send_bytes(audio_chunk)

                await websocket.send_json({"type": "audio_end"})

            except Exception as e:
                print(f"Audio generation error: {e}")

    async def _handle_image_search(self, websocket: WebSocket, query: str):
        try:
            results = await elastic_client.search_images(query)

            if results:
                await websocket.send_json({
                    "type": "image_search_results",
                    "content": results
                })
            else:
                await websocket.send_json({
                    "type": "text",
                    "content": f"I couldn't find any images matching '{query}'. Try asking about specific wildlife species found in the San San Pond Sak Wetlands."
                })

        except Exception as e:
            await self._send_error(websocket, f"Image search failed: {str(e)}")

    async def _send_error(self, websocket: WebSocket, error_message: str):
        await websocket.send_json({
            "type": "error",
            "content": error_message
        })


ws_handler = WebSocketHandler()
