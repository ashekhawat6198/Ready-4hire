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

class EvaluationRequest(BaseModel):
    question:str
    question_type:str
    role:str
    level:str
    user_answer:Optional[str]=None
    user_code:Optional[str]=None

class EvaluationResponse(BaseModel):
    technicalScore:int
    confidenceScore:int
    aiFeedback:str
    idealAnswer:str 


@app.get("/")              # when you open localhost 8000 you get this message
async def root():
    return {"message":"Hello from AI Interviewer Microservice !","model":OLLAMA_MODEL_NAME}

@app.post("/generate-questions",response_model=QuestionResponse)
async def generate_questions(request:QuestionRequest):
   
    try:
        if request.interview_type=="coding-mix":
            coding_count=int(request.count * 0.2)
            oral_count=int(request.count) - int(coding_count)

            instruction=(                # instruction for the AI
                f"The first {coding_count} questions MUST be coding challenge requiring function implementation."
                f"The remaining {oral_count} quetions MUST be conceptual oral quetions"
            )
        else:
            instruction=(
            "All questions MUST be conceptual oral questions."
            "Do not generate any coding or implementation challenges "
            )
            
        system_prompt=(
             "You are a professional technical interviewer."
             "Task:Generate intervview questions. No conversational text or numbering."
             f"Crucial: {instruction}"
             "Output exactly one question per line"
            )

        user_prompt=(
                f"Generate exactly {request.count} unique interview questions for a {request.level} level {request.role} . "
            )

        response=ollama.generate(
                model=OLLAMA_MODEL_NAME,
                prompt=user_prompt,
                system=system_prompt,
                options={"temperature":0.6,
                         "num_gpu": 0  }
            )

        raw_text=response['response'].strip()
        questions=[q.strip() for q in raw_text.split('\n') if q.strip()]
        return (QuestionResponse(question=questions[:request.count],model_used=OLLAMA_MODEL_NAME ))
    
    except Exception as e:
        raise HTTPException(status_coode=500,detail=str(e))

 
@app.post("/transcribe")
async def transcribe_audio(file:UploadFile=File(...)):
    try:
        audio_bytes=await file.read()    # read the file and store in memory
        audio_in_memory=io.BytesIO(audio_bytes)   # makes the voice data look like a file
        audio_segment=AudioSegment.from_file(audio_in_memory)   # Translate the voice file into a language the computer understands.
        with tempfile.NamedTemporaryFile(delete=False,suffix=".mp3") as tmp:    # create temporary file on computer which ends with .mp3
            temp_audio_path=tmp.name                         # save the path of temporary file
            audio_segment.export(temp_audio_path,format="mp3")    # save audio in temporary file
        if not WHISPER_MODEL:            # Check if Whisper (speech-to-text model) is loaded.
            raise HTTPException(status_code=503,detail="Whisper Model is not loaded")   # not ready show error
        
        result=WHISPER_MODEL.transcribe(temp_audio_path)   # converting voice to text
        os.remove(temp_audio_path)                   # delete the temporary file
        return {"transcription":result["text"].strip()}     # return respone to user
    
    except Exception as e:
        if 'temp_audio_path' in locals() and os.path.exists(temp_audio_path):
            os.remove(temp_audio_path)
        raise HTTPException(status_code=500,detail=str(e))            


@app.post("/evaluate",response_model=EvaluationResponse)
async def evaluate(request:EvaluationRequest):
    try:
        if request.question_type=="oral":
            assessment_instruction=(
                "This is a conceptual oral question. Focus purely on candidate's verbal explaination."
                "Ignore any code blocks."
                "CRITICAL:If the transcript is empty, nonsense (e.g. 'blah blah','testing' ) or irrelevent to the question, SCORE 0"

            )
        else:
            assessment_instruction=(
                "This is a coding challenge question. Evaluate the code logic and efficiency."
                "Use the transcription only for insight into their thought process."
                "CRITICAL:If the code is 'undefined',empty, just random comments, or random characters, SCORE 0"

            ) 

        systemp_prompt=(
            "You are a strict technical interviewer."
            "Do not hallucinate positive reviews for bad input."
            "RULE 1:If the answer is gibberish, irrelevant, or missing, return 'technicalScore':0 and 'confidenceScore':0"
            "RULE 2:For 'idealAnswer', provide a clean Markdown string. Do not return a nested JSON object."
            f"Context:{assessment_instruction}"
            "Respond ONLY with a JSON object."
            "Required keys:'technicalScore' (0-100), 'confidenceScore' (0-100), 'aiFeedback', 'idealAnswer'."  
        )  

        user_prompt=(
           
            f"Role:{request.role}\n"
            f"Question:{request.question}\n"
            f"Level:{request.level}\n"
            f"Verval Answer: {request.user_answer or 'No verbal answer provided'}\n"  
            f"Code:{request.user_code or 'No code provided'}\n"
        )    

        reponse=ollama.generate(
          model=OLLAMA_MODEL_NAME,
          prompt=user_prompt,
          system=systemp_prompt,
          format="json",
          options={"temperature":0.1}
        )
        reponse_text=reponse['response'].strip()
        try:

            evaluation_data=json.loads(reponse_text)
            if 'idealAnswer' in evaluation_data and not isinstance(evaluation_data['idealAnswer'],str):
                evaluation_data['idealAnswer']=json.dumps(evaluation_data['idealAnswer'])
            return EvaluationResponse(**evaluation_data)    
        except json.JSONDecodeError:
            import re
            fixed_text=re.sub(r'[\r\n\t]',' ',reponse_text)
            try:
                 evaluation_data=json.loads(fixed_text)
                 if 'idealAnswer' in evaluation_data and not isinstance(evaluation_data['idealAnswer'],str):
                    evaluation_data['idealAnswer']=json.dumps(evaluation_data['idealAnswer'])
                 return EvaluationResponse(**evaluation_data) 
            except :
                 print(f"Failed to parse responseL{reponse_text}")
                 return EvaluationResponse(technicalScore=0,confidenceScore=0,aiFeedback="Failed to parse response",idealAnswer="Failed to parse response")
    except Exception as e:
        print(f"Failed to generate response:{e}")
        raise HTTPException(status_code=500,detail=str(e))

if __name__=="__main__":
    uvicorn.run(app,host="0.0.0.0",port=AI_SERVICE_PORT)

