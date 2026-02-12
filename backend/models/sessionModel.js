const mongoose=require("mongoose");


const questionSchema=mongoose.Schema({
    questionText:{
        type:String,
        required:true
    },
    questionType:{
        type:String,
        enum:["coding","oral"],
        required:true
    },
    idealAnswer:{
        type:String,
        default:"pending"
    },
    userAnswerText:{
        type:String,
        default:""
    },
    userSubmittedCode:{
        type:String,
        default:""
    },
    isSubmitted:{
        type:Boolean,
        default:false
    },
    isEvaluated:{
        type:Boolean,
        default:false,
    },
     technicalScore:{
        type:Number,
        default:0
     },
     confidenceScore:{
        type:Number,
        default:0
     },
     aiFeedback:{
        type:String,
        default:"Not yet submitted or evaulated"
     }
})

const sessionSchema=mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        index:true
    },
    role:{
        type:String,
        required:true
    },
    level:{
        type:String,
        required:true,
    },
    interviewType:{
        type:String,
        enum:["oral-only","coding-mix"],
        required:true,
    },
    status:{
        type:String,
        enum:["pending","in-progress","completed","failed"]
    },
    overallScore:{
        type:Number,
        default:0
    },
    avgTechnical:{
        type:Number,
        default:0
    },
    avgConfidence:{
        type:Number,
        default:0
    },
    questions:[questionSchema],
    startTime:{
        type:Date,
        default:Date.now()
    },
    endTime:{
        type:Date
    }
 


})


module.exports=mongoose.model("Session",sessionSchema)