import express from "express";
import {
  appointmentCancel,
  appointmentsDoctor,
  doctorDashboard,
  doctorList,
  doctorProfile,
  loginDoctor,
  toggleCompleteAppointment,
  updateDoctorProfile,
} from "../controllers/doctorController.js";
import authDoctor from "../middlewares/authDoctor.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const doctorRouter = express.Router();

// ✅ Configure Multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), "uploads");

    // ✅ Ensure folder exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

/* ───────────────  PUBLIC ROUTES  ─────────────── */

// ✅ Get all doctors (for homepage & browse)
doctorRouter.get("/list", doctorList);

// ✅ Doctor login
doctorRouter.post("/login", loginDoctor);

/* ───────────────  PROTECTED ROUTES  ─────────────── */

// ✅ Get all appointments for logged-in doctor
doctorRouter.get("/appointments", authDoctor, appointmentsDoctor);

// ✅ Toggle appointment complete/incomplete
doctorRouter.put("/toggle-complete", authDoctor, toggleCompleteAppointment);

// ✅ Cancel appointment
doctorRouter.put("/cancel-appointment", authDoctor, appointmentCancel);

// ✅ Doctor dashboard overview
doctorRouter.get("/dashboard", authDoctor, doctorDashboard);

// ✅ Fetch doctor profile
doctorRouter.get("/profile", authDoctor, doctorProfile);

// ✅ Update doctor profile (fees, address, available, image upload)
doctorRouter.put( "/update-profile", authDoctor, updateDoctorProfile);

export default doctorRouter;
