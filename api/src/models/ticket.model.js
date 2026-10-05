import mongoose, { Schema } from "mongoose";


const tenatSchema = new Schema({
    subject:String,
    userId:{
        type:Schema.Types.ObjectId,
        ref:Users
    }
},{timestamps:true})  

export const Tenat=mongoose.model('Tenat',tenatSchema);