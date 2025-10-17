import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const Doctors = () => {
  const { doctors, loading, error } = useContext(AppContext);
  const { speciality } = useParams();
  const navigate = useNavigate();

  const specialties = [
    "General Physician",
    "Gynecologist",
    "Dermatologist",
    "Pediatrician",
    "Neurologist",
    "Gastroenterologist",
  ];

  const [filterDoc, setFilterDoc] = useState([]);
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    if (speciality) {
      setFilterDoc(doctors.filter((doc) => doc.speciality === speciality));
    } else {
      setFilterDoc(doctors);
    }
  }, [doctors, speciality]);

  if (loading) return <DoctorsSkeleton />;
  if (error)
    return (
      <div className="py-20 text-center text-red-500">
        Failed to load doctors: {error}
      </div>
    );

  return (
    <section className="px-6 md:px-20 py-16 bg-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Find a Doctor</h2>
          <p className="text-gray-500 mt-1">
            Browse specialists by category and book instantly.
          </p>
        </div>

        <div className="md:hidden">
          <button
            onClick={() => setShowFilter((prev) => !prev)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-100 transition"
          >
            {showFilter ? "Hide Filters" : "Show Filters"}
          </button>
        </div>
      </div>

      {/* Layout */}
      <div className="flex flex-col md:flex-row gap-10">
        {/* Sidebar Filters */}
        <aside
          className={`flex-col gap-3 text-sm text-gray-700 md:flex ${
            showFilter ? "flex" : "hidden"
          } md:block`}
        >
          <h4 className="font-semibold mb-2 text-gray-800">
            Filter by Speciality
          </h4>
          {specialties.map((item) => {
            const isActive = speciality === item;
            const route = isActive ? "/doctors" : `/doctors/${item}`;

            return (
              <button
                key={item}
                onClick={() => navigate(route)}
                className={`text-left px-4 py-2 border rounded-md transition-all ${
                  isActive ? "bg-primary text-white" : "hover:bg-gray-100"
                }`}
              >
                {item}
              </button>
            );
          })}
        </aside>

        {/* Doctor Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {filterDoc.length > 0 ? (
            filterDoc.map((item) => (
              <div
                key={item._id}
                onClick={() =>
                  item.available && navigate(`/appointment/${item._id}`)
                }
                className={`border rounded-lg overflow-hidden shadow-sm transition-all cursor-pointer ${
                  item.available
                    ? "hover:shadow-md hover:-translate-y-1"
                    : "opacity-70 cursor-not-allowed"
                }`}
              >
                <img
                  src={`${item.image}?v=${item.updatedAt || Date.now()}`}
                  alt={item.name}
                  className="w-full aspect-[4/3] object-cover bg-blue-50"
                />

                <div className="p-4">
                  <div
                    className={`flex items-center gap-2 text-sm mb-1 ${
                      item.available ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full inline-block ${
                        item.available ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></span>
                    {item.available ? "Available" : "Unavailable"}
                  </div>

                  <p className="font-semibold text-lg text-gray-800">
                    {item.name}
                  </p>
                  <p className="text-gray-600 text-sm">{item.speciality}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">
              No doctors found for this specialty.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default Doctors;

/* --------------------------------------------
   ✨ Skeleton Loader
--------------------------------------------- */
const DoctorsSkeleton = () => (
  <section className="px-6 md:px-20 py-16 bg-white">
    <div className="h-8 w-48 bg-gray-200 rounded-md animate-pulse mb-10"></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="border rounded-lg overflow-hidden shadow-sm p-4 animate-pulse"
        >
          <div className="w-full aspect-[4/3] bg-gray-200 rounded-md mb-4"></div>
          <div className="h-4 w-3/4 bg-gray-200 rounded-md mb-2"></div>
          <div className="h-3 w-1/2 bg-gray-200 rounded-md"></div>
        </div>
      ))}
    </div>
  </section>
);
