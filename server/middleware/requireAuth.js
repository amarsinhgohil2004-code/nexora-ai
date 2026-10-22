
import jwt from "jsonwebtoken";

const requireAuth = (req, res, next) => {
    const token = req.cookies?.nexora_token;

    if (!token) {
        return res.status(401).json({
            error: "Please log in to continue"
        });
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({
            error: "Invalid or expired session. Please log in again."
        });
    }
};

export default requireAuth;
