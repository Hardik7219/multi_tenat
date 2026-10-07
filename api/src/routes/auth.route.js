import express from "express";
import { createUser, loginUser } from "../controllers/auth.controller.js";


const route = express.Router();

route.post("/signup",createUser);
route.post("/login",loginUser);


export default route;