import React, { useContext, useEffect } from "react";
import axios from "axios";
import { AdminContext } from "../../context/AdminContext";
import { assets } from "../../assets/assets";
import { toast } from "react-toastify";

const Dashboard = () => {
  const { getDashData, aToken, dashData } = useContext(AdminContext);

  // ✅ Cancel Appointment
  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?"))
      return;

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/cancel-appointment/${appointmentId}`,
        {},
        {
          headers: { Authorization: `Bearer ${aToken}` },
        }
      );

      if (res.data.success) {
        toast.success("Appointment cancelled successfully");
        getDashData(); // 🔄 Refresh dashboard data
      } else {
        toast.error("Failed to cancel appointment");
      }
    } catch (error) {
      console.error("Cancel error:", error);
      toast.error("Error cancelling appointment");
    }
  };

  // ✅ Fetch dashboard on login
  useEffect(() => {
    if (aToken) {
      getDashData();
    }
  }, [aToken]);

  // ✅ Auto-refresh when doctor updates their profile
  useEffect(() => {
    const handleDoctorListUpdate = () => {
      console.log("🔄 Doctor profile updated — refreshing admin dashboard...");
      getDashData();
      toast.info("Doctor data updated", { autoClose: 1500 });
    };

    window.addEventListener("doctorListUpdated", handleDoctorListUpdate);
    return () => {
      window.removeEventListener("doctorListUpdated", handleDoctorListUpdate);
    };
  }, [getDashData]);

  // ✅ Normalize image URL (ensures full path even if backend sends relative)
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return "/default-doctor.png";
    if (imagePath.startsWith("http")) return imagePath;
    return `${import.meta.env.VITE_BACKEND_URL}${imagePath}`;
  };

  return (
    dashData && (
      <div className="max-w-5xl mx-auto p-5">
        {/* ===== Top Stats ===== */}
        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
          {[
            { label: "Doctors", value: dashData.doctors, icon: assets.doctor_icon },
            {
              label: "Appointments",
              value: dashData.appointments,
              icon: assets.appointments_icon,
            },
            { label: "Patients", value: dashData.patients, icon: assets.patients_icon },
          ].map((stat, i) => (
            <div
              key={i}
              className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all"
            >
              <img src={stat.icon} alt="" />
              <div>
                <p className="text-xl font-semibold text-gray-600">{stat.value}</p>
                <p className="text-gray-400">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ===== Latest Bookings ===== */}
        <div className="bg-white mt-10 rounded-lg shadow-sm">
          <div className="flex items-center gap-2.5 px-4 py-4 border-b">
            <img src={assets.list_icon} alt="" />
            <p className="font-semibold text-gray-700">Latest Bookings</p>
          </div>

          <div className="pt-4">
            {dashData.latestAppointments.length === 0 ? (
              <p className="text-center text-gray-500 py-5">
                No recent appointments
              </p>
            ) : (
              dashData.latestAppointments.map((item, index) => (
                <div
                  className="flex items-center px-6 py-3 gap-3 hover:bg-gray-50 transition"
                  key={index}
                >
                  <img
                    className="rounded-full w-10 h-10 border object-cover"
                    src={getFullImageUrl(item.docId?.image)}
                    alt={item.docId?.name || "Doctor"}
                  />
                  <div className="flex-1 text-sm">
                    <p className="text-gray-800 font-medium">
                      Dr. {item.docId?.name || "Unknown"}
                    </p>
                    <p>
                      {new Date(item.slotDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      <span className="text-gray-500">| {item.slotTime}</span>
                    </p>
                  </div>

                  {item.cancelled ? (
                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-medium">
                      Cancelled
                    </span>
                  ) : (
                    <button
                      onClick={() => handleCancelAppointment(item._id)}
                      className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium hover:bg-yellow-200 transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    )
  );
};

export default Dashboard;
