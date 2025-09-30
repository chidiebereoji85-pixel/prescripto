import React, { useState } from 'react';
import { assets } from '../assets/assets_frontend/assets';

const MyProfile = () => {
  const [userData, setUserData] = useState({
    name: 'Edward Vincent',
    image: assets.profile_pic,
    email: 'richardjameswap@gmail.com',
    phone: '+1 123 456 7890',
    address: {
      line1: '57th Cross, Richmond',
      line2: 'Circle, Church Road, London',
    },
    gender: 'Male',
    dob: '2000-01-20',
  });

  const [isEdit, setIsEdit] = useState(false);

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
      {/* Profile Header */}
      <div className="flex items-center gap-6">
        <img
          className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
          src={userData.image}
          alt="user"
        />
        <div>
          {isEdit ? (
            <input
              className="text-2xl font-semibold text-gray-800 bg-gray-100 px-2 py-1 rounded w-full max-w-xs"
              type="text"
              value={userData.name}
              onChange={(e) =>
                setUserData((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          ) : (
            <h2 className="text-2xl font-semibold text-gray-800">
              {userData.name}
            </h2>
          )}
        </div>
      </div>

      <hr className="my-6 border-t border-gray-200" />

      {/* Contact Information */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase">
          Contact Information
        </h3>
        <div className="grid grid-cols-[120px_1fr] gap-y-4 text-gray-700 text-sm">
          <span className="font-medium">Email:</span>
          <span className="text-blue-600">{userData.email}</span>

          <span className="font-medium">Phone:</span>
          {isEdit ? (
            <input
              className="bg-gray-100 px-2 py-1 rounded w-full max-w-xs"
              type="text"
              value={userData.phone}
              onChange={(e) =>
                setUserData((prev) => ({ ...prev, phone: e.target.value }))
              }
            />
          ) : (
            <span className="text-blue-600">{userData.phone}</span>
          )}

          <span className="font-medium">Address:</span>
          {isEdit ? (
            <div className="flex flex-col gap-2">
              <input
                className="bg-gray-100 px-2 py-1 rounded w-full"
                value={userData.address.line1}
                onChange={(e) =>
                  setUserData((prev) => ({
                    ...prev,
                    address: { ...prev.address, line1: e.target.value },
                  }))
                }
              />
              <input
                className="bg-gray-100 px-2 py-1 rounded w-full"
                value={userData.address.line2}
                onChange={(e) =>
                  setUserData((prev) => ({
                    ...prev,
                    address: { ...prev.address, line2: e.target.value },
                  }))
                }
              />
            </div>
          ) : (
            <span className="text-gray-600">
              {userData.address.line1}
              <br />
              {userData.address.line2}
            </span>
          )}
        </div>
      </div>

      <hr className="my-6 border-t border-gray-200" />

      {/* Basic Information */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase">
          Basic Information
        </h3>
        <div className="grid grid-cols-[120px_1fr] gap-y-4 text-gray-700 text-sm">
          <span className="font-medium">Gender:</span>
          {isEdit ? (
            <select
              className="bg-gray-100 px-2 py-1 rounded w-full max-w-xs"
              value={userData.gender}
              onChange={(e) =>
                setUserData((prev) => ({ ...prev, gender: e.target.value }))
              }
            >
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          ) : (
            <span className="text-gray-600">{userData.gender}</span>
          )}

          <span className="font-medium">Birthday:</span>
          {isEdit ? (
            <input
              type="date"
              className="bg-gray-100 px-2 py-1 rounded w-full max-w-xs"
              value={userData.dob}
              onChange={(e) =>
                setUserData((prev) => ({ ...prev, dob: e.target.value }))
              }
            />
          ) : (
            <span className="text-gray-600">{userData.dob}</span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 text-right">
        {isEdit ? (
          <button
            className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition"
            onClick={() => setIsEdit(false)}
          >
            Save Information
          </button>
        ) : (
          <button
            className="border border-black text-black px-6 py-2 rounded hover:bg-black hover:text-white transition"
            onClick={() => setIsEdit(true)}
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
};

export default MyProfile;
