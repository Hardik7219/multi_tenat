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
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
}))



app.get("/",(req,res)=>{
    res.send("running")
})

await connectDb();


app.use('/api/auth',authRoute)
app.use("/api/tickets", ticketRoutes);
app.use("/api/tenants", tenateRoutes);

app.listen(process.env.PORT,()=>{
    console.log("runnning")
})