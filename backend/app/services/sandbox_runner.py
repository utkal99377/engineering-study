import os
import sys
import time
import uuid
import shutil
import tempfile
import subprocess
import httpx
from pathlib import Path
from typing import Dict, Any, List, Optional

from app.core.config import settings

# Mapping of all standard languages to Judge0 CE language IDs
JUDGE0_LANGUAGE_MAP = {
    "c": 50,           # C (GCC 9.2.0)
    "cpp": 54,         # C++ (GCC 9.2.0)
    "c++": 54,
    "java": 62,        # Java (OpenJDK 13.0.1)
    "python": 71,      # Python 3 (3.8.1)
    "python3": 71,
    "py": 71,
    "javascript": 63,  # JavaScript (Node.js 12.14.0)
    "js": 63,
    "node": 63,
    "typescript": 74,  # TypeScript (3.7.4)
    "ts": 74,
    "go": 60,          # Go (1.13.5)
    "golang": 60,
    "rust": 73,        # Rust (1.40.0)
    "rs": 73,
    "csharp": 51,      # C# (Mono 6.6.0.161)
    "cs": 51,
    "c#": 51,
    "dotnet": 51,
    "php": 68,         # PHP (7.4.1)
    "ruby": 72,        # Ruby (2.7.0)
    "rb": 72,
    "kotlin": 78,      # Kotlin (1.3.70)
    "kt": 78,
    "swift": 83,       # Swift (5.2.3)
    "sql": 82,         # SQL (SQLite 3.27.2)
    "sqlite": 82,
    "bash": 46,        # Bash (5.0.0)
    "sh": 46,
    "r": 80,           # R (4.0.0)
}

