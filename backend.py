from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sandbox_creation import sandbox_generation
import uvicorn
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SandboxResponse(BaseModel):
    frontend_url: str
    sandbox_id: str

@app.post("/create-sandbox", response_model=SandboxResponse)
async def create_sandbox():
    """
    Create a new Daytona sandbox and return the preview URL
    """
    try:
        result = sandbox_generation()
        
        return {
            "frontend_url": result["frontend_url"],
            "sandbox_id": result["sandbox_id"]
        }
    except Exception as e:
        print(f"Error creating sandbox: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create sandbox: {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}


