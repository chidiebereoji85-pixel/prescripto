import jwt from "jsonwebtoken";

const authDoctor = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Not Authorized. Login Again." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.docId = decoded.id; // ✅ attach docId ID from token

    next();
  } catch (error) {
    console.error("Doctor Auth Error:", error.message);
    res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
};

export default authDoctor;
