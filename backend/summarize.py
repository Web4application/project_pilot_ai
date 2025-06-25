from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class CodeInput(BaseModel):
    code: str

@app.post("/summarize")
async def summarize_code(data: CodeInput):
    # Simulate AI summarization
    summary = f"🔍 AI Summary:\n\n{data.code[:200]}..."
    return summary
