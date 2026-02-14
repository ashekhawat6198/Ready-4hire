const express=require("express");
const router=express.Router();
const{createSession,deleteSession,endSession,getSessionById,getSession,submitAnswer}=require("../controllers/sessionController");
const {auth}=require("../middleware/authMiddleware");
const {uploadSingleAudio}=require("../middleware/uploadMiddleware");

// Apply auth protection to ALL routes in this file automatically
router.use(auth);

// 1. Root Routes("/")
router.route("/")
      .get(getSession)
      .post(createSession);

// 2. ID Routes ("/id")

router.route('/:id')
      .get(getSessionById)
      .delete(deleteSession);

// 3. Action Routes
router.route("/:id/submit-answer").post(uploadSingleAudio,submitAnswer)
router.route("/:id/end").post(endSession);


module.exports=router


