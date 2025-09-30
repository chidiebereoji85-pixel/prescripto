import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { assets } from '../assets/assets_frontend/assets';
import RelatedDoctors from '../components/RelatedDoctors';

const Appointment = () => {
  const { docId } = useParams();
  const { doctors, currencySymbol } = useContext(AppContext);
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch selected doctor's info
  useEffect(() => {
    if (!doctors || !doctors.length) return;

    const selectedDoctor = doctors.find(doc => doc._id === docId);
    setDocInfo(selectedDoctor || null);
  }, [doctors, docId]);

  // Generate available slots for the week
  useEffect(() => {
    if (!docInfo) return;

    const generateSlots = () => {
      const slots = [];
      const today = new Date();

      for (let i = 0; i < 7; i++) {
        const current = new Date(today);
        current.setDate(today.getDate() + i);

        const endOfDay = new Date(current);
        endOfDay.setHours(21, 0, 0, 0);

        if (i === 0) {
          // Starting from next hour or 10:00 AM
          const nextHour = Math.max(current.getHours() + 1, 10);
          current.setHours(nextHour, current.getMinutes() > 30 ? 30 : 0, 0, 0);
        } else {
          current.setHours(10, 0, 0, 0);
        }

        const timeSlots = [];
        while (current < endOfDay) {
          const formatted = current.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          timeSlots.push({ datetime: new Date(current), time: formatted });
          current.setMinutes(current.getMinutes() + 30);
        }

        slots.push(timeSlots);
      }

      setDocSlots(slots);
      setLoading(false);
    };

    generateSlots();
  }, [docInfo]);

  // Loading state
  if (loading || !docInfo) {
    return <div className="p-10 text-center text-gray-500">Loading appointment details...</div>;
  }

  return (
    <div>
      {/* Doctor Info */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div>
          <img className="bg-primary w-full sm:max-w-72 rounded-lg" src={docInfo.image} alt={docInfo.name} />
        </div>

        <div className="flex-1 border border-gray-300 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0">
          <p className="flex items-center gap-2 text-2xl font-medium text-gray-900">
            {docInfo.name}
            <img className="w-5" src={assets.verified_icon} alt="Verified" />
          </p>
          <div className="flex items-center gap-2 text-sm mt-1 text-gray-600">
            <p>{docInfo.degree} - {docInfo.speciality}</p>
            <button className="py-0.5 px-2 border text-xs rounded-full">{docInfo.experience}</button>
          </div>
          <div className="mt-3">
            <p className="flex items-center gap-1 text-sm font-medium text-gray-900">
              About <img src={assets.info_icon} alt="info" />
            </p>
            <p className="text-sm text-gray-500 mt-1">{docInfo.about}</p>
          </div>
          <p className="text-gray-500 font-medium mt-4">
            Appointment fee: <span className="text-gray-600">{currencySymbol}{docInfo.fees}</span>
          </p>
        </div>
      </div>

      {/* Booking Slots */}
      <div className="sm:ml-72 sm:pl-4 mt-6 font-medium text-gray-700">
        <p className="text-lg">Booking Slots</p>

        {/* Day Picker */}
        <div className="flex gap-3 overflow-x-auto mt-4">
          {docSlots.map((daySlots, index) => {
            const date = daySlots[0]?.datetime;

            if(!date) return null;  
            
            return (
              <div
                key={index}
                onClick={() => setSlotIndex(index)}
                className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${
                  slotIndex === index ? 'bg-primary text-white' : 'border border-gray-200'
                }`}
              >
                <p>{daysOfWeek[date.getDay()]}</p>
                <p>{date.getDate()}</p>
              </div>
            );
          })}
        </div>

        {/* Time Slots */}
        <div className="flex gap-3 overflow-x-auto mt-4">
          {docSlots[slotIndex]?.map((slot, index) => (
            <p
              key={index}
              onClick={() => setSlotTime(slot.time)}
              className={`text-sm px-5 py-2 rounded-full cursor-pointer ${
                slot.time === slotTime
                  ? 'bg-primary text-white'
                  : 'text-gray-500 border border-gray-300'
              }`}
            >
              {slot.time.toLowerCase()}
            </p>
          ))}
        </div>

        <button
          disabled={!slotTime}
          className={`mt-6 px-14 py-3 rounded-full text-sm font-light ${
            slotTime ? 'bg-primary text-white' : 'bg-gray-300 text-gray-600 cursor-not-allowed'
          }`}
        >
          Book an Appointment
        </button>
      </div>

      {/* Related Doctors */}
      <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
    </div>
  );
};

export default Appointment;
