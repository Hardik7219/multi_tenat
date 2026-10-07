import mongoose, { Schema } from "mongoose";


const userSchema = new Schema({
    username: String,
    email: String,
    authId: String,
    password: String,
    avatar: {
        type: String,
        default: ""
    },
    role: {
        type: String,
        enum: ['organazation', 'customer'],
        default: 'customer'
    },
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tenancy",
        required: false,
        index: true,
    },
}, {
    timestamps: true
})

export const User = mongoose.model('User', userSchema);