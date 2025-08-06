import os
import time
import logging
import requests
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

API_KEY = os.getenv("API_KEY")

if not API_KEY:
    logger.warning("API_KEY not set! Please create a .env file with API_KEY=your_key.")
    API_KEY = "MISSING_KEY"

app = FastAPI()

def upload_file(filename: str) -> str:
    with open(filename, 'rb') as f:
        headers = {'authorization': API_KEY}
        response = requests.post('https://api.assemblyai.com/v2/upload', headers=headers, data=f)
    response.raise_for_status()
    return response.json()['upload_url']

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def request_transcription(upload_url: str) -> str:
    endpoint = "https://api.assemblyai.com/v2/transcript"
    json_data = {
        "audio_url": upload_url,
        "language_code": "en",
        "auto_chapters": False
    }
    headers = {
        "authorization": API_KEY,
        "content-type": "application/json"
    }
    response = requests.post(endpoint, json=json_data, headers=headers)
    response.raise_for_status()
    return response.json()["id"]

def get_transcription_result(transcript_id: str) -> dict:
    endpoint = f"https://api.assemblyai.com/v2/transcript/{transcript_id}"
    headers = {"authorization": API_KEY}
    response = requests.get(endpoint, headers=headers)
    response.raise_for_status()
    return response.json()

@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    # Save uploaded file temporarily
    temp_dir = Path("temp_audio")
    temp_dir.mkdir(exist_ok=True)
    temp_file_path = temp_dir / file.filename
    
    with open(temp_file_path, "wb") as f:
        f.write(await file.read())

    try:
        upload_url = upload_file(str(temp_file_path))
    except requests.HTTPError as e:
        temp_file_path.unlink(missing_ok=True)
        raise HTTPException(status_code=500, detail=f"Upload failed: {e}")

    try:
        transcript_id = request_transcription(upload_url)
    except requests.HTTPError as e:
        temp_file_path.unlink(missing_ok=True)
        raise HTTPException(status_code=500, detail=f"Transcription request failed: {e}")

    MAX_WAIT_SECONDS = 30
    SLEEP_INTERVAL = 0.5
    start_time = time.time()

    while True:
        try:
            result = get_transcription_result(transcript_id)
        except requests.HTTPError as e:
            temp_file_path.unlink(missing_ok=True)
            raise HTTPException(status_code=500, detail=f"Error getting transcription result: {e}")

        status = result["status"]

        if status == "completed":
            temp_file_path.unlink(missing_ok=True)
            return {"text": result["text"]}
        elif status == "error":
            temp_file_path.unlink(missing_ok=True)
            raise HTTPException(status_code=500, detail=f"Transcription error: {result.get('error')}")

        elapsed = time.time() - start_time
        if elapsed > MAX_WAIT_SECONDS:
            temp_file_path.unlink(missing_ok=True)
            raise HTTPException(status_code=504, detail="Transcription timed out.")
        

        time.sleep(SLEEP_INTERVAL)
