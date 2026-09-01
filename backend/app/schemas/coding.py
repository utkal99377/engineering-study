from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class TestCaseOut(BaseModel):
    id: str
    input_data: str
    expected_output: str
    is_hidden: bool
    explanation: Optional[str] = None
    order_no: int

    class Config:
        from_attributes = True

class CodingProblemBase(BaseModel):
    course_id: Optional[str] = None
    title: str
    slug: str
    difficulty: Optional[str] = "Easy"
    tags: Optional[List[str]] = []
    statement: str
    input_format: Optional[str] = None
    output_format: Optional[str] = None
    constraints: Optional[str] = None
    time_limit_sec: Optional[float] = 2.0
    memory_limit_mb: Optional[int] = 128
    starter_code: Optional[Dict[str, str]] = {}

class CodingProblemOut(CodingProblemBase):
    id: str
    status: str
    created_at: datetime
    sample_test_cases: List[TestCaseOut] = []
    submissions_count: Optional[int] = 0
    solved_status: Optional[str] = "unsolved"  # solved, attempted, unsolved

    class Config:
        from_attributes = True

class SandboxDirectRequest(BaseModel):
    language: str  # python, c, cpp, java, javascript, typescript, go, rust, csharp, php, ruby, kotlin, swift, sql, bash
    code: str
    stdin: Optional[str] = ""
    timeout_sec: Optional[float] = 3.5

class CodeExecutionRequest(BaseModel):
    problem_id: Optional[str] = None
    language: str  # python, c, cpp, java, javascript, typescript, go, rust, etc.
    code: str
    custom_input: Optional[str] = None
    is_submission: Optional[bool] = False  # False = Run on sample cases / custom input; True = Official grading against all hidden cases

class TestCaseExecutionResult(BaseModel):
    test_case_id: Optional[str] = None
    is_hidden: bool = False
    passed: bool
    input: Optional[str] = None
    expected_output: Optional[str] = None
    actual_output: Optional[str] = None
    error_message: Optional[str] = None
    execution_time_ms: float = 0.0

class CodeExecutionResponse(BaseModel):
    submission_id: Optional[str] = None
    status: str  # Accepted, Wrong Answer, Time Limit Exceeded, Compilation Error, Runtime Error, Executed
    passed_count: int
    total_count: int
    score: int
    runtime_ms: float
    output: Optional[str] = None
    error: Optional[str] = None
    test_case_results: List[TestCaseExecutionResult] = []

class SubmissionOut(BaseModel):
    id: str
    problem_id: str
    problem_title: Optional[str] = None
    language: str
    code: str
    status: str
    passed_test_cases: int
    total_test_cases: int
    runtime_ms: float
    score: int
    error_message: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
