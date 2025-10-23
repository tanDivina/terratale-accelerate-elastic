import asyncio
import io
from typing import AsyncGenerator
from google import genai
from google.genai import types
import soundfile as sf
import numpy as np
from app.config import settings


class GeminiAudioClient:
    def __init__(self):
        self.client = genai.Client(api_key=settings.google_api_key)
        self.model = settings.gemini_model

    async def text_to_speech(self, text: str) -> AsyncGenerator[bytes, None]:
        config = {
            "response_modalities": ["AUDIO"],
            "system_instruction": "You are a helpful assistant for the San San Pond Sak Wetlands. Speak in a warm, educational tone suitable for nature enthusiasts."
        }

        try:
            async with self.client.aio.live.connect(model=self.model, config=config) as session:
                await session.send(text, end_of_turn=True)

                async for response in session.receive():
                    if response.data:
                        if hasattr(response, 'server_content'):
                            server_content = response.server_content
                            if server_content and hasattr(server_content, 'model_turn'):
                                model_turn = server_content.model_turn
                                if model_turn and hasattr(model_turn, 'parts'):
                                    for part in model_turn.parts:
                                        if hasattr(part, 'inline_data') and part.inline_data:
                                            audio_data = part.inline_data.data
                                            if audio_data:
                                                yield audio_data

        except Exception as e:
            print(f"Gemini API error: {e}")
            yield await self._generate_fallback_audio(text)

    async def _generate_fallback_audio(self, text: str) -> bytes:
        duration = 2.0
        sample_rate = 24000
        t = np.linspace(0, duration, int(sample_rate * duration))
        frequency = 440.0
        audio = np.sin(2 * np.pi * frequency * t) * 0.1
        audio = (audio * 32767).astype(np.int16)

        buffer = io.BytesIO()
        sf.write(buffer, audio, sample_rate, format='WAV')
        buffer.seek(0)

        wav_data = buffer.read()
        return wav_data[44:]


gemini_client = GeminiAudioClient()
