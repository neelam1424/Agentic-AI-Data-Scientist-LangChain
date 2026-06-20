"""
api/routes.py — FastAPI router.
Exposes POST /analyze for the frontend to upload a CSV and get results.
"""

import tempfile
import os
import traceback
import logging

from fastapi import APIRouter, File, Form, UploadFile, HTTPException
from fastapi.responses import JSONResponse

from core.pipeline import run_pipeline

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/analyze")
async def analyze(
    file: UploadFile = File(..., description="CSV dataset file"),
    target_col: str  = Form(None, description="Target column name (optional; defaults to last column)"),
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted.")

    # Save upload to a temp file so run_pipeline() can read it
    with tempfile.NamedTemporaryFile(suffix=".csv", delete=False) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    try:
        result = run_pipeline(csv_path=tmp_path, target_col=target_col or None)
        return JSONResponse(content=result)

    except Exception as e:
        tb = traceback.format_exc()
        logger.error("Pipeline failed:\n%s", tb)
        # Print to uvicorn console so you can see it in the terminal
        print("\n========= PIPELINE ERROR =========")
        print(tb)
        print("==================================\n")
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        os.unlink(tmp_path)
