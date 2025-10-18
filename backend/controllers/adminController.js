import validator from 'validator';
import bcrypt from 'bcrypt';
import {v2 as cloudinary} from 'cloudinary'
import doctorModel from '../models/doctorModel.js';
import jwt from 'jsonwebtoken';
import fs from 'fs/promises';
import appointmentModel from '../models/appointmentModel.js';
import userModel from '../models/userModel.js';


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

        // if (!name.includes('-')) {
        //     return res.status(400).json({
        //       success: false,
        //       message: "Doctor name must include a unique identifier (e.g. 'Dr-001. John Doe')."
        //     });
        //   }

        // if (!password.includes('-')) {
        //     return res.status(400).json({
        //       success: false,
        //       message: "Password must include a unique identifier (e.g. doctor ID or '-' symbol)."
        //     });
        //   }
          
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

    // ✅ Validate against demo admin credentials in environment variables
    if (
      email === process.env.DEMO_ADMIN_EMAIL &&
      password === process.env.DEMO_ADMIN_PASSWORD
    ) {
      // Generate JWT token for the demo admin
      const token = jwt.sign(
        {
          email,
          role: "admin",
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d", // Token expires in 7 days
        }
      );

      return res.json({
        success: true,
        token,
        message: "Demo admin login successful",
      });
    }

    // If credentials don't match, return unauthorized
    res
      .status(401)
      .json({ success: false, message: "Invalid email or password" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export default loginAdmin;

// API to get all doctors list for admin panel
const allDoctors = async (req, res) => {
    try {
        
        const doctors = await doctorModel.find({}).select('-password')
        res.json({success: true, doctors})
    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message})
    }
};

// API to get all appointments list
const appointmentsAdmin = async (req, res) => {
    try {
      const appointments = await appointmentModel
        .find({})
        .populate("docId", "name specialty image fees") // doctor details
        .populate("userId", "name email image age") // patient details
        .sort({ createdAt: -1})    
        
      res.json({ success: true, appointments });
    } catch (error) {
      console.error("Error fetching admin appointments:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  };

   const cancelAppointment = async (req, res) => {
    try {
      const { id } = req.params;
  
      const appointment = await appointmentModel.findById(id);
      if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });
  
      if (appointment.cancelled) return res.status(400).json({ success: false, message: "Already cancelled" });
  
      appointment.cancelled = true;
      await appointment.save();
  
      res.json({ success: true, message: "Appointment cancelled successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
  
  // API to get dashboard data for Admin
  const adminDashboard = async (req, res) => {

    try {
        
        const doctors = await doctorModel.find({});
        const users = await userModel.find({});
        const appointments = await appointmentModel
        .find({})
        .populate("docId", "name specialty image fees") // doctor details
        .populate("userId", "name email image age");    // patient details


        const dashData = {
            doctors: doctors.length,
            appointments: appointments.length,
            patients: users.length,
            latestAppointments: appointments.reverse().slice(0, 5)
        }

        res.json({success: true, dashData});
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
  }

  export {addDoctor, loginAdmin, allDoctors, appointmentsAdmin, cancelAppointment, adminDashboard}