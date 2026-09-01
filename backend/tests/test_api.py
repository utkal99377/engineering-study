import pytest
import os
import sys
from fastapi.testclient import TestClient

# Put backend dir in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.core.database import SessionLocal, engine, Base
from app.services.seeder_service import SeederService
from app.core.config import settings

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        SeederService.seed_all(db, settings.DATASETS_PATH)
    finally:
        db.close()

client = TestClient(app)

def test_health_and_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "version" in response.json()

    health = client.get("/api/v1/health")
    assert health.status_code == 200
    assert health.json()["status"] == "healthy"

def test_auth_flow():
    # Login with default admin
    login_res = client.post("/api/v1/auth/login", json={
        "email": "admin@btechlearn.edu",
        "password": "Admin@2026"
    })
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data
    assert token_data["user"]["role"] == "admin"

    # Login with default student
    stud_res = client.post("/api/v1/auth/login", json={
        "email": "student@btechlearn.edu",
        "password": "Student@2026"
    })
    assert stud_res.status_code == 200
    assert stud_res.json()["user"]["role"] == "student"

def test_subjects_and_courses():
    res = client.get("/api/v1/subjects")
    assert res.status_code == 200
    subjects = res.json()
    assert len(subjects) > 0

    courses_res = client.get("/api/v1/courses")
    assert courses_res.status_code == 200
    courses = courses_res.json()
    assert len(courses) > 0

def test_theory_questions_and_mcq():
    # Login student
    login_res = client.post("/api/v1/auth/login", json={
        "email": "student@btechlearn.edu",
        "password": "Student@2026"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch questions
    q_res = client.get("/api/v1/questions")
    assert q_res.status_code == 200
    questions = q_res.json()
    assert len(questions) > 0

    # Attempt an MCQ (Python bytecode question)
    mcq = next((q for q in questions if q["id"] == "q_py_01"), questions[0])
    attempt_res = client.post(
        f"/api/v1/questions/{mcq['id']}/attempt",
        json={"submitted_answer": ".pyc"},
        headers=headers
    )
    assert attempt_res.status_code == 200
    res_data = attempt_res.json()
    assert res_data["is_correct"] is True
    assert res_data["score_obtained"] > 0

def test_code_sandbox_execution():
    # Login student
    login_res = client.post("/api/v1/auth/login", json={
        "email": "student@btechlearn.edu",
        "password": "Student@2026"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Test Python execution on Two Sum problem
    python_code = """import sys

def solve():
    lines = sys.stdin.read().strip().split('\\n')
    if not lines or not lines[0]:
        return
    nums = list(map(int, lines[0].split()))
    target = int(lines[1].strip())
    
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            print(f"{seen[diff]} {i}")
            return
        seen[num] = i

if __name__ == '__main__':
    solve()
"""
    run_res = client.post(
        "/api/v1/submissions",
        json={
            "problem_id": "prob_two_sum",
            "language": "python",
            "code": python_code,
            "is_submission": True
        },
        headers=headers
    )
    assert run_res.status_code == 200
    result = run_res.json()
    assert result["status"] == "Accepted"
    assert result["passed_count"] == result["total_count"]
    assert result["score"] == 100

def test_subscriptions_and_coupons():
    plans_res = client.get("/api/v1/subscription/plans")
    assert plans_res.status_code == 200
    plans = plans_res.json()
    assert len(plans) > 0

    pro_plan = next((p for p in plans if p["slug"] == "pro-monthly"), plans[0])

    # Validate coupon
    coup_res = client.post("/api/v1/subscription/validate-coupon", json={
        "code": "BTECH50",
        "plan_id": pro_plan["id"]
    })
    assert coup_res.status_code == 200
    coup_data = coup_res.json()
    assert coup_data["is_valid"] is True
    assert coup_data["final_price"] < coup_data["original_price"]
