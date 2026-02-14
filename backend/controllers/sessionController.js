const asyncHandler=require("express-async-handler");
const Session=require("../models/sessionModel");
const fetch=require("node-fetch");
const fs=require("fs");
const formData=require("form-data")
const path=require("path")
const mongoose=require("mongoose")


const AI_SERVICE_URL="http://localhost:8000"
const pushSocketUpdate=(io,userId,sessionId,status,message,sessionData=null)=>{
    io.to(userId.toString()).emit("sessionUpdate",{
        sessionId,
        status,
        message,
        sessionData
    });
}

const createSession=asyncHandler(async(req,res)=>{
    const {role,level,interviewType,count}=req.body;
    userId=req.user._id;
    if(!role || !level || !interviewType || !count){
        return res.json({
            success:false,
            message:"All fields are required"
        })
    }

    let session=await Session.create({
        
        user:userId,
        role,
        level,
        interviewType,
        status:"pending"
    })

    const io=req.app.get("io")

    return res.status(201).json({
        message:"Session created successfully",
        sessionId:session._id,
        status:"processing",
    });

    //IIFE -> Immediately invoked function expression
      (
        async()=>{
            try{
                pushSocketUpdate(io,userId,session._id,"ai generating questions",`generating ${count} question for ${level} level ${role} rolew interview...`)
                const aiResponse=await fetch(`${AI_SERVICE_URL}/generate-questions`,{
                    method:"POST",
                    headers:{
                        "Content-Type":"application/json"
                    },
                    body:JSON.stringify({
                        role,
                        level,
                        count
                    })
                });

                if(!aiResponse.ok){
                    const errorBody=await aiResponse.text();
                    return res.json({
                        success:false,
                        message:"Error in generating questions",
                        message:errorBody
                    })
                }

                const aiData=await aiResponse.json();
                const codingCount=interviewType==='coding-mix' ? Math.floor(count*0.2):0
                 
                const questions=aiData.questions.map((qText,index)=>({
                    questionText:qText,
                    questionType:index < codingCount ? "coding" : "oral",
                    isEvaluated:false,
                    isSubmitted:false
                }))
                 
                session.questions=questions;
                session.status="in-progress"
                await session.save();
                
                pushSocketUpdate(io,userId,session._id,"questions are ready","starting interview...")
           
            }catch(error){
               console.error(`Session creation failed:${error.message}`)
               session.status="failed";
               await session.save();
               pushSocketUpdate(io,userId,session._id,"failed",error.message);
            }
        }
      )
})

exports.getSession=asyncHandler(async(req,re)=>{
    const userId=req.user._id;
    const sessions=await Session.find({user:userId}).select("-questions")
    return res.status(200).json(sessions);
})

exports.getSessionById=asyncHandler(async(req,re)=>{
    const userId=req.user._id;
    const sessionId=req.params.id;
    const session=await Session.findOne({user:userId,i_id:sessionId});
    if(!session){
        return res.status(404).json({
            success:false,
            message:"Session not found"
        })
    }
    return res.status(200).json(session)

})

exports.deleteSession=asyncHandler(async(req,res)=>{
    
    const sessionId=req.params.id;
    const session=await Session.findById(sessionId)
    if(!session){
        return res.status(404).json({
            success:false,
            message:"Session not found"
        })
    }

    await Session.remove();
    return res.status(200).json({
        id:sessionId,
        message:"Session deleted successfully"})
})

