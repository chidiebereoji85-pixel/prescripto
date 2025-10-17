import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from 'cloudinary';
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import fs from "fs";
import path from "path";


const toSlotKey = (d) => {
  // accepts Date or ISO string
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date)) return null;
  return date.toISOString().split("T")[0]; // "YYYY-MM-DD"
};

// ✅ Register user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate fields
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: "Missing details" });

    // Validate email
    if (!validator.isEmail(email))
      return res.status(400).json({ success: false, message: "Enter a valid email" });

    const emailLower = email.toLowerCase();

    // Check existing
    const existingUser = await userModel.findOne({ email: emailLower });
    if (existingUser)
      return res.status(409).json({ success: false, message: "Email already in use." });

    // Validate password
    if (!validator.isStrongPassword(password))
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long and include uppercase, lowercase, numbers, and symbols.",
      });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new userModel({
      name,
      email: emailLower,
      password: hashedPassword,
    });

    await newUser.save();

    // Create token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      success: true,
      message: "User registered successfully.",
      token,
    });
  } catch (error) {
    console.error("RegisterUser Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate fields
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password are required" });

    const emailLower = email.toLowerCase();

    const user = await userModel.findOne({ email: emailLower });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Invalid email or password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ success: true, token });
  } catch (error) {
    console.error("LoginUser Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// API to get user profile data
const getProfile = async (req, res) => {
  try {
    const userData = await userModel.findById(req.userId).select("-password");

    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, userData });
  } catch (error) {
    console.error("GetProfile Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// API to update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.userId; // ✅ get from token, not body
    const { name, phone, address, dob, gender } = req.body;
    const imageFile = req.file;

    if (!name || !phone || !dob || !gender) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Parse address if sent as stringified JSON
    let parsedAddress = address;
    if (typeof address === "string") {
      try {
        parsedAddress = JSON.parse(address);
      } catch (err) {
        return res.status(400).json({ success: false, message: "Invalid address format" });
      }
    }

    // Update basic info
    const updateData = { name, phone, dob, gender, address: parsedAddress };

    if (imageFile) {
      // Upload image to Cloudinary
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
      updateData.image = imageUpload.secure_url;
    }

    await userModel.findByIdAndUpdate(userId, updateData);

    res.json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    console.error("UpdateProfile Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


/* =====================
   BOOK APPOINTMENT
   ===================== */
   const bookAppointment = async (req, res) => {
    try {
      const userId = req.userId;
      const { docId, slotDate, slotTime } = req.body;
  
      // parse date
      const parsedSlotDate = new Date(slotDate);
      if (isNaN(parsedSlotDate)) {
        return res.status(400).json({ success: false, message: "Invalid slotDate" });
      }
  
      const slotKey = toSlotKey(parsedSlotDate);
      if (!slotKey) return res.status(400).json({ success: false, message: "Invalid slotDate" });
  
      // find doctor
      const doctor = await doctorModel.findById(docId).select("-password");
      if (!doctor || !doctor.available) {
        return res.json({ success: false, message: "Doctor not available" });
      }
  
      // check slots_booked for this date (use slotKey)
      const slots_booked = doctor.slots_booked || {};
      if (Array.isArray(slots_booked[slotKey]) && slots_booked[slotKey].includes(slotTime)) {
        return res.json({ success: false, message: "Slot not available" });
      }
  
      // check existing appointment records (using Date)
      const existing = await appointmentModel.findOne({
        docId,
        slotDate: parsedSlotDate,
        slotTime,
        cancelled: false,
      });
      if (existing) {
        return res.json({ success: false, message: "Slot already booked" });
      }
  
      // push time into doctor's slots_booked
      const newSlots = { ...(doctor.slots_booked || {}) };
      if (!newSlots[slotKey]) newSlots[slotKey] = [];
      newSlots[slotKey].push(slotTime);
  
      // update doctor and create appointment
      await doctorModel.findByIdAndUpdate(docId, { slots_booked: newSlots });
  
      const userData = await userModel.findById(userId).select("-password");
  
      const newAppointment = new appointmentModel({
        userId,
        docId,
        slotDate: parsedSlotDate,
        slotTime,
        userData,
        amount: doctor.fees,
        date: Date.now(),
      });
  
      await newAppointment.save();
  
      res.json({ success: true, message: "Appointment booked successfully" });
    } catch (error) {
      console.error("❌ bookAppointment Error:", error);
      if (error.code === 11000) {
        return res.status(400).json({ success: false, message: "Duplicate booking" });
      }
      res.status(500).json({ success: false, message: "Server error" });
    }
  };
  
const checkAppointment = async (req, res) => {
  try {
    const userId = req.userId; // comes from auth middleware
    const { docId, slotDate, slotTime } = req.body;

    // ✅ Find if the same appointment already exists
    const existing = await appointmentModel.findOne({
      userId,
      docId,
      slotDate,
      slotTime,
      cancelled: false,
    });

    if (existing) {
      return res.json({ exists: true });
    }

    return res.json({ exists: false });
  } catch (error) {
    console.error("Error checking appointment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// API to get user appoinments for front-end my-appointments page
const listAppointment = async (req, res) => {
  try {
    const userId = req.userId;

    // ✅ Fetch all appointments belonging to the logged-in user
    const appointments = await appointmentModel
      .find({ userId: req.userId })
      .populate("docId", "name speciality image address fees updatedAt") // Fields we want from the doctor 
      .sort({ createdAt: -1 }); // latest first

    // Optional: if no appointments found
    if (!appointments || appointments.length === 0) {
      return res.json({
        success: true,
        appointments: [],
        message: "No appointments found",
      });
    }

    res.json({ success: true, appointments });
  } catch (error) {
    console.error("❌ listAppointment Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Internal server error", error });
  }
};

/* =====================
   CANCEL APPOINTMENT
   (mark cancelled, free time)
   ===================== */
   const cancelAppointment = async (req, res) => {
    try {
      const { appointmentId } = req.body;
  
      const appointment = await appointmentModel.findById(appointmentId);
      if (!appointment) return res.json({ success: false, message: "Appointment not found" });
  
      if (appointment.cancelled) {
        return res.json({ success: false, message: "Appointment already cancelled" });
      }
  
      const doctor = await doctorModel.findById(appointment.docId);
      if (!doctor) return res.json({ success: false, message: "Doctor not found" });
  
      // compute slotKey from appointment.slotDate
      const slotKey = toSlotKey(appointment.slotDate);
      if (slotKey && doctor.slots_booked?.[slotKey]) {
        doctor.slots_booked[slotKey] = doctor.slots_booked[slotKey].filter(t => t !== appointment.slotTime);
        // remove date key if empty
        if (doctor.slots_booked[slotKey].length === 0) {
          delete doctor.slots_booked[slotKey];
        }
      }
  
      appointment.cancelled = true;
  
      await Promise.all([doctor.save(), appointment.save()]);
  
      return res.json({ success: true, message: "Appointment canceled and slot released." });
    } catch (error) {
      console.error("❌ Cancel Appointment Error:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  };
  
//* =====================
//RESCHEDULE APPOINTMENT
//free old slot, reserve new slot

const rescheduleAppointment = async (req, res) => {
  try {
    const userId = req.userId;
    const { appointmentId, newDate, newTime } = req.body;

    const appt = await appointmentModel.findById(appointmentId);
    if (!appt) return res.json({ success: false, message: "Appointment not found" });

    if (appt.userId.toString() !== userId) {
      return res.json({ success: false, message: "Unauthorized user" });
    }

    const doctor = await doctorModel.findById(appt.docId);
    if (!doctor) return res.json({ success: false, message: "Doctor not found" });

    // convert new date
    const parsedNewDate = new Date(newDate);
    if (isNaN(parsedNewDate))
      return res.json({ success: false, message: "Invalid newDate" });

    // 🧭 Prevent rescheduling to past dates
const today = new Date().setHours(0, 0, 0, 0);
if (parsedNewDate < today) {
  return res.json({
    success: false,
    message: "Cannot reschedule to a past date",
  });
}

    const oldSlotKey = toSlotKey(appt.slotDate);
    const newSlotKey = toSlotKey(parsedNewDate);

    // free old slot
    if (oldSlotKey && doctor.slots_booked?.[oldSlotKey]) {
      doctor.slots_booked[oldSlotKey] = doctor.slots_booked[oldSlotKey].filter(
        (t) => t !== appt.slotTime
      );
      if (doctor.slots_booked[oldSlotKey].length === 0)
        delete doctor.slots_booked[oldSlotKey];
    }

    // ensure new slot not taken
    if (!doctor.slots_booked[newSlotKey]) doctor.slots_booked[newSlotKey] = [];
    if (doctor.slots_booked[newSlotKey].includes(newTime)) {
      return res.json({
        success: false,
        message: "Selected slot already booked. Choose another.",
      });
    }

    // push new time and update appointment
    doctor.slots_booked[newSlotKey].push(newTime);

    appt.slotDate = parsedNewDate;
    appt.slotTime = newTime;

    // ✅ Reactivate canceled appointments
    if (appt.cancelled) {
      appt.cancelled = false;
    }

    await Promise.all([doctor.save(), appt.save()]);

    return res.json({
      success: true,
      message: "Appointment rescheduled successfully",
      appointment: appt,
    });
  } catch (error) {
    console.error("❌ Reschedule Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const handleStripePayment = async (appointment) => {
  try {
    const res = await axios.post(`${backendUrl}/api/stripe/create-checkout-session`, {
      appointmentId: appointment._id,
    });
    if (res.data.success) {
      window.location.href = res.data.url; // redirect to Stripe
    } else {
      toast.error("Unable to start payment.");
    }
  } catch (error) {
    console.error("Stripe error:", error);
    toast.error("Error creating payment session");
  }
};

const updateDoctorImage = async (req, res) => {
  try {
    const { docId } = req.body;
    if (!docId) {
      return res.status(400).json({ success: false, message: "Doctor ID is required" });
    }

    const doctor = await doctorModel.findById(docId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image file uploaded" });
    }

    // Optional: delete previous image from server if needed
    if (doctor.image && doctor.image !== "/default-avatar.png") {
      const prevImagePath = path.join(process.cwd(), "uploads", doctor.image);
      if (fs.existsSync(prevImagePath)) fs.unlinkSync(prevImagePath);
    }

    // Update image
    doctor.image = `/uploads/${req.file.filename}`;
    await doctor.save(); // ✅ ensures updatedAt changes

    res.status(200).json({
      success: true,
      message: "Doctor image updated successfully",
      doctor: {
        _id: doctor._id,
        image: doctor.image,
        updatedAt: doctor.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating doctor image:", error);
    res.status(500).json({ success: false, message: "Server error while updating image" });
  }
};





export { registerUser, loginUser, getProfile, updateProfile, bookAppointment, checkAppointment, listAppointment, cancelAppointment, rescheduleAppointment, handleStripePayment, updateDoctorImage};
