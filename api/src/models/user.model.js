import mongoose, { Schema } from "mongoose";


const userSchema = new Schema({
    username: String,
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    authId: String,
    password: String,
    avatar: {
        type: String,
        default: ""
    },
}, {
    timestamps: true
})

export const User = mongoose.model('User', userSchema);