const evaluateAnswerAsync=async(io,userId,sessionId,questionIdx,audioFilePath=null,code=null)=>{
 
  const questionIndex=typeof questionIdx==="string"?parseInt(questionIdx,10):questionIdx;
  const session=await Session.findById(sessionId);
  if(!session){
      pushSocketUpdate(io,userId,sessionId,"failed","Session not found");
      return;
  }
  if(questionIndex >= session.question.length){
    pushSocketUpdate(io,userId,sessionId,"failed","Question not found")
    return;  
  }
   
  const question=session.questions[questionIndex];
  if(!question){
    pushSocketUpdate(io,userId,sessionId,"failed",`Question not found at index ${questionIndex}`);
    return;
  }

    let transcription="";
    if(audioFilePath){
        try{
            pushSocketUpdate(io,userId,sessionId,"AI_Transcribing",`Transcribing question ${questionIndex+1}...`)
            const formData=new FormData();
            formData.append("file",fs.createReadStream(audioFilePath));
            const transResponse=await fetch(`${AI_SERVICE_URL}/transcibe`,{
                method:"POST",
                body:formData,
                headers:formData.getHeaders()
            });
            if(!transResponse.ok){
                const errorBody=await transResponse.text();
                return res.json({
                    message:`AI service error:${transResponse.status}-${errorBody}`
                })
            }
            const transData=await transResponse.json();
            transcription=transData.transcription || "";

        }catch(error){
              console.error(`Transcription failed:${error.message}`);
              pushSocketUpdate(io,userId,sessionId,"failed",error.message);
             
        }
        finally{
            if(audioFilePath && fs.existsSync(audioFilePath)){
                fs.unlinkSync(audioFilePath)
            }
        }
    }


    try{
           pushSocketUpdate(io,userId,sessionId,"AI_EVALUATING",`Evaluating questions ${questionIndex+1}...`) 
           const evaluateResponse=await fetch(`${API_SERVICE_URL}/evaluate`,{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                questionText:question.questionText,
                questionType:question.questionType,
                role:session.role,
                level:session.role,
                user_answer:transcription,
                user_code:code || ""
            })
           })

           if(!evaluateResponse.ok){
            return res.json({
               message: "AI Evaluating service failed"
            });
           }

           const evalData=await evaluateResponse.json();
           
           question.userAnswerText=transcription;
           question.userSubmittedCode=code || "";
           question.technicalScore=evalData.technicalScore;
           question.aiFeedback=evalData.aiFeedback;
           question.idealAnswer=evalData.idealAnswer;
           question.isEvaluated=true;


           const allQuestionsEvaluated=session.questions.every(q=>q.isEvaluated);

           if(session.status==='completed' || allQuestionsEvaluated){
            const scoreSummary=await calculateOverallScore(sessionId);
            session.overallScore=scoreSummary.overallScore || 0;
            session.matrics={
                avgTechnical:scoreSummary.avgTechnical,
                avgConfidence:scoreSummary.avgConfidence,
            };

            if(allQuestionsEvaluated){
                session.status='completed';
                session.endTime=session.endTime || new Date();
            }

            await session.save();
             pushSocketUpdate(io, userId, sessionId, 'SESSION_COMPLETED', 'Scores finalized.', session);
           }else{
            await session.save();
            pushSocketUpdate(io, userId, sessionId, 'EVALUATION_COMPLETE', `Feedback for Q${questionIdx + 1} is ready!`, session);
           }

        }catch(error){
                console.error(`Evaluate Error:${error.message}`);
                pushSocketUpdate(io, userId, sessionId, 'EVALUATION_FAILED', `Evaluation failed.`, session);
        }


}

exports.submitAnswer=asyncHandler(async(req,res)=>{
    const userId=req.user._id;
    const sessionId=req.params.id;
    const {questionIndex,code}=req.body
    const session=await Session.findById(sessionId);
    if(!session || session.user.toString()!=userId.toString()){
        return res.status(404).json({
            success:false,
            message:"Sesion not found or user unauthorized"
        })
    }

    const questionIdx=parseInt(questionIndex,10);
    const question=session.question[questionIdx];
    if(!question){
        return res.status(404).json({
            success:false,
            message:`Question not found at index ${questionIndex}`
        })
    }
    let audioFilePath=null;
    if(req.file){
        audioFilePath=path.join(process.cwd(),req.file.path); 
    }

    const codeSubmission=code || null;

   
    question.isSubmitted=true;
    await session.save();
    return res.status(200).json({
        is:sessionId,
        message:"Answer submitted successfully.Please wait for result",
        status:"Recieved"
    })
    const io=req.app.get("io");
    
    evaluateAnswerAsync(io,userId,sessionId,questionIdx,audioFilePath,codeSubmission)

}) 


const calculateOverallScore=async(sessionId)=>{
    const results=await Session.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(sessionId)
            }
        },
        {
            $unwind:'$questions'
        },
        {
            $group:{
                _id:'$_id',
                avgTechnical:{
                    $avg:{$cond:[{$eq:['$questions.isEvaluated',true]}, '$questions.technicalScore',0]},
                   
                },
                 avgConfidence:{
                   $avg:{$cond:[{$eq:['$questions.isEvaluated',true]}, '$questions.confidenceScore',0]},
                }
            }
        },
        {
            $project:{
                _id:0,
                overallScore:{$round:[{$avg:['$avgTechnical','$avgConfidence']},0]},
                avgTechnical:{$round:["$avgTechnical",0]},
                avgConfidence:{$round:["$avgConfidence",0]}
            }
        }

    ]);
     return results[0] || {overallScore:0,avgTechnical:0,avgConfidence:0}   
}


exports.endSession=asyncHandler(async(req,res)=>{
    const sessionId=req.params.id;
    const userId=req.user._id;

    const session=await Session.findById(sessionId);
    if(!session || session.user.toString() !== userId.toString() ){
        return res.status(404).json({
            success:false,
            message:"Session not found or unauthorized user"
        })
    }

    const isProcessing=session.questions.some(q=>q.isSubmitted && !q.isEvaluated);
    if(isProcessing){
        return res.status(400).json({
            success:false,
            message:"Cananot end interview while AI is processing answers."
        })
    }
    if(session.status==='completed'){
        return res.status(400).json({
            success:false,
            message:"Session is already completed"
        })
    }

    const scoreSummary=await this.calculateOverallScore(sessionId);
    session.overallScore=scoreSummary.calculateOverallScore || 0;
    session.status='completed';
    session.endTime=new Date();
    session.matrics={
        avgTechnical:scoreSummary.avgTechnical,
        avgConfidence:scoreSummary.avgConfidence
    };
    await session.save();
    const io = req.app.get('io');
    pushSocketUpdate(io, userId, sessionId, 'SESSION_COMPLETED', 'Interview session ended early.', session);

    res.json({ message: 'Session ended successfully.', session });
})