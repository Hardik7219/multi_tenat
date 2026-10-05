import { User } from "../models/user.model";


export const createUser= async (req,res)=>{
    try {
        const {authId,email,username}= req.user;
        const isExist=await User.findOne({authId});

        if(isExist){
            return res.status(200).json({user:isExist});
        }
        const user=await User.create({
            username,email,authId
        })
        return res.status(200).json({user});
    } catch (error) {
        console.error(error);
        return res.status(500).json({message:"failt to create user"})
    }
}