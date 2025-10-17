import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets_frontend/assets";
import axios from "axios";
import { toast } from "react-toastify";
import Avatar from "./Avatar";

const MyProfile = () => {
  const { userData, setUserData, token, backendUrl, loadUserProfileData } =
    useContext(AppContext);

  const [isEdit, setIsEdit] = useState(false);
  const [image, setImage] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const updateUserProfileData = async () => {
    if (isUpdating) return; // 🚫 Prevent multiple clicks
    setIsUpdating(true);

    try {
      const formData = new FormData();
      formData.append("name", userData.name || "");
      formData.append("phone", userData.phone || "");
      formData.append("gender", userData.gender || "");
      formData.append("dob", userData.dob || "");
      formData.append("address", JSON.stringify(userData.address || {}));
      if (image) formData.append("image", image);

      const { data } = await axios.post(
        `${backendUrl}/api/user/update-profile`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        toast.success("Profile updated!");
        await loadUserProfileData();
        setIsEdit(false);
        setImage(false);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setIsUpdating(false); // ✅ Unlock after request finishes
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
      {isEdit ? (
        <label htmlFor="image" className="relative inline-block cursor-pointer">
          {image || userData.image ? (
            <Avatar
              src={image ? URL.createObjectURL(image) : userData.image}
              name={userData.name}
              size="w-24 h-24"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-gray-300 flex items-center justify-center text-gray-400 text-sm">
              No Image
            </div>
          )}

          {/* Upload icon overlay */}
          {!image && (
            <img
              src={assets.upload_icon}
              alt="Upload"
              className="absolute bottom-3 right-3 w-8 h-8 bg-white rounded-full p-1 shadow"
            />
          )}
          <input
            type="file"
            accept="image/*"
            id="image"
            hidden
            onChange={(e) => setImage(e.target.files[0])}
          />
        </label>
      ) : (
        <div className="flex items-center gap-6">
          <Avatar src={userData.image} name={userData.name} size="w-24 h-24" />
        </div>
      )}

      {/* Profile Header */}
      <div className="flex items-center gap-6">
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
              value={
                userData.dob
                  ? new Date(userData.dob).toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) =>
                setUserData((prev) => ({ ...prev, dob: e.target.value }))
              }
            />
          ) : (
            <span className="text-gray-600">
              {" "}
              {userData.dob ? new Date(userData.dob).toLocaleDateString() : ""}
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 text-right">
        {isEdit ? (
          <button
            className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition"
            onClick={updateUserProfileData}
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
