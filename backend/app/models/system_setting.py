from sqlalchemy import Column, String, Text, DateTime
from datetime import datetime
import json
from app.core.database import Base

class SystemSetting(Base):
    __tablename__ = "system_settings"

    key = Column(String(64), primary_key=True, index=True)
    value = Column(Text, nullable=False)  # JSON serialized value or string
    category = Column(String(32), default="general")  # branding, hero, announcements, features
    description = Column(String(255), nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def get_parsed_value(self):
        try:
            return json.loads(self.value)
        except Exception:
            return self.value

    def set_value(self, val):
        if isinstance(val, (dict, list, bool, int, float)):
            self.value = json.dumps(val)
        else:
            self.value = str(val)
