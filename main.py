import os
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY missing. Add it to .env")

app = FastAPI()

# ---------------------------
#  CORS
# ---------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------
#  STREAMING ROUTE
# ---------------------------
@app.post("/generate_react_stream")
async def generate_react_stream(request: Request):

    body = await request.json()
    data = body.get("data", "")

    if not data:
        return {"error": "Missing 'data' field"}

    llm = ChatOpenAI(
        api_key=OPENAI_API_KEY,
        model="gpt-5",
        temperature=0.1,
        streaming=True
    )

    prompt = PromptTemplate(
        input_variables=["file_data"],
        template="""
You are a UI generator assistant.

Given the following JSON/dataset:

{file_data}

Generate a **React component** that:
- Uses functional components + hooks
- Displays the data in a sortable & filterable table
- Is optimized for minimal re-renders
- Provides clean UI
- Contains ONLY React code output
"""
    )

    chain_input = prompt.format(file_data=data)

    async def event_stream():
        async for chunk in llm.astream(chain_input):
            if chunk.content:
                yield chunk.content

    return StreamingResponse(event_stream(), media_type="text/plain")


# ---------------------------
#  NON-STREAM VERSION
# ---------------------------
@app.post("/generate_react")
async def generate_react(request: Request):

    body = await request.json()
    data = body.get("data", "")

    llm = ChatOpenAI(
        api_key=OPENAI_API_KEY,
        model="gpt-5",
        temperature=0.2
    )

    prompt = PromptTemplate(
        input_variables=["file_data"],
        template="""
Generate a React component with sorting, filtering, and clean UI.

Data:
{file_data}

Return ONLY React code.
"""
    )

    final_prompt = prompt.format(file_data=data)
    output = llm.invoke(final_prompt)

    return {"generated_code": output.content}
