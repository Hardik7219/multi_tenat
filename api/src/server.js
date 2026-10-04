const express = require("express");

const app=express();



app.get("/",(req,res)=>{
    res.send("running")
})
app.listen(2000,()=>{
    console.log("runnning")
})