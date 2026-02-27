import uvicorn
import os
import io
import json
import tempfile
from fastapi import FastAPI,HTTPException,UploadFile,File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from typing import Optional
import ollama
import openai
import whisper
from pydub import AudioSegment

load_dotenv()

AI_SERVICE_PORT=os.getenv("AI_SERVICE_PORT",8000)
OLLAMA_MODEL_NAME=os.getenv("OLLAMA_MODEL_NAME","mistral")

app=FastAPI(title="AI Interviewer Microservice",version="1.0")
origins=["*"]

