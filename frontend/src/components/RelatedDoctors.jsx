import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const RelatedDoctors = ({ docId, speciality }) => {
  const navigate = useNavigate();
  const { doctors } = useContext(AppContext);

  const [relatedDoctors, setRelatedDoctors] = useState([]);

  useEffect(() => {
    if (doctors?.length > 0 && speciality) {
      const filtered = doctors.filter(
        (doc) => doc.speciality === speciality && doc._id !== docId
      );
      setRelatedDoctors(filtered);
    }
  }, [doctors, speciality, docId]);

  return (
    <div className="flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10">
      <h2 className="text-3xl font-medium">Top Doctors to Book</h2>
      <p className="sm:w-1/3 text-center text-sm text-gray-600">
        Simply browse through our extensive list of trusted doctors.
      </p>

      {/* Wrapper to center grid on small doctor counts */}
      <div className="w-full flex justify-center">
        <div
          className={`
          grid gap-6 pt-5 gap-y-6 px-3 sm:px-0 
          ${
            relatedDoctors.length >= 4
              ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
              : "grid-cols-1 sm:grid-cols-2"
          }
        `}
        >
          {relatedDoctors.slice(0, 5).map((doctor) => (
            <div
              key={doctor._id}
              onClick={() => {
                navigate(`/appointment/${doctor._id}`);
                window.scrollTo({ top: 0 });
              }}
              className="w-72 border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:-translate-y-2 transition-transform duration-300"
            >
              <img
                className="bg-blue-50 w-full h-48 object-cover object-center"
                src={
                  doctor.image && doctor.image.trim() !== ""
                    ? doctor.image
                    : "/default-doctor.png"
                }
                alt={doctor.name || "Doctor"}
                onError={(e) => {
                  e.currentTarget.src = "/default-doctor.png";
                }}
              />

              <div className="p-4 text-center">
                <div className="flex justify-center items-center gap-2 text-sm text-green-500 mb-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Available</span>
                </div>

                <p className="text-gray-900 text-lg font-medium">
                  {doctor.name}
                </p>
                <p className="text-gray-600 text-sm">{doctor.speciality}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Centered Button */}
      <button
        onClick={() => {
          navigate("/doctors");
          window.scrollTo({ top: 0 });
        }}
        className="bg-blue-50 text-gray-600 px-12 py-3 rounded-full mt-10 hover:bg-blue-100 transition self-center"
      >
        View All Doctors
      </button>
    </div>
  );
};

export default RelatedDoctors;
