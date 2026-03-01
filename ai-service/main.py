import uvicorn   # runs fastapi server
import os        # read enviornment varaibles
import io        # handle files in memory
import json      # work with json
import tempfile  # create temporary files
from fastapi import FastAPI,HTTPException,UploadFile,File # fast api tools=> create app,send error, upload files(like audio)
from fastapi.middleware.cors import CORSMiddleware # allows backend to talk to ai server without errors
from pydantic import BaseModel # used to define request and responnse formats
from dotenv import load_dotenv # load values from env
from typing import Optional
import ollama       # ai tootls  
import whisper      # ai tootls (sppech to text)
from pydub import AudioSegment  # convert or process audio files

load_dotenv()

AI_SERVICE_PORT=int(os.getenv("AI_SERVICE_PORT",8000))  # port number(default 8000)

OLLAMA_MODEL_NAME=os.getenv("OLLAMA_MODEL_NAME","mistral") # ai model name (default mistral)

app=FastAPI(title="AI Interviewer Microservice",version="1.0")  # creates fast api app

origins=["*"]   # any frontend(backend) can access this api


app.add_middleware(             # fix cors errors when frontend(backend) call this
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

WHISPER_MODEL=None   # variable to store the model

try:                                   # loading whisper model 
    print("Loading Whisper Model")
    WHISPER_MODEL=whisper.load_model("base.en")
    print("Whisper Model Loaded Successfully")
except Exception as e:
    print("Error while loading Whisper Model")
    print(e)

    
class QuestionRequest(BaseModel):        # this defines what the user sends
    role:str="MERN Stack Developer"
    level:str="Junior"
    count:int=5
    interview_type:str="coding-mix"

class QuestionResponse(BaseModel):  # this define what api returns 
    question:list[str]
    model_used:str

@app.get("/")              # when you open localhost 8000 you get this message
async def root():
    return {"message":"Hello from AI Interviewer Microservice !","model":OLLAMA_MODEL_NAME}

@app.post("/generate-questions",response_model=QuestionResponse)
async def generate_questions(request:QuestionRequest):
    questions=ollama.generate_questions(request)
    try:
        if request.interview_type=="coding-mix":
            coding_count=int(request.count * 0.2)
            oral_count=int(request.count) - int(coding_count)

            instruction=(
                f"The first {coding_count} questions MUST be coding challenge requiring function implementation."
                f"The remaining {oral_count} quetions MUST be conceptual oral quetions"
            )
        else:
            

    return {"question":questions,"model_used":OLLAMA_MODEL_NAME}

if __name__=="__main__":
    uvicorn.run(app,host="0.0.0.0",port=AI_SERVICE_PORT)

