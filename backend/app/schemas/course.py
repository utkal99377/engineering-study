from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from datetime import datetime

class SubjectBase(BaseModel):
    name: str
    slug: str
    icon: Optional[str] = "code"
    description: Optional[str] = None
    order_no: Optional[int] = 1
    status: Optional[str] = "active"

class SubjectOut(SubjectBase):
    id: str
    created_at: datetime
    courses_count: Optional[int] = 0

    class Config:
        from_attributes = True

class ResourceOut(BaseModel):
    id: str
    lecture_id: str
    title: str
    type: str
    url: str
    access_level: str

    class Config:
        from_attributes = True

class LectureBase(BaseModel):
    title: str
    order_no: int
    prerequisite_id: Optional[str] = None
    duration_min: Optional[int] = 20
    video_url: Optional[str] = None
    notes_markdown: Optional[str] = None
    status: Optional[str] = "active"

class LectureOut(LectureBase):
    id: str
    module_id: str
    resources: List[ResourceOut] = []
    # Server-evaluated dynamic access state
    access_state: Optional[str] = "locked"  # locked, available, in_progress, completed, premium_locked
    is_unlocked: Optional[bool] = False
    watermark: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class ModuleBase(BaseModel):
    title: str
    description: Optional[str] = None
    order_no: int

class ModuleOut(ModuleBase):
    id: str
    course_id: str
    lectures: List[LectureOut] = []

    class Config:
        from_attributes = True

class CourseBase(BaseModel):
    subject_id: str
    title: str
    slug: str
    short_description: Optional[str] = None
    description: Optional[str] = None
    thumbnail: Optional[str] = None
    access_type: Optional[str] = "free"
    level: Optional[str] = "Beginner"
    duration_hours: Optional[int] = 10
    tags: Optional[List[str]] = []
    status: Optional[str] = "published"

class CourseOut(CourseBase):
    id: str
    created_at: datetime
    modules_count: Optional[int] = 0
    lectures_count: Optional[int] = 0
    subject_name: Optional[str] = None
    user_progress_percentage: Optional[int] = 0

    class Config:
        from_attributes = True

class CourseDetailOut(CourseOut):
    modules: List[ModuleOut] = []
    has_premium_access: Optional[bool] = False
