import httpx
import json
import asyncio
from typing import AsyncGenerator, Optional, Dict, Any
from app.config import settings


class ElasticAgentClient:
    def __init__(self):
        self.base_url = settings.elastic_cloud_url.rstrip('/')
        self.api_key = settings.elastic_api_key
        self.agent_id = settings.elastic_agent_id
        self.headers = {
            "Authorization": f"ApiKey {self.api_key}",
            "kbn-xsrf": "true",
            "Content-Type": "application/json"
        }

    async def converse_async(
        self,
        input_text: str,
        conversation_id: Optional[str] = None
    ) -> AsyncGenerator[Dict[str, Any], None]:
        url = f"{self.base_url}/api/agent_builder/converse/async"

        payload = {
            "input": input_text,
            "agent_id": self.agent_id
        }

        if conversation_id:
            payload["conversation_id"] = conversation_id

        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream(
                "POST",
                url,
                headers=self.headers,
                json=payload
            ) as response:
                response.raise_for_status()

                async for line in response.aiter_lines():
                    if line.strip():
                        if line.startswith("data: "):
                            data_str = line[6:]
                            try:
                                data = json.loads(data_str)
                                yield data
                            except json.JSONDecodeError:
                                continue

    async def search_images(
        self,
        query: str,
        size: int = 6
    ) -> list[Dict[str, Any]]:
        url = f"{self.base_url}/{settings.wildlife_image_index}/_search"

        search_body = {
            "query": {
                "multi_match": {
                    "query": query,
                    "fields": ["photo_description", "species_name", "common_name"],
                    "fuzziness": "AUTO"
                }
            },
            "size": size
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                url,
                headers=self.headers,
                json=search_body
            )
            response.raise_for_status()
            result = response.json()

            hits = result.get("hits", {}).get("hits", [])
            formatted_results = []

            for hit in hits:
                formatted_results.append({
                    "_id": hit["_id"],
                    "_score": hit["_score"],
                    "fields": {
                        "photo_image_url": [hit["_source"].get("photo_image_url", "")],
                        "photo_description": [hit["_source"].get("photo_description", "")]
                    }
                })

            return formatted_results


elastic_client = ElasticAgentClient()
