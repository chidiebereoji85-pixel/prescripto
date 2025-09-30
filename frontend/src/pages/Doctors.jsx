import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const Doctors = () => {
  const { doctors } = useContext(AppContext);
  const { speciality } = useParams();
  const navigate = useNavigate();

  const specialties = [
    "General physician",
    "Gynecologist",
    "Dermatologist",
    "Pediatricians",
    "Neurologist",
    "Gastroenterologist"
  ];

  const [filterDoc, setFilterDoc] = useState([]);
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    if (speciality) {
      setFilterDoc(doctors.filter(doc => doc.speciality === speciality));
    } else {
      setFilterDoc(doctors);
    }
  }, [doctors, speciality]);

  return (
    <section className="px-6 md:px-20 py-16 bg-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Find a Doctor</h2>
          <p className="text-gray-500 mt-1">Browse specialists by category and book instantly.</p>
        </div>

        <div className="md:hidden">
          <button
            onClick={() => setShowFilter(prev => !prev)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-100 transition"
          >
            {showFilter ? "Hide Filters" : "Show Filters"}
          </button>
        </div>
      </div>

      {/* Layout */}
      <div className="flex flex-col md:flex-row gap-10">
        {/* Sidebar Filters */}
        <aside className={`flex-col gap-3 text-sm text-gray-700 md:flex ${showFilter ? 'flex' : 'hidden'} md:block`}>
          <h4 className="font-semibold mb-2 text-gray-800">Filter by Speciality</h4>
          {specialties.map((item) => {
            const isActive = speciality === item;
            const route = isActive ? "/doctors" : `/doctors/${item}`;

            return (
              <button
                key={item}
                onClick={() => navigate(route)}
                className={`text-left px-4 py-2 border rounded-md transition-all ${
                  isActive ? 'bg-primary text-white' : 'hover:bg-gray-100'
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
            filterDoc.map((item, index) => (
                <div
                key={index}
                onClick={() => navigate(`/appointment/${item._id}`)}
                className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full aspect-[4/3] object-cover bg-blue-50"
                />
                <div className="p-4">
                  <div className="flex items-center gap-2 text-sm text-green-600 mb-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>Available
                  </div>
                  <p className="font-semibold text-lg text-gray-800">{item.name}</p>
                  <p className="text-gray-600 text-sm">{item.speciality}</p>
                </div>
              </div>
              
            ))
          ) : (
            <p className="text-gray-500">No doctors found for this specialty.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default Doctors;
