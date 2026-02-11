const asyncHandeler=require("express-async-handler");
const User=require("../models/User");
const {OAuth2Client}=require("google-auth-library");
const jwt=require("jsonwebtoken");
const path=require("path")
const client=new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken=(id)=>{
    return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn:"1d"
    })
}


 exports.registerUser=asyncHandeler(async(req,res)=>{
    const {name,email,password}=req.body;
    if(!name || !email || !password){
        return res.status(403).json({
            success:false,
            message:"All fields are required"
        })
    }

    const userExists=await User.findOne({email});
    if(userExists){
        return res.status(400).json({
            success:false,
            message:"User already exists" 
        })
    }

    const user=await User.create({
        name,
        email,
        password
    })

    if(user){
        return res.status(201).json({
            _id:user._id,
            name:user.name,
            email:user.email,
            token:generateToken(user._id)
        })
    }else{
        return res.status(400).json({
            success:false,
            message:"User cannot be registered"
        })
     
    }
 })

 exports.loginUser=async(req,res)=>{
    try{
          const {email,password}=req.body;
          if(!email || !password){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            })
          }

          const user=await User.findOne({email});
          if(user && (await user.matchPassword(password))){
              return res.json({
                 _id:user._id,
                 name:user.name,
                 email:user.email,
                 preferredRole:user.preferredRole,
                 token:generateToken(user._id)
              })
          }
          else{
                return res.status(400).json({
                    success:false,
                    message:"User is not registered"
                })
          }
    }catch(err){
       return res.status(401).json({
        success:false,
        message:"Login Failed",
        error:err.message
       })
    }
 }


 exports.googleLogin=asyncHandeler(async(req,res)=>{
    const {tokenId}=req.body;
    const ticket=await client.verifyIdToken({
        idToken:tokenId,
        audience:process.env.GOOGLE_CLIENT_ID
    })    

    const {email_verified,name,email,sub:googleId}=ticket.getPayload();
     if(!email_verified){
        return res.status(400).json({
            success:false,
            message:"Google login failed"
        })
     }

     let user=await User.findOne({email});
     if(user){
        if(!user.googleId){
            user.googleId=googleId;
            await user.save();
             
        }
     }else{
         user=await User.create({
            name,
            email,
            googleId,
            password:null
        })
     }

     
        return res.status(201).json({
            _id:user._id,
            name:user.name,
            email:user.email,
            preferredRole:user.preferredRole,
            token:generateToken(user._id),
        })
        
 })




exports.updateUserProfile=asyncHandeler(async(req,res)=>{
    if(req.user){
        const user=await User.findById(req.user._id);
        user.name=req.body.name || user.name;
        user.email=req.body.email || user.email;
        user.preferredRole=req.body.preferredRole || user.preferredRole
        if(req.body.password){
            user.password=req.body.password;

        }
        await user.save();
        return res.status(200).json({
            _id:user._id,
            name:user.name,
            email:user.email,
            preferredRole:user.preferredRole,
            token:generateToken(user._id)
        })
    }
})


