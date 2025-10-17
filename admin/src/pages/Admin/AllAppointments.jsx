import { useContext, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const AllAppointments = () => {
  const { aToken, appointments, getAllAppointments } = useContext(AdminContext);
  const { calculateAge, currency } = useContext(AppContext);

  // ✅ Normalize image URL (to ensure full backend path)
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return "/default-avatar.png";
    if (imagePath.startsWith("http")) return imagePath;
    return `${import.meta.env.VITE_BACKEND_URL}${imagePath}`;
  };

  // ✅ Load appointments initially
  useEffect(() => {
    if (aToken) getAllAppointments();
  }, [aToken]);

  // ✅ Listen for doctor updates (image, fee, etc.)
  useEffect(() => {
    const handleDoctorListUpdate = () => {
      console.log("🔄 Doctor profile updated — refreshing appointments...");
      getAllAppointments();
      toast.info("Doctor data updated", { autoClose: 1500 });
    };

    window.addEventListener("doctorListUpdated", handleDoctorListUpdate);
    return () => {
      window.removeEventListener("doctorListUpdated", handleDoctorListUpdate);
    };
  }, [getAllAppointments]);

  // ✅ Cancel appointment handler
  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;

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
        getAllAppointments(); // Refresh list
      } else {
        toast.error("Failed to cancel appointment");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error cancelling appointment");
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-5">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">All Appointments</h2>

      <div className="bg-white shadow-md rounded-2xl overflow-hidden border border-gray-100">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-[0.3fr_2fr_1fr_2fr_2fr_1fr_1fr] bg-gray-50 py-3 px-6 text-sm font-medium text-gray-600 border-b">
          <p>#</p>
          <p>Patient</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Doctor</p>
          <p>Fees</p>
          <p>Action</p>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-100 max-h-[80vh] overflow-y-auto">
          {appointments.length === 0 ? (
            <p className="text-center text-gray-500 py-10">No appointments found</p>
          ) : (
            appointments.map((item, index) => (
              <div
                key={item._id}
                className="grid grid-cols-1 md:grid-cols-[0.3fr_2fr_1fr_2fr_2fr_1fr_1fr] items-center text-sm text-gray-700 px-6 py-4 hover:bg-gray-50 transition gap-2 md:gap-0"
              >
                {/* Index */}
                <p className="hidden md:block">{index + 1}</p>

                {/* Patient Info */}
                <div className="flex items-center gap-3">
                  <img
                    src={getFullImageUrl(item.userData?.image)}
                    alt={item.userData?.name || "User"}
                    className="w-10 h-10 rounded-full object-cover border"
                  />
                  <p className="font-medium text-gray-800">
                    {item.userData?.name || "Unknown"}
                  </p>
                </div>

                {/* Age */}
                <p className="max-sm:hidden">{calculateAge(item.userData?.dob)}</p>

                {/* Date & Time */}
                <p>
                  {new Date(item.slotDate).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  <span className="text-gray-500">| {item.slotTime}</span>
                </p>

                {/* Doctor */}
                <div className="flex items-center gap-2">
                  <img
                    src={getFullImageUrl(item.docId?.image)}
                    alt={item.docId?.name || "Doctor"}
                    className="w-10 h-10 rounded-full object-cover border"
                  />
                  <p className="font-medium text-gray-800">
                    Dr. {item.docId?.name || "—"}
                  </p>
                </div>

                {/* Fees */}
                <p className="font-medium text-gray-900">
                  {currency}
                  {item.amount}
                </p>

                {/* Action / Status */}
                {item.payment ? (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium text-center">
                    Paid
                  </span>
                ) : item.cancelled ? (
                  <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-medium text-center">
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
  );
};

export default AllAppointments;
