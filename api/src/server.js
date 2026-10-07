import { connectDb }  from "./utils/db.connection.js";
import express from "express";
import dotenv from "dotenv";
import authRoute from "./routes/auth.route.js";
import ticketRoutes from "./routes/ticket.route.js";
import tenateRoutes from "./routes/tenancy.route.js"
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
app.use("/api/tickets", ticketRoutes);
app.use("/api/tenats", tenateRoutes);

app.listen(2000,()=>{
    console.log("runnning")
})