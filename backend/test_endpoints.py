import urllib.request
import json

def test_ep(name, url, method='GET', data=None):
    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(data).encode() if data else None,
            headers={'Content-Type': 'application/json'} if data else {},
            method=method
        )
        with urllib.request.urlopen(req) as resp:
            res = json.loads(resp.read().decode())
            print(f"[PASS] {name}: HTTP {resp.status} - Data: {len(res) if isinstance(res, list) else list(res.keys())}")
    except Exception as e:
        print(f"[FAIL] {name}: {e}")

if __name__ == "__main__":
    print("Testing Backend API & Database:")
    test_ep("Health", "http://127.0.0.1:8001/api/v1/health")
    test_ep("Subjects", "http://127.0.0.1:8001/api/v1/subjects")
    test_ep("Courses", "http://127.0.0.1:8001/api/v1/courses")
    test_ep("Coding Problems", "http://127.0.0.1:8001/api/v1/problems")
    test_ep("Theory Questions", "http://127.0.0.1:8001/api/v1/questions")
    test_ep("Subscription Plans", "http://127.0.0.1:8001/api/v1/subscription/plans")
    test_ep("Student Login", "http://127.0.0.1:8001/api/v1/auth/login", "POST", {"email": "student@btechlearn.edu", "password": "Student@2026"})
    test_ep("Admin Login", "http://127.0.0.1:8001/api/v1/auth/login", "POST", {"email": "admin@btechlearn.edu", "password": "Admin@2026"})
