import mongoose, { Schema } from "mongoose";


const userSchema = new Schema({
    username:String,
    email:String,
    authId:String,
    avatar:{
        type:String,
        default:""
    },
    role:{
        type:String,
        enum:['admin','customer'],
        default:'customer'
    },
    tenateId:{
        type: Schema.Types.ObjectId,
        ref:"Tenats"
    }
},{
    timestamps:true
})  

export const User=mongoose.model('User',userSchema);