from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import ai, data, community

app = FastAPI(title="Project Pilot AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ai.router, prefix="/ai", tags=["AI"])
app.include_router(data.router, prefix="/data", tags=["Data"])
app.include_router(community.router, prefix="/community", tags=["Community"])

@app.get("/")
def root():
    return {"message": "🚀 Project Pilot API is live"}