class SandboxRunner:
    @staticmethod
    def _execute_judge0(language_id: int, code: str, input_data: str, timeout_sec: float) -> Optional[Dict[str, Any]]:
        """Attempt cloud execution via high-speed Judge0 CE compiler engine."""
        try:
            payload = {
                "source_code": code,
                "language_id": language_id,
                "stdin": input_data,
                "cpu_time_limit": min(float(timeout_sec), 5.0)
            }
            res = httpx.post(
                "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
                json=payload,
                timeout=12.0
            )
            if res.status_code in [200, 201]:
                data = res.json()
                status_obj = data.get("status", {})
                status_id = status_obj.get("id", 0)
                
                stdout = (data.get("stdout") or "").rstrip()
                compile_output = (data.get("compile_output") or "").rstrip()
                stderr = (data.get("stderr") or data.get("message") or "").rstrip()
                
                err = compile_output if compile_output else stderr
                is_timeout = status_id == 5  # Time Limit Exceeded
                is_comp_error = status_id == 6  # Compilation Error
                is_success = status_id == 3   # Accepted
                
                runtime_raw = float(data.get("time") or 0.0) * 1000.0
                
                return {
                    "stdout": stdout,
                    "stderr": err,
                    "returncode": 0 if is_success else 1,
                    "runtime_ms": round(runtime_raw, 2),
                    "timeout": is_timeout,
                    "compilation_error": is_comp_error,
                    "memory_kb": data.get("memory", 0),
                    "engine": "judge0_cloud"
                }
        except Exception as e:
            print(f"[JUDGE0 NOTICE] Cloud runner fallback to local: {e}")
        return None

    @staticmethod
    def _execute_subprocess(cmd: List[str], input_data: str, timeout_sec: float) -> Dict[str, Any]:
        """Execute a command in an isolated local subprocess with strict timeout."""
        start_time = time.perf_counter()
        try:
            process = subprocess.run(
                cmd,
                input=input_data,
                text=True,
                capture_output=True,
                timeout=timeout_sec
            )
            elapsed_ms = (time.perf_counter() - start_time) * 1000.0
            return {
                "stdout": process.stdout.strip(),
                "stderr": process.stderr.strip(),
                "returncode": process.returncode,
                "runtime_ms": round(elapsed_ms, 2),
                "timeout": False,
                "engine": "local_subprocess"
            }
        except subprocess.TimeoutExpired:
            return {
                "stdout": "",
                "stderr": f"Time Limit Exceeded ({timeout_sec}s)",
                "returncode": -1,
                "runtime_ms": timeout_sec * 1000.0,
                "timeout": True,
                "engine": "local_subprocess"
            }
        except Exception as e:
            return {
                "stdout": "",
                "stderr": f"Execution Error: {str(e)}",
                "returncode": -1,
                "runtime_ms": 0.0,
                "timeout": False,
                "engine": "local_subprocess"
            }

    @classmethod
    def run_code_single(
        cls,
        language: str,
        code: str,
        input_data: str = "",
        timeout_sec: float = 3.5
    ) -> Dict[str, Any]:
        """Run code in any programming language (C, C++, Java, Python, JS, Go, Rust, C#, PHP, Swift, etc.)."""
        lang = language.lower().strip()
        
        # 1. Try Universal Cloud Compiler (Judge0 CE) supporting 20+ languages
        if lang in JUDGE0_LANGUAGE_MAP:
            cloud_res = cls._execute_judge0(JUDGE0_LANGUAGE_MAP[lang], code, input_data, timeout_sec)
            if cloud_res is not None:
                return cloud_res

        # 2. Local Fallback Subprocess execution
        temp_dir = tempfile.mkdtemp(prefix="btech_sandbox_")
        try:
            if lang in ["python", "py", "python3"]:
                script_path = os.path.join(temp_dir, "solution.py")
                with open(script_path, "w", encoding="utf-8") as f:
                    f.write(code)
                cmd = [sys.executable, script_path]
                return cls._execute_subprocess(cmd, input_data, timeout_sec)

            elif lang in ["javascript", "js", "node"]:
                script_path = os.path.join(temp_dir, "solution.js")
                with open(script_path, "w", encoding="utf-8") as f:
                    f.write(code)
                if shutil.which("node"):
                    return cls._execute_subprocess(["node", script_path], input_data, timeout_sec)
                else:
                    return {
                        "stdout": "",
                        "stderr": "Node.js runtime not found locally.",
                        "returncode": 1,
                        "runtime_ms": 0.0,
                        "timeout": False
                    }

            elif lang in ["c", "c++", "cpp"]:
                ext = ".c" if lang == "c" else ".cpp"
                compiler = "gcc" if lang == "c" else "g++"
                src_path = os.path.join(temp_dir, f"solution{ext}")
                bin_path = os.path.join(temp_dir, "solution.exe" if os.name == "nt" else "solution")
                
                with open(src_path, "w", encoding="utf-8") as f:
                    f.write(code)

                if shutil.which(compiler):
                    compile_cmd = [compiler, src_path, "-o", bin_path, "-O2"]
                    c_res = subprocess.run(compile_cmd, capture_output=True, text=True, timeout=5.0)
                    if c_res.returncode != 0:
                        return {
                            "stdout": "",
                            "stderr": f"Compilation Error:\n{c_res.stderr}",
                            "returncode": c_res.returncode,
                            "runtime_ms": 0.0,
                            "timeout": False,
                            "compilation_error": True
                        }
                    return cls._execute_subprocess([bin_path], input_data, timeout_sec)
                else:
                    return {
                        "stdout": "",
                        "stderr": f"Compiler '{compiler}' not detected on host system.",
                        "returncode": 1,
                        "runtime_ms": 0.0,
                        "timeout": False
                    }

            else:
                return {
                    "stdout": "",
                    "stderr": f"Unsupported language '{language}'. Supported: Python, C, C++, Java, JS, TypeScript, Go, Rust, C#, PHP, Ruby, Kotlin, Swift, SQL, Bash.",
                    "returncode": 1,
                    "runtime_ms": 0.0,
                    "timeout": False
                }
        finally:
            shutil.rmtree(temp_dir, ignore_errors=True)

    @classmethod
    def evaluate_submission(
        cls,
        language: str,
        code: str,
        test_cases: List[Dict[str, Any]],
        timeout_sec: float = 3.5
    ) -> Dict[str, Any]:
        """
        Evaluate a student solution against multiple test cases and calculate scores.
        """
        if not test_cases:
            return {
                "status": "Accepted",
                "passed_count": 0,
                "total_count": 0,
                "score": 100,
                "runtime_ms": 0.0,
                "error": None,
                "test_case_results": []
            }

        passed_count = 0
        total_count = len(test_cases)
        max_runtime = 0.0
        results = []
        overall_status = "Accepted"
        first_error = None

        for tc in test_cases:
            input_str = tc.get("input_data") or ""
            expected_out = (tc.get("expected_output") or "").strip()
            is_hidden = tc.get("is_hidden", False)
            tc_id = tc.get("id", str(uuid.uuid4()))

            run_res = cls.run_code_single(language, code, input_str, timeout_sec)
            actual_out = run_res["stdout"].strip()
            max_runtime = max(max_runtime, run_res["runtime_ms"])

            # Check if output matches expected
            passed = (actual_out == expected_out) and (run_res["returncode"] == 0)

            if not passed:
                if run_res.get("compilation_error"):
                    overall_status = "Compilation Error"
                    first_error = run_res["stderr"]
                elif run_res["timeout"]:
                    overall_status = "Time Limit Exceeded"
                    first_error = "Time Limit Exceeded"
                elif run_res["returncode"] != 0:
                    overall_status = "Runtime Error"
                    first_error = run_res["stderr"]
                else:
                    if overall_status == "Accepted":
                        overall_status = "Wrong Answer"
            else:
                passed_count += 1

            results.append({
                "test_case_id": tc_id,
                "is_hidden": is_hidden,
                "passed": passed,
                "input": "[Hidden]" if is_hidden else input_str,
                "expected_output": "[Hidden]" if is_hidden else expected_out,
                "actual_output": "[Hidden]" if is_hidden else actual_out,
                "error_message": None if is_hidden else (run_res["stderr"] if run_res["stderr"] else None),
                "execution_time_ms": run_res["runtime_ms"]
            })

            # Fail fast on compilation error
            if run_res.get("compilation_error"):
                break

        score = round((passed_count / total_count) * 100) if total_count > 0 else 0

        return {
            "status": overall_status,
            "passed_count": passed_count,
            "total_count": total_count,
            "score": score,
            "runtime_ms": max_runtime,
            "error": first_error,
            "test_case_results": results
        }
