import jwt from 'jsonwebtoken';

// Admin authentication middleware
const authAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "Not Authorized. Login Again." });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check for admin role or specific admin email
        if (!decoded || decoded.email !== process.env.ADMIN_EMAIL || decoded.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Forbidden: Admins only." });
        }

        req.user = decoded; // optionally attach user to request
        next();

    } catch (error) {
        console.error("Admin Auth Error:", error.message);
        res.status(401).json({ success: false, message: "Invalid or expired token." });
    }
};

export default authAdmin;
