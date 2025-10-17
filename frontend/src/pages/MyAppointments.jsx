import React, { useContext, useEffect, useState, useCallback } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const MyAppointments = () => {
  const { backendUrl, token } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showReschedule, setShowReschedule] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [processingId, setProcessingId] = useState(null);

  // ✅ Fetch doctors directly from backend (latest)
  const fetchDoctors = useCallback(async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/list`);
      if (data.success) return data.doctors;
      throw new Error(data.message || "Failed to fetch doctors");
    } catch (err) {
      console.error("Error fetching doctors:", err);
      toast.error(err.message || "Error fetching doctors");
      return [];
    }
  }, [backendUrl]);

  // ✅ Fetch user appointments and merge live doctor info
  const getUserAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: apptData } = await axios.get(`${backendUrl}/api/user/appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!apptData.success) throw new Error("Failed to fetch appointments");

      const latestDoctors = await fetchDoctors();

      const mergedAppointments = apptData.appointments.map((appt) => {
        const latestDoc = latestDoctors.find((d) => d._id === appt.docId?._id);
        return { ...appt, docId: latestDoc || appt.docId || {} };
      });

      setAppointments(mergedAppointments);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Cancel appointment
  const cancelAppointment = async (appointmentId) => {
    try {
      setProcessingId(appointmentId);
      const { data } = await axios.post(
        `${backendUrl}/api/user/cancel-appointment`,
        { appointmentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success("Appointment canceled successfully");
        setAppointments((prev) =>
          prev.map((appt) =>
            appt._id === appointmentId ? { ...appt, cancelled: true } : appt
          )
        );
      } else toast.error(data.message);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  // ✅ Reschedule appointment (even if canceled)
  const rescheduleAppointment = async (appointmentId) => {
    if (!newDate || !newTime) {
      toast.error("Please select both date and time");
      return;
    }

    try {
      setProcessingId(appointmentId);
      const { data } = await axios.post(
        `${backendUrl}/api/user/reschedule-appointment`,
        { appointmentId, newDate, newTime },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success("Appointment rescheduled successfully");
        setAppointments((prev) =>
          prev.map((appt) =>
            appt._id === appointmentId
              ? { ...appt, slotDate: newDate, slotTime: newTime, cancelled: false }
              : appt
          )
        );
        setShowReschedule(null);
        setNewDate("");
        setNewTime("");
      } else toast.error(data.message);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  // ✅ Stripe payment handler
  const handleStripePayment = async (appointment) => {
    try {
      const res = await axios.post(
        `${backendUrl}/api/stripe/create-checkout-session`,
        { appointmentId: appointment._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) window.location.href = res.data.url;
      else toast.error("Unable to start payment.");
    } catch (err) {
      toast.error("Error creating payment session");
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) getUserAppointments();
  }, [token]);

  if (loading) return <MyAppointmentsSkeleton />;
  if (error)
    return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 mt-16">
      <h2 className="pb-4 text-2xl font-semibold text-zinc-800 border-b mb-8">
        My Appointments
      </h2>

      <div className="space-y-6">
        {appointments.map((item) => (
          <div
            key={item._id}
            className={`border rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm transition-all duration-200 ${
              item.cancelled ? "opacity-70 bg-gray-50" : "hover:shadow-md"
            }`}
          >
            {/* Doctor Info */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <img
                src={
                  item.docId?.image
                    ? item.docId.image.startsWith("/uploads/")
                      ? `${backendUrl}${item.docId.image}`
                      : item.docId.image
                    : "/default-avatar.png"
                }
                alt={item.docId?.name || "Doctor"}
                className="w-16 h-16 rounded-full object-cover border border-gray-300 flex-shrink-0"
              />
              <div className="min-w-0">
                <p className="font-semibold text-lg text-gray-800 truncate">
                  {item.docId?.name || "Unknown Doctor"}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {item.docId?.speciality || "—"}
                </p>
                <p
                  className={`text-xs mt-1 font-medium ${
                    item.docId?.available ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {item.docId?.available ? "Available" : "Unavailable"}
                </p>
                <p className="text-xs text-gray-400 mt-1 truncate">
                  {item.docId?.address?.line1 ||
                    item.docId?.address?.address1 ||
                    ""}
                  {item.docId?.address?.line2 ||
                  item.docId?.address?.address2
                    ? `, ${
                        item.docId?.address?.line2 ||
                        item.docId?.address?.address2
                      }`
                    : ""}
                </p>
              </div>
            </div>

            {/* Appointment Info */}
            <div className="text-sm text-gray-600 md:text-right flex-1">
              <p>
                <strong>Date:</strong>{" "}
                {new Date(item.slotDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              <p>
                <strong>Time:</strong>{" "}
                {new Date(`1970-01-01T${item.slotTime}`).toLocaleTimeString(
                  "en-US",
                  { hour: "numeric", minute: "2-digit", hour12: true }
                )}
              </p>
              <p>
                <strong>Fee:</strong> ₦
                {item.docId?.fees?.toLocaleString() || "—"}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center md:justify-end gap-2 flex-1">
              {item.payment ? (
                <span className="text-green-600 font-medium bg-green-100 px-3 py-1 rounded-md">
                  Paid
                </span>
              ) : (
                <button
                  onClick={() => handleStripePayment(item)}
                  disabled={item.payment}
                  className={`text-sm px-3 py-1.5 rounded ${
                    item.payment
                      ? "bg-gray-300 cursor-not-allowed text-gray-600"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
                >
                  Pay Now
                </button>
              )}

              <button
                onClick={() => cancelAppointment(item._id)}
                disabled={processingId === item._id}
                className={`text-sm px-3 py-1.5 rounded transition ${
                  item.cancelled
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }`}
              >
                {item.cancelled ? "Canceled" : "Cancel"}
              </button>

              {/* ✅ Reschedule stays active even if cancelled */}
              <button
                onClick={() =>
                  setShowReschedule(
                    showReschedule === item._id ? null : item._id
                  )
                }
                disabled={processingId === item._id}
                className="text-sm px-3 py-1.5 rounded bg-primary hover:bg-primary/90 text-white transition"
              >
                Reschedule
              </button>
            </div>

            {/* Reschedule Section */}
            {showReschedule === item._id && (
              <div className="w-full border-t border-gray-200 pt-4 mt-4 md:ml-10 transition-all duration-300">
                <p className="text-gray-700 font-medium mb-2">
                  Select a new date and time:
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full sm:w-auto shadow-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  />
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full sm:w-auto shadow-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  />
                  <div className="flex gap-2 mt-2 sm:mt-0">
                    <button
                      onClick={() => rescheduleAppointment(item._id)}
                      className="bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-2 rounded-lg font-medium"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setShowReschedule(null)}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm px-4 py-2 rounded-lg font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyAppointments;

/* 🩶 Skeleton Loader */
const MyAppointmentsSkeleton = () => (
  <div className="max-w-5xl mx-auto px-4 md:px-8 mt-16">
    <h2 className="pb-4 text-2xl font-semibold text-zinc-800 border-b mb-8">
      My Appointments
    </h2>
    <div className="space-y-6">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse" />
            <div>
              <div className="h-4 w-40 bg-gray-200 rounded-md mb-2 animate-pulse"></div>
              <div className="h-3 w-24 bg-gray-200 rounded-md mb-1 animate-pulse"></div>
              <div className="h-3 w-32 bg-gray-200 rounded-md animate-pulse"></div>
            </div>
          </div>
          <div>
            <div className="h-3 w-24 bg-gray-200 rounded-md mb-2 animate-pulse"></div>
            <div className="h-3 w-16 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-20 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="h-8 w-20 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);
