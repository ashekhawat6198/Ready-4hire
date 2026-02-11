const jwt=require("jsonwebtoken");
require("dotenv").config();

exports.auth=async(req,res,next)=>{
    try{

        const token=req.cookies.token || req.body.token || req.header("Authorization").replace("Bearer ","");
        if(!token){
            return res.json({
                success:false,
                message:"Token is Missing"
            })
        }

        try{
            const decode=jwt.decode(token,process.env.JWT_SECRET);
            req.user=decode
        }catch(err){
            return res.json({
                success:false,
                message:"Token is invalid"
            })
        }
        next();
    }catch(err){
         return res.status(401).json({
            success:false,
            message:`Ha ji ${err.message}`
         })
    }
}

