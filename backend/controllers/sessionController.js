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

           
            }catch(error){
                return res.status
            }
        }
      )
})
