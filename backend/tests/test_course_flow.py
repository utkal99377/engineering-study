import pytest
import os
import sys
from fastapi.testclient import TestClient

# Put backend dir in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.core.database import SessionLocal, Base, engine
from app.models.user import User
from app.models.course import Subject, Course, Module, Lecture
from app.core.security import get_password_hash, create_access_token

client = TestClient(app)

@pytest.fixture(scope="module")
def admin_token():
    db = SessionLocal()
    # Create or retrieve admin user
    admin_user = db.query(User).filter(User.email == "test_admin@utkal.edu").first()
    if not admin_user:
        admin_user = User(
            id="usr_admin_test_123",
            name="Test Administrator",
            email="test_admin@utkal.edu",
            hashed_password=get_password_hash("AdminPass123!"),
            role="admin",
            status="active"
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
    
    token = create_access_token({"sub": admin_user.email, "email": admin_user.email, "role": "admin", "id": admin_user.id})
    db.close()
    return token

@pytest.fixture(scope="module")
def student_token():
    db = SessionLocal()
    student_user = db.query(User).filter(User.email == "test_student@utkal.edu").first()
    if not student_user:
        student_user = User(
            id="usr_student_test_456",
            name="Test Student",
            email="test_student@utkal.edu",
            hashed_password=get_password_hash("StudentPass123!"),
            role="student",
            status="active"
        )
        db.add(student_user)
        db.commit()
        db.refresh(student_user)
    
    token = create_access_token({"sub": student_user.email, "email": student_user.email, "role": "student", "id": student_user.id})
    db.close()
    return token

def test_full_course_creation_and_student_flow(admin_token, student_token):
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    student_headers = {"Authorization": f"Bearer {student_token}"}

    # 1. Admin creates a Subject
    sub_res = client.post("/api/v1/admin/subjects", headers=admin_headers, json={
        "name": "Cloud & Distributed Computing",
        "icon": "cloud",
        "description": "AWS, GCP, Microservices, and Kubernetes for engineers"
    })
    assert sub_res.status_code == 200
    subject_id = sub_res.json()["id"]
    assert "slug" in sub_res.json()

    # 2. Admin creates a Course under this Subject
    course_res = client.post("/api/v1/admin/courses", headers=admin_headers, json={
        "subject_id": subject_id,
        "title": "Mastering Microservices with Docker",
        "short_description": "Learn containerization, docker-compose, and scalable microservices.",
        "description": "Comprehensive engineering curriculum on containers, networking, and microservices architecture.",
        "access_type": "free",
        "level": "Intermediate",
        "duration_hours": 15,
        "tags": ["Docker", "Containers", "DevOps", "Microservices"]
    })
    assert course_res.status_code == 200
    course_data = course_res.json()
    course_id = course_data["id"]
    assert course_data["title"] == "Mastering Microservices with Docker"
    assert course_data["slug"] == "mastering-microservices-with-docker"

    # 3. Admin adds Module 1 to Course
    mod1_res = client.post("/api/v1/admin/modules", headers=admin_headers, json={
        "course_id": course_id,
        "title": "Module 1: Docker Fundamentals",
        "description": "Images, Containers, and Dockerfile commands."
    })
    assert mod1_res.status_code == 200
    mod1_id = mod1_res.json()["id"]

    # 4. Admin adds Lecture 1 to Module 1
    lec1_res = client.post("/api/v1/admin/lectures", headers=admin_headers, json={
        "module_id": mod1_id,
        "title": "1.1 Introduction to Containers vs VMs",
        "duration_min": 15,
        "video_url": "https://www.youtube.com/watch?v=Gjnup-PuquQ",
        "notes_markdown": "# Docker Architecture\nDocker packages applications with dependencies.",
        "status": "active"
    })
    assert lec1_res.status_code == 200
    lec1_id = lec1_res.json()["id"]

    # 5. Admin adds Lecture 2 to Module 1 (with prerequisite = Lecture 1)
    lec2_res = client.post("/api/v1/admin/lectures", headers=admin_headers, json={
        "module_id": mod1_id,
        "title": "1.2 Writing your first Dockerfile",
        "duration_min": 25,
        "prerequisite_id": lec1_id,
        "video_url": "https://www.youtube.com/watch?v=fqMOX6JJhGo",
        "notes_markdown": "# Dockerfile Instructions\nFROM, WORKDIR, COPY, RUN, CMD",
        "status": "active"
    })
    assert lec2_res.status_code == 200
    lec2_id = lec2_res.json()["id"]

    # 6. Admin inspects Course Curriculum API
    curr_res = client.get(f"/api/v1/admin/courses/{course_id}/curriculum", headers=admin_headers)
    assert curr_res.status_code == 200
    curr_data = curr_res.json()
    assert len(curr_data["modules"]) == 1
    assert len(curr_data["modules"][0]["lectures"]) == 2

    # 7. Student fetches public Course List
    courses_list_res = client.get("/api/v1/courses", headers=student_headers)
    assert courses_list_res.status_code == 200
    all_courses = courses_list_res.json()
    found_course = next((c for c in all_courses if c["id"] == course_id), None)
    assert found_course is not None
    assert found_course["title"] == "Mastering Microservices with Docker"
    assert found_course["subject_name"] == "Cloud & Distributed Computing"
    assert found_course["lectures_count"] == 2
    assert found_course["modules_count"] == 1

    # 8. Student fetches Course Detail
    detail_res = client.get(f"/api/v1/courses/{course_id}", headers=student_headers)
    assert detail_res.status_code == 200
    detail_data = detail_res.json()
    assert detail_data["lectures_count"] == 2
    
    # Check sequential progression states
    mod_lectures = detail_data["modules"][0]["lectures"]
    lec1_state = next(l for l in mod_lectures if l["id"] == lec1_id)
    lec2_state = next(l for l in mod_lectures if l["id"] == lec2_id)
    
    assert lec1_state["is_unlocked"] is True
    assert lec1_state["access_state"] in ["available", "in_progress"]
    assert lec2_state["is_unlocked"] is False
    assert lec2_state["access_state"] == "locked"

    # 9. Student accesses Lecture 1
    lec1_detail = client.get(f"/api/v1/lectures/{lec1_id}", headers=student_headers)
    assert lec1_detail.status_code == 200
    assert lec1_detail.json()["video_url"] == "https://www.youtube.com/watch?v=Gjnup-PuquQ"

    # 10. Student tries to access Lecture 2 directly before completing Lecture 1 -> Expected 403 Forbidden
    lec2_forbidden = client.get(f"/api/v1/lectures/{lec2_id}", headers=student_headers)
    assert lec2_forbidden.status_code == 403

    # 11. Student completes Lecture 1
    complete_res = client.post(f"/api/v1/lectures/{lec1_id}/complete", headers=student_headers)
    assert complete_res.status_code == 200

    # 12. Student can now access Lecture 2!
    lec2_unlocked = client.get(f"/api/v1/lectures/{lec2_id}", headers=student_headers)
    assert lec2_unlocked.status_code == 200
    assert lec2_unlocked.json()["title"] == "1.2 Writing your first Dockerfile"

    # 13. Clean up: Admin deletes the course
    del_res = client.delete(f"/api/v1/admin/courses/{course_id}", headers=admin_headers)
    assert del_res.status_code == 200

    # Verify course is no longer in student course list
    courses_after_del = client.get("/api/v1/courses").json()
    assert not any(c["id"] == course_id for c in courses_after_del)
