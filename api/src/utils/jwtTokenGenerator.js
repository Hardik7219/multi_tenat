import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "development-secret";

export function generateAccessToken(user) {
    if (!user?._id) {
        throw new Error("User ID is missing");
    }

    return jwt.sign(
        {
            id: user._id.toString(),
            tenantId: user.tenantId ? user.tenantId.toString() : null,
            role: user.role,
        },
        JWT_SECRET,
        {
            expiresIn: "1d",
        }
    );
}