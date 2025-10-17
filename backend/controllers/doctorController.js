import doctorModel from "../models/doctorModel.js";
import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";
import appointmentModel from "../models/appointmentModel.js";



/**
 * @desc Toggle doctor availability status
 * @route POST /api/admin/change-availability
 * @access Admin
 */
const changeAvailability = async (req, res) => {
  try {
    const { docId } = req.body;

    if (!docId) {
      return res.status(400).json({
        success: false,
        message: "Doctor ID is required",
      });
    }

    const doctor = await doctorModel.findById(docId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    doctor.available = !doctor.available;
    await doctor.save();

    res.status(200).json({
      success: true,
      message: `Doctor availability changed to ${
        doctor.available ? "Available" : "Unavailable"
      }`,
      doctor: { id: doctor._id, available: doctor.available },
    });
  } catch (error) {
    console.error("Error changing availability:", error);
    res.status(500).json({
      success: false,
      message: "Server error while changing availability",
    });
  }
};

/**
 * @desc Fetch all doctors (excluding sensitive info)
 * @route GET /api/admin/doctor-list
 * @access Admin
 */
const doctorList = async (req, res) => {
  try {
    const doctors = await doctorModel
      .find({}, "-password -email -__v")
      .sort({ createdAt: -1 });

    const formattedDoctors = doctors.map((doc) => {
      let imageUrl = doc.image;

      if (imageUrl && !imageUrl.startsWith("http")) {
        const backendBase = process.env.BACKEND_URL || "http://localhost:4000";
        imageUrl = `${backendBase}/${imageUrl.replace(/^\/+/, "")}`;
      }

      return {
        ...doc._doc,
        image: imageUrl,
        available: doc.available, // ✅ keep doctor’s own value
      };
    });

    res.status(200).json({
      success: true,
      count: formattedDoctors.length,
      doctors: formattedDoctors,
    });
  } catch (error) {
    console.error("Error fetching doctor list:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching doctors",
    });
  }
};

// API doctor login
const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate fields
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password are required" });

    const emailLower = email.toLowerCase();

    const doctor = await doctorModel.findOne({ email: emailLower });
    if (!doctor)
      return res.status(404).json({ success: false, message: "Doctor not found" });

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Invalid password" });

    const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ success: true, token });
    
  } catch (error) {
    console.error("LoginUser Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// API to get doctor appointments for doctor panel

const appointmentsDoctor = async (req, res) => {
  try {
    const docId = req.docId; // ✅ get from auth middleware
    const appointments = await appointmentModel.find({ docId });

    res.json({ success: true, appointments });
  } catch (error) {
    console.error("appointmentsDoctor error:", error);
    res.json({ success: false, message: error.message });
  }
};


// ✅ Toggle appointment completion for doctor panel
const toggleCompleteAppointment = async (req, res) => {
  try {
    const docId = req.docId;
    const { appointmentId, fromCancelled } = req.body;

    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    // ✅ Ensure this doctor owns the appointment
    if (appointment.docId.toString() !== docId) {
      return res.json({ success: false, message: "Unauthorized access" });
    }

    // ✅ Case 1: Coming from cancelled → completed
    if (fromCancelled) {
      appointment.cancelled = false;
      appointment.isCompleted = true;
    } else {
      // ✅ Case 2: Normal toggle (switch completed on/off)
      appointment.isCompleted = !appointment.isCompleted;
    }

    await appointment.save();

    res.json({
      success: true,
      message: appointment.isCompleted
        ? "Appointment marked as completed"
        : "Appointment marked as incomplete",
    });
  } catch (error) {
    console.error("toggleCompleteAppointment error:", error);
    res.json({ success: false, message: error.message });
  }
};



// ✅ API to cancel an appointment (Doctor Panel)
const appointmentCancel = async (req, res) => {
  try {
    const docId = req.docId; // ✅ Extracted from middleware
    const { appointmentId } = req.body;

    // 1️⃣ Validate input
    if (!appointmentId) {
      return res.json({ success: false, message: "Appointment ID is required" });
    }

    // 2️⃣ Fetch appointment (missing await before)
    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    // 3️⃣ Verify ownership — ensure the doctor owns this appointment
    if (appointmentData.docId.toString() !== docId.toString()) {
      return res.json({ success: false, message: "Unauthorized doctor access" });
    }

    // 4️⃣ Mark appointment as cancelled
    await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

    return res.json({ success: true, message: "Appointment cancelled successfully" });
  } catch (error) {
    console.error("appointmentCancel error:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to get dashboard data for doctor panel
// doctorController.js
const doctorDashboard = async (req, res) => {
  try {
    const docId = req.docId;
    const appointments = await appointmentModel.find({ docId });

    let earnings = 0;
    const dailyEarnings = {}; // { '2025-10-15': 200, '2025-10-14': 150 }

    appointments.forEach((item) => {
      if (item.isCompleted || item.payment) {
        earnings += item.amount;

        // Get date string (YYYY-MM-DD)
        const dateKey = new Date(item.slotDate).toISOString().split("T")[0];
        dailyEarnings[dateKey] = (dailyEarnings[dateKey] || 0) + item.amount;
      }
    });

    // Build a 7-day trend
    const today = new Date();
    const earningsTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateKey = date.toISOString().split("T")[0];
      earningsTrend.push({
        date: dateKey,
        earnings: dailyEarnings[dateKey] || 0,
      });
    }

    // Get unique patients
    const patients = [...new Set(appointments.map((a) => a.userId.toString()))];

    const dashData = {
      earnings,
      appointments: appointments.length,
      patients: patients.length,
      latestAppointments: appointments.reverse().slice(0, 5),
      earningsTrend, // ✅ added
    };

    res.json({ success: true, dashData });
  } catch (error) {
    console.error("Error Fetching Docdata:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// API to get doctor profile for doctor panel
// ✅ Get doctor profile
const doctorProfile = async (req, res) => {
  try {
    const docId = req.docId;

    // 🧠 Validate docId
    if (!docId) {
      return res.status(400).json({ success: false, message: "Doctor ID missing" });
    }

    // 🔍 Fetch doctor profile without password
    const profileData = await doctorModel.findById(docId).select("-password");

    if (!profileData) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    // ✅ Success
    res.status(200).json({ success: true, profileData });

  } catch (error) {
    console.error("Error Fetching Doctor Profile:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// API to update doctor profile data from doctor panel
const updateDoctorProfile = async (req, res) => {
  try {
    const docId = req.docId; // ✅ from auth middleware
    const { fees, address, available } = req.body;

    if (!docId) {
      return res
        .status(400)
        .json({ success: false, message: "Doctor ID missing" });
    }

    // ✅ Update doctor dynamically
    const updatedDoctor = await doctorModel.findByIdAndUpdate(
      docId,  // ✅ correct variable
      {
        ...(fees !== undefined && { fees }),
        ...(address && { address }),
        ...(available !== undefined && { available }),
        updatedAt: new Date(),
      },
      { new: true }
    );
    
    if (!updatedDoctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      doctor: updatedDoctor,
    });
  } catch (error) {
    console.error("Error updating doctor profile:", error);
    res.status(500).json({
      success: false,
      message: "Error updating doctor profile",
      error: error.message,
    });
  }
};

export { changeAvailability, doctorList,loginDoctor, appointmentsDoctor, toggleCompleteAppointment, appointmentCancel, doctorDashboard, doctorProfile, updateDoctorProfile };
