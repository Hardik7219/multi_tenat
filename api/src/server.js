import { connectDb }  from "./services/db.connection.js";
import express from "express";
import dotenv from "dotenv";


const app = express();
dotenv.config();

app.get("/",(req,res)=>{
    res.send("running")
})

await connectDb();

app.listen(2000,()=>{

    console.log("runnning")
})