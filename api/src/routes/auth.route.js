import express from "express";
import { createUser } from "../controllers/auth.controller.js";


const route = express.Router();

route.post("/signup",createUser);


export default route;