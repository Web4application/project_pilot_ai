from fastapi import FastAPI
from pydantic import BaseModel
import os

app = FastAPI()

class CodeInput(BaseModel):
    code: str

@app.post("/summarize")
async def summarize_code(data: CodeInput):
    backend = os.getenv("MODEL_BACKEND", "openai").lower()
    if backend == "openai":
        return {"summary": "[OpenAI] Summary of your code."}
    elif backend == "ollama":
        return {"summary": "[Ollama] Local model summary."}
    elif backend == "webllm":
        return {"summary": "[WebLLM] Browser-based summary (mocked)."}
    else:
        return {"summary": "[Unknown backend] Please configure MODEL_BACKEND."}
