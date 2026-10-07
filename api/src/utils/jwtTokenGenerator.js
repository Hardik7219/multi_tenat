import jwt from "jsonwebtoken";

export function generateAccessToken(user) {
    return jwt.sign(
        {
            id: user._id.toString(),
            tenantId: user.tenantId?.toString() || null,
            role: user.role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d",
        }
    );
}