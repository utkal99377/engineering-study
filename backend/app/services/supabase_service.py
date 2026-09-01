import os
from pathlib import Path
from typing import Optional, BinaryIO
from app.core.config import settings

class SupabaseService:
    """Service to interface with Supabase Client, Database & Storage Buckets."""
    
    _client = None

    @classmethod
    def get_client(cls):
        """Initializes and returns the Supabase client singleton if configured."""
        if cls._client is not None:
            return cls._client

        if not settings.SUPABASE_URL or not (settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY):
            return None

        try:
            from supabase import create_client, Client
            key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
            cls._client = create_client(settings.SUPABASE_URL, key)
            return cls._client
        except Exception as e:
            print(f"[SUPABASE] Error initializing Supabase client: {e}")
            return None

    @classmethod
    def is_available(cls) -> bool:
        """Checks if the Supabase client is initialized and accessible."""
        return cls.get_client() is not None

    @classmethod
    def upload_file(
        cls, 
        file_bytes: bytes, 
        destination_path: str, 
        content_type: str = "application/octet-stream",
        bucket_name: Optional[str] = None
    ) -> Optional[str]:
        """
        Uploads binary file data to a Supabase Storage bucket.
        Returns the public or storage URL, or None if Supabase is not configured.
        """
        client = cls.get_client()
        bucket = bucket_name or settings.SUPABASE_STORAGE_BUCKET

        if client is None:
            # Fallback to local file storage
            local_dest = settings.STORAGE_PATH / destination_path
            os.makedirs(local_dest.parent, exist_ok=True)
            with open(local_dest, "wb") as f:
                f.write(file_bytes)
            return f"/storage/{destination_path}"

        try:
            # Upload to Supabase Storage
            # Attempt to create bucket if it doesn't exist
            try:
                client.storage.get_bucket(bucket)
            except Exception:
                try:
                    client.storage.create_bucket(bucket, options={"public": True})
                except Exception:
                    pass

            # Upload or upsert file
            client.storage.from_(bucket).upload(
                path=destination_path,
                file=file_bytes,
                file_options={"content-type": content_type, "upsert": "true"}
            )

            # Get public URL
            public_url = client.storage.from_(bucket).get_public_url(destination_path)
            return public_url
        except Exception as e:
            print(f"[SUPABASE_STORAGE] Upload error: {e}. Falling back to local storage.")
            local_dest = settings.STORAGE_PATH / destination_path
            os.makedirs(local_dest.parent, exist_ok=True)
            with open(local_dest, "wb") as f:
                f.write(file_bytes)
            return f"/storage/{destination_path}"

    @classmethod
    def get_file_url(cls, path: str, bucket_name: Optional[str] = None) -> str:
        """Returns the URL for a stored asset."""
        if path.startswith("http://") or path.startswith("https://"):
            return path
        
        client = cls.get_client()
        bucket = bucket_name or settings.STORAGE_BUCKET if hasattr(settings, "STORAGE_BUCKET") else "btech-assets"
        
        if client:
            try:
                return client.storage.from_(bucket).get_public_url(path)
            except Exception:
                pass
                
        return f"/storage/{path.lstrip('/')}"
