import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';

const MyAppointments = () => {
  const { doctors } = useContext(AppContext);

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 mt-16">
      <h2 className="pb-4 text-2xl font-semibold text-zinc-800 border-b mb-8">
        My Appointments
      </h2>

      <div className="space-y-6">
        {doctors.slice(0, 3).map((item, index) => (
          <div
            key={index}
            className="flex flex-col md:flex-row gap-6 border rounded-lg p-5 shadow-sm hover:shadow-md transition"
          >
            {/* Doctor Image */}
            <div className="w-full md:w-32 flex-shrink-0">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-auto object-cover rounded-md bg-indigo-50"
              />
            </div>

            {/* Appointment Info */}
            <div className="flex-1 text-sm text-zinc-700">
              <p className="text-lg font-semibold text-neutral-800">{item.name}</p>
              <p className="text-zinc-500 mb-2">{item.speciality}</p>

              <p className="text-zinc-700 font-medium mt-2">Address:</p>
              <p className="text-xs">{item.address.line1}</p>
              <p className="text-xs mb-2">{item.address.line2}</p>

              <p className="text-xs mt-2">
                <span className="font-medium text-sm text-neutral-700">Date & Time:</span>{' '}
                25, Nov, 2025 | 8:30 PM
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col justify-between gap-2 md:items-end mt-4 md:mt-0">
              <button className="text-sm text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition min-w-[160px]">
                Pay Online
              </button>
              <button className="text-sm text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition min-w-[160px]">
                Cancel Appointment
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyAppointments;
