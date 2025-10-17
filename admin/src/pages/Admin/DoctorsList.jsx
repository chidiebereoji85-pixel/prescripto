import React, { useContext, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";

const DoctorsList = () => {
  const { doctors, aToken, getAllDoctors, changeAvailability, loading } =
    useContext(AdminContext);

  // ✅ Helper: Normalize image URL
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return "/default-avatar.png";
    if (imagePath.startsWith("http")) return imagePath;
    return `${import.meta.env.VITE_BACKEND_URL}${imagePath}`;
  };

  // ✅ Fetch doctors initially
  useEffect(() => {
    if (aToken) getAllDoctors();
  }, [aToken, getAllDoctors]);

  // ✅ Listen for doctor updates (e.g. profile image, fee, etc.)
  useEffect(() => {
    const handleDoctorUpdate = () => {
      console.log("🔄 Detected doctor update — refreshing list...");
      getAllDoctors();
      toast.info("Doctor list refreshed", { autoClose: 1500 });
    };

    window.addEventListener("doctorListUpdated", handleDoctorUpdate);
    return () => {
      window.removeEventListener("doctorListUpdated", handleDoctorUpdate);
    };
  }, [getAllDoctors]);

  // 🩺 Skeleton loader while fetching
  if (loading) return <DoctorsSkeleton />;

  // 🧩 No data fallback
  if (!doctors.length)
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <p className="text-gray-500 text-lg">No doctors found.</p>
      </div>
    );

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">All Doctors</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {doctors.map((item) => (
          <div
            key={item._id}
            className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 group"
          >
            <div className="relative">
              <img
                src={getFullImageUrl(item.image)}
                alt={item.name}
                className="w-full h-40 object-cover bg-indigo-50 transition-all duration-500 group-hover:opacity-90"
              />
              <div
                className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
                  item.available
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {item.available ? "Available" : "Unavailable"}
              </div>
            </div>

            <div className="p-4 space-y-2">
              <p className="text-lg font-semibold text-gray-800">{item.name}</p>
              <p className="text-sm text-gray-500">{item.speciality}</p>

              <div className="flex justify-between items-center pt-2">
                <p className="text-sm text-gray-700 font-medium">
                  Fee: ${item.fees || 0}
                </p>

                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!item.available}
                    onChange={() => changeAvailability(item._id)}
                    className="w-4 h-4 accent-indigo-600 rounded-md cursor-pointer"
                  />
                  <span>Toggle</span>
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* --------------------------------------------
   ✨ Skeleton Loader
--------------------------------------------- */
const DoctorsSkeleton = () => {
  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Loading Doctors...
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm p-4 animate-pulse"
          >
            <div className="w-full h-40 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 rounded-md w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded-md w-1/2 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded-md w-2/3"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorsList;
