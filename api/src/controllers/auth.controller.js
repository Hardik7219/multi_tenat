import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import { generateAccessToken } from "../utils/jwtTokenGenerator.js";

export const createUser = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        if (!email || !username || !password) return res.status(400).json({ message: "fill all the fields" })
        const isExist = await User.findOne({ email });
        if (isExist) {
            return res.status(409).json({ message: "user already exist" });
        }
        const hashPass = await bcrypt.hash(password, 12)
        const user = await User.create({
            username, email, password: hashPass
        })
        return res.status(200).json({ user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "failt to create user" })
    }
}


export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) return res.status(400).json({ message: "fill all the fields" })

        const user = await User.findOne({ email })

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }
        const passwordMatch = await bcrypt.compare(password, user.password)

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }
        const accessToken = generateAccessToken(user);

        return res.status(200).json({
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId?.toString() || null,
            accessToken,
        });

    } catch (error) {
        console.error("LOGIN ERROR:", error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
}

export async function deleteUser() {

}


export async function fetchProfile() {

}