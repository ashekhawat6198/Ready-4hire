
// import modules
const express=require("express");
const app=express();
const http=require("http")
const dotenv=require("dotenv");
const cors=require("cors")
const Server=require("socket.io");
const cookieParser=require("cookie-parser");
const {connectDB}=require("./config/database")
const {notFound,errorHandler}=require("./middleware/errorMiddleware")
const userRoutes=require("./routes/userRoutes")

const PORT=process.env.PORT || 5000

// loading environment variables from .env file  
dotenv.config();



// connecting database to backend
connectDB();


// Middlerwares
app.use(express.json())    // allows backend to read JSON data from requests
app.use(cookieParser())    // allows backend to read cookies
app.use(
    cors({
        origin:"*",
        credentials:true,
    })
)

// Routes
app.use("/api/user",userRoutes);

app.use(notFound)
app.use(errorHandler)



// socket io
const server=http.createServer(app);    // Express alone can’t handle Socket.IO So we wrap Express inside an HTTP server

const allowOrigin=[
    'http://localhost:5174',
    'http://localhost:5173'
]

 const io=Server(server,{                                                  // initialize socket io
    cors:{
        origin:allowOrigin,
        methods:['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
        credentials:true,
        allowedHeaders:['Content-Type', 'Authorization']
    }
 })

 io.on("connection",(socket)=>{
    console.log(`A user connected ${socket.id}`)
    const userId=socket.handshake.query.userId;
    if(userId){
       
        socket.join(userId);
        console.log(`User ${socket.id} joined room: ${userId}`)
    }

    socket.on("disconnect",()=>{
       console.log(`User disconnected ${socket.id}`);
    })
    
 })



 // Testing the server
app.get("/", (req, res) => {
   return res.json({
    message:"Server is running"
   })
    })
   

 // listning the server
 app.listen(PORT,()=>{
    console.log(`App is listening at ${PORT}`)
 })