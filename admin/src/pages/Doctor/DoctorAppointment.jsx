import React, { useContext, useEffect } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import { XCircle, CheckCircle, Circle } from "lucide-react";

const DoctorAppointment = () => {
  const {
    dToken,
    appointments,
    getAppointments,
    toggleCompleteAppointment,
    cancelAppointment,
  } = useContext(DoctorContext);

  const { calculateAge, currency } = useContext(AppContext);

  useEffect(() => {
    if (dToken) getAppointments();
  }, [dToken]);

  // Unified handler for toggling completion, including from cancelled
  const handleToggleCompletion = async (item) => {
    try {
      // If appointment is cancelled, mark as completed and reset cancellation
      if (item.cancelled) {
        await toggleCompleteAppointment(item._id, { fromCancelled: true });
      } else {
        await toggleCompleteAppointment(item._id);
      }
      getAppointments(); // Refresh to reflect latest state
    } catch (error) {
      console.error("Error toggling completion:", error);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-5">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        All Appointments
      </h2>

      <div className="bg-white shadow-md rounded-2xl overflow-hidden border border-gray-100">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-[0.3fr_2fr_1fr_0.8fr_2fr_1fr_1fr] gap-x-3 bg-gray-50 py-3 px-6 text-sm font-medium text-gray-600 border-b">
          <p>#</p>
          <p>Patient</p>
          <p>Payment</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Fees</p>
          <p className="text-center">Action</p>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-100 max-h-[80vh] overflow-y-auto">
          {appointments.length === 0 ? (
            <p className="text-center text-gray-500 py-10">
              No appointments found
            </p>
          ) : (
            appointments
              .slice()
              .reverse()
              .map((item, index) => (
                <div
                  key={item._id}
                  className={`grid grid-cols-1 md:grid-cols-[0.3fr_2fr_1fr_0.8fr_2fr_1fr_1fr] gap-x-3 items-center text-sm text-gray-700 px-6 py-4 transition ${
                    item.cancelled
                      ? "bg-red-50"
                      : item.isCompleted
                      ? "bg-green-50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {/* Index */}
                  <p className="hidden md:block">{index + 1}</p>

                  {/* Patient Info */}
                  <div className="flex items-center gap-3">
                    <img
                      src={item.userData?.image || "/default-avatar.png"}
                      alt={item.userData?.name || "User"}
                      className="w-10 h-10 rounded-full object-cover border"
                    />
                    <p className="font-medium text-gray-800">
                      {item.userData?.name || "Unknown"}
                    </p>
                  </div>

                  {/* Payment */}
                  <p>{item.payment ? "Online" : "Cash"}</p>

                  {/* Age */}
                  <p className="max-sm:hidden">
                    {calculateAge(item.userData?.dob)}
                  </p>

                  {/* Date & Time */}
                  <p>
                    {new Date(item.slotDate).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    <span className="text-gray-500">| {item.slotTime}</span>
                  </p>

                  {/* Fees */}
                  <p className="font-medium text-gray-900">
                    {currency}
                    {item.amount}
                  </p>

                  {/* Action / Status */}
                  <div className="flex flex-col items-center justify-center gap-2">
                    {/* Action Icons */}
                    <div className="flex items-center gap-3">
                      {/* Cancel (hidden if cancelled and not yet re-completed) */}
                      {!item.cancelled && (
                        <XCircle
                          onClick={() => cancelAppointment(item._id)}
                          className="w-6 h-6 text-red-500 cursor-pointer hover:scale-110 transition"
                          title="Cancel Appointment"
                        />
                      )}

                      {/* Completion toggle */}
                      {item.isCompleted ? (
                        <CheckCircle
                          onClick={() => handleToggleCompletion(item)}
                          className="w-6 h-6 text-green-600 cursor-pointer hover:scale-110 transition-all"
                          title="Mark as Incomplete"
                        />
                      ) : (
                        <Circle
                          onClick={() => handleToggleCompletion(item)}
                          className={`w-6 h-6 ${
                            item.cancelled
                              ? "text-red-400 hover:text-green-600"
                              : "text-gray-400 hover:text-green-500"
                          } cursor-pointer hover:scale-110 transition-all`}
                          title={
                            item.cancelled
                              ? "Mark as Completed (was Cancelled)"
                              : "Mark as Completed"
                          }
                        />
                      )}
                    </div>

                    {/* Status badge below */}
                    {item.cancelled ? (
                      <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-medium">
                        Cancelled
                      </span>
                    ) : item.isCompleted ? (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                        Completed
                      </span>
                    ) : item.payment ? (
                      <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-medium">
                        Paid
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorAppointment;
