import React, { useContext, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { Link } from "react-router-dom";

const TopDoctors = () => {
  const { doctors, loading, error, getDoctorsData } = useContext(AppContext);

  // 🧠 Automatically refresh doctors when updates occur (Admin or Doctor)
  useEffect(() => {
    const refreshDoctors = () => {
      getDoctorsData();
    };

    // Listen for update events (Admin adds/deletes or Doctor updates)
    window.addEventListener("doctorUpdated", refreshDoctors);
    window.addEventListener("doctorListUpdated", refreshDoctors);
    window.addEventListener("storage", (e) => {
      if (e.key === "doctorUpdated" || e.key === "doctorListUpdated") {
        refreshDoctors();
      }
    });

    return () => {
      window.removeEventListener("doctorUpdated", refreshDoctors);
      window.removeEventListener("doctorListUpdated", refreshDoctors);
    };
  }, [getDoctorsData]);

  if (loading) return <TopDoctorsSkeleton />;
  if (error)
    return (
      <div className="p-10 text-center text-red-500">
        Failed to load doctors: {error}
      </div>
    );

  // ✅ Show only available doctors
  const availableDoctors = doctors.filter((doc) => doc.available);

  return (
    <div className="p-10">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Available Doctors
      </h2>

      {availableDoctors.length === 0 ? (
        <p className="text-gray-500 text-center">
          No doctors available right now.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {availableDoctors.slice(0, 4).map((doc) => (
            <Link
              key={doc._id}
              to={`/appointment/${doc._id}`}
              className="block p-5 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
            >
              <img
                src={doc.image}
                alt={doc.name}
                className="w-full h-44 object-cover rounded-lg mb-4"
              />
              <p className="font-semibold text-gray-900">{doc.name}</p>
              <p className="text-sm text-gray-500">{doc.speciality}</p>

              {/* ✅ Availability Tag */}
              <p
                className={`text-xs mt-2 font-medium ${
                  doc.available ? "text-green-600" : "text-red-500"
                }`}
              >
                {doc.available ? "Available" : "Unavailable"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopDoctors;

/* --------------------------------------------
   ✨ Skeleton Loader (Shown While Loading)
--------------------------------------------- */
const TopDoctorsSkeleton = () => {
  return (
    <div className="p-10">
      <div className="h-7 w-40 bg-gray-200 rounded-md animate-pulse mb-6"></div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm"
          >
            <div className="w-full h-44 bg-gray-200 rounded-lg animate-pulse mb-4"></div>
            <div className="h-4 w-3/4 bg-gray-200 rounded-md animate-pulse mb-2"></div>
            <div className="h-3 w-1/2 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );
};
