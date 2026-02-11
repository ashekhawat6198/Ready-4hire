const express=require("express");
const router=express.Router();


const {registerUser,loginUser,googleLogin,updateUserProfile}=require("../controllers/userController");
const {auth}=require("../middleware/authMiddleware");


router.post("/register",registerUser);
router.post("/login",loginUser);
router.post("/google",googleLogin);
router.put("/updateProfile",auth,updateUserProfile)

module.exports=router