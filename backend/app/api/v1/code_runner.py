from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.coding import CodingProblem, TestCase, Submission
from app.services.sandbox_runner import SandboxRunner
from app.schemas.coding import (
    CodeExecutionRequest,
    CodeExecutionResponse,
    SandboxDirectRequest,
    SubmissionOut
)

router = APIRouter(tags=["Code Execution & Submissions"])

@router.post("/code/sandbox-execute")
def execute_direct_sandbox(req: SandboxDirectRequest):
    """
    Compile and execute code in any programming language (Python, C, C++, Java, JS, TypeScript, Go, Rust, C#, PHP, Swift, Kotlin, SQL, Bash).
    """
    res = SandboxRunner.run_code_single(
        language=req.language,
        code=req.code,
        input_data=req.stdin or "",
        timeout_sec=req.timeout_sec or 3.5
    )
    return {
        "success": res["returncode"] == 0,
        "output": res["stdout"],
        "error": res["stderr"] if res["stderr"] else None,
        "runtime_ms": res["runtime_ms"],
        "timeout": res["timeout"],
        "compilation_error": res.get("compilation_error", False),
        "engine": res.get("engine", "universal_cloud")
    }

@router.post("/code/run", response_model=CodeExecutionResponse)
def run_code_preview(
    req: CodeExecutionRequest,
    db: Session = Depends(get_db)
):
    """
    Execute code in isolated sandbox against custom input or sample test cases (for practice preview).
    """
    problem = db.query(CodingProblem).filter(CodingProblem.id == req.problem_id).first()
    if not problem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coding problem not found."
        )

    # If custom input was provided, run single test
    if req.custom_input is not None and req.custom_input.strip() != "":
        res = SandboxRunner.run_code_single(
            language=req.language,
            code=req.code,
            input_data=req.custom_input,
            timeout_sec=problem.time_limit_sec
        )
        status_verdict = "Executed" if res["returncode"] == 0 else ("Time Limit Exceeded" if res["timeout"] else "Runtime Error")
        return {
            "submission_id": None,
            "status": status_verdict,
            "passed_count": 1 if res["returncode"] == 0 else 0,
            "total_count": 1,
            "score": 100 if res["returncode"] == 0 else 0,
            "runtime_ms": res["runtime_ms"],
            "output": res["stdout"],
            "error": res["stderr"] if res["stderr"] else None,
            "test_case_results": [
                {
                    "test_case_id": "custom_input",
                    "is_hidden": False,
                    "passed": res["returncode"] == 0,
                    "input": req.custom_input,
                    "expected_output": None,
                    "actual_output": res["stdout"],
                    "error_message": res["stderr"] if res["stderr"] else None,
                    "execution_time_ms": res["runtime_ms"]
                }
            ]
        }

    # Otherwise run on public sample test cases
    sample_tcs = db.query(TestCase).filter(
        TestCase.problem_id == problem.id,
        TestCase.is_hidden == False
    ).order_by(TestCase.order_no).all()

    tc_list = [
        {
            "id": tc.id,
            "input_data": tc.input_data,
            "expected_output": tc.expected_output,
            "is_hidden": False
        } for tc in sample_tcs
    ]

    eval_result = SandboxRunner.evaluate_submission(
        language=req.language,
        code=req.code,
        test_cases=tc_list,
        timeout_sec=problem.time_limit_sec
    )

    return {
        "submission_id": None,
        "status": eval_result["status"],
        "passed_count": eval_result["passed_count"],
        "total_count": eval_result["total_count"],
        "score": eval_result["score"],
        "runtime_ms": eval_result["runtime_ms"],
        "error": eval_result["error"],
        "test_case_results": eval_result["test_case_results"]
    }

@router.post("/submissions", response_model=CodeExecutionResponse)
def submit_solution(
    req: CodeExecutionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Official graded solution submission evaluated against all test cases (sample + hidden).
    """
    problem = db.query(CodingProblem).filter(CodingProblem.id == req.problem_id).first()
    if not problem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coding problem not found."
        )

    all_tcs = db.query(TestCase).filter(
        TestCase.problem_id == problem.id
    ).order_by(TestCase.order_no).all()

    tc_list = [
        {
            "id": tc.id,
            "input_data": tc.input_data,
            "expected_output": tc.expected_output,
            "is_hidden": tc.is_hidden
        } for tc in all_tcs
    ]

    eval_result = SandboxRunner.evaluate_submission(
        language=req.language,
        code=req.code,
        test_cases=tc_list,
        timeout_sec=problem.time_limit_sec
    )

    # Persist submission record
    submission = Submission(
        user_id=current_user.id,
        problem_id=problem.id,
        language=req.language,
        code=req.code,
        status=eval_result["status"],
        passed_test_cases=eval_result["passed_count"],
        total_test_cases=eval_result["total_count"],
        runtime_ms=eval_result["runtime_ms"],
        error_message=eval_result["error"],
        score=eval_result["score"]
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)

    return {
        "submission_id": submission.id,
        "status": eval_result["status"],
        "passed_count": eval_result["passed_count"],
        "total_count": eval_result["total_count"],
        "score": eval_result["score"],
        "runtime_ms": eval_result["runtime_ms"],
        "error": eval_result["error"],
        "test_case_results": eval_result["test_case_results"]
    }

@router.get("/submissions/my", response_model=List[SubmissionOut])
def get_my_submissions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all past coding submissions for the logged-in user."""
    subs = db.query(Submission).filter(
        Submission.user_id == current_user.id
    ).order_by(Submission.created_at.desc()).all()

    results = []
    for s in subs:
        p = db.query(CodingProblem).filter(CodingProblem.id == s.problem_id).first()
        results.append({
            "id": s.id,
            "problem_id": s.problem_id,
            "problem_title": p.title if p else "Coding Problem",
            "language": s.language,
            "code": s.code,
            "status": s.status,
            "passed_test_cases": s.passed_test_cases,
            "total_test_cases": s.total_test_cases,
            "runtime_ms": s.runtime_ms,
            "score": s.score,
            "error_message": s.error_message,
            "created_at": s.created_at
        })
    return results
