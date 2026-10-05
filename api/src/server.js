import { connectDb }  from "./services/db.connection.js";
import express from "express";
import dotenv from "dotenv";
import authRoute from "./routes/auth.route.js";
import cors from "cors"

dotenv.config();


const app = express();

app.use(express.json());
app.use(cors({
    origin:"http://localhost:3000",
    credentials:true
}))



app.get("/",(req,res)=>{
    res.send("running")
})

await connectDb();


app.use('/api/auth',authRoute)

app.listen(2000,()=>{
    console.log("runnning")
})