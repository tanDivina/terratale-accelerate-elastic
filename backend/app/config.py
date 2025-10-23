from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    elastic_cloud_url: str
    elastic_api_key: str
    elastic_agent_id: str = "terratale-qa-agent"

    google_api_key: str
    gemini_model: str = "gemini-2.5-flash-native-audio-preview-09-2025"

    host: str = "0.0.0.0"
    port: int = 8000

    wildlife_image_index: str = "wildlife-images"

    supabase_url: Optional[str] = None
    supabase_anon_key: Optional[str] = None
    supabase_service_role_key: Optional[str] = None

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
