from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

# Ensure we can import the pipeline
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from research_ops_pipeline import ResearchOpsPipeline

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class VOCRequest(BaseModel):
    text: str

@app.post("/analyze")
async def analyze_voc(request: VOCRequest):
    try:
        pipeline = ResearchOpsPipeline()
        results = pipeline.execute(request.text)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
