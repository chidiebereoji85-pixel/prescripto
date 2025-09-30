import validator from 'validator';
import bcrypt from 'bcrypt';
import {v2 as cloudinary} from 'cloudinary'
import doctorModel from '../models/doctorModel.js';
import jwt from 'jsonwebtoken';
import fs from 'fs/promises';


// API for adding doctor
const addDoctor = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            speciality,
            degree,
            experience,
            about,
            fees,
            address
        } = req.body;

        const imageFile = req.file;

        // 1. Basic validation
        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
            return res.status(400).json({ success: false, message: "Missing required fields." });
        }

        // 2. Email format
        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Invalid email format." });
        }

        // 3. Check if email already exists
        const existingDoctor = await doctorModel.findOne({ email });
        if (existingDoctor) {
            return res.status(409).json({ success: false, message: "Email already in use." });
        }

        // 4. Strong password
        if (!validator.isStrongPassword(password)) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters and include uppercase, lowercase, numbers, and symbols."
            });
        }

        // 5. Handle image upload
        if (!imageFile) {
            return res.status(400).json({ success: false, message: "Doctor image is required." });
        }

        let imageUrl;
        try {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
                resource_type: "image"
            });
            imageUrl = imageUpload.secure_url;
            // Delete local file to save disk space
            await fs.unlink(imageFile.path);
        } catch (uploadErr) {
            console.error("Cloudinary upload failed:", uploadErr);
            return res.status(500).json({ success: false, message: "Image upload failed." });
        }

        // 6. Password hashing
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 7. Parse address safely
        let parsedAddress;
        try {
            parsedAddress = JSON.parse(address);
        } catch (err) {
            return res.status(400).json({ success: false, message: "Invalid address format. Must be JSON." });
        }

        // 8. Save doctor
        const newDoctor = new doctorModel({
            name,
            email,
            image: imageUrl,
            password: hashedPassword,
            speciality,
            degree,
            experience,
            about,
            fees,
            address: parsedAddress,
            date: Date.now()
        });

        await newDoctor.save();

        res.status(201).json({ success: true, message: "Doctor added successfully." });

    } catch (error) {
        console.error("Add Doctor Error:", error);
        res.status(500).json({ success: false, message: "Server error. Please try again later." });
    }
};
// API for admin login
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate against env credentials
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(
                {
                    email,
                    role: 'admin',
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: '1h', // Set token expiry
                }
            );

            return res.json({ success: true, token });
        }

        res.status(401).json({ success: false, message: "Invalid email or password" });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export {addDoctor, loginAdmin}