from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Command(BaseModel):
    command: str

@app.post("/run")
def run_command(data: Command):
    cmd = data.command.lower()
    if "summarize" in cmd:
        path = cmd.split("summarize")[-1].strip()
        return {"output": f"📄 Simulated summary of {path}"}
    elif "generate" in cmd:
        task = cmd.split("generate")[-1].strip()
        return {"output": f"🛠️ Simulated generation of: {task}"}
    else:
        return {"output": "❌ Unknown command"}
