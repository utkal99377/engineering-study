import uvicorn
import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("=================================================================")
    print("  B.Tech Learning, Assessment & Programming Practice Platform")
    print("  Starting FastAPI Server on http://localhost:8001")
    print("  Swagger UI Documentation: http://localhost:8001/docs")
    print("=================================================================")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8001, reload=True)
