import React, { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { MapPin } from "lucide-react";

const DoctorProfile = () => {
  const { dToken, profileData, setProfileData, getProfileData, backendUrl } =
    useContext(DoctorContext);
  const { currencySymbol } = useContext(AppContext);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fees: "",
    address1: "",
    address2: "",
    available: false,
  });

  useEffect(() => {
    if (dToken) getProfileData();
  }, [dToken]);

  // Pre-fill form when editing starts
  useEffect(() => {
    if (profileData && isEditing) {
      setFormData({
        fees: profileData.fees || "",
        address1:
          profileData.address?.line1 || profileData.address?.address1 || "",
        address2:
          profileData.address?.line2 || profileData.address?.address2 || "",
        available: profileData.available || false,
      });
    }
  }, [isEditing, profileData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    try {
      const payload = {
        fees: formData.fees,
        address: {
          line1: formData.address1,
          line2: formData.address2,
        },
        available: !!formData.available, // 🔥 ensure boolean
      };

      const { data } = await axios.put(
        `${backendUrl}/api/doctor/update-profile`,
        payload,
        { headers: { Authorization: `Bearer ${dToken}` } }
      );

      if (data.success) {
        toast.success("Profile updated successfully");
        setIsEditing(false);
        getProfileData();

        // Notify AppContext to refresh doctor data globally
        window.dispatchEvent(new Event("doctorListUpdated"));
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error updating profile");
    }
  };

  const toggleAvailability = async () => {
    try {
      const newStatus = !profileData.available;

      // Optimistically update UI first
      setProfileData((prev) => ({ ...prev, available: newStatus }));

      const { data } = await axios.put(
        `${backendUrl}/api/doctor/update-profile`,
        { available: newStatus },
        { headers: { Authorization: `Bearer ${dToken}` } }
      );

      if (data.success) {
        toast.success(
          `Availability set to ${newStatus ? "Available" : "Unavailable"}`
        );
        getProfileData(); // refresh full profile
      } else {
        toast.error(data.message || "Failed to update availability");
        setProfileData((prev) => ({ ...prev, available: !newStatus })); // revert on error
      }
    } catch (error) {
      console.error("Error toggling availability:", error);
      toast.error("Error toggling availability");
      setProfileData((prev) => ({ ...prev, available: !prev.available })); // revert on error
    }
  };

  if (!profileData)
    return (
      <p className="text-center text-gray-500 py-10">Loading profile...</p>
    );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Doctor Profile
      </h2>

      <div className="bg-white shadow-md rounded-2xl border border-gray-100 p-6 flex flex-col md:flex-row gap-6">
        <div className="flex-shrink-0">
          <img
            src={
              profileData.image
                ? profileData.image.startsWith("/uploads/")
                  ? `${backendUrl}${profileData.image}`
                  : profileData.image
                : "/default-doctor.png"
            }
            alt="Doctor"
            className="w-40 h-40 rounded-xl object-cover border"
          />
        </div>

        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900">
            {profileData.name || "Unnamed Doctor"}
          </h3>
          <p className="text-gray-600 mb-2">{profileData.degree || "N/A"}</p>
          <p className="text-sm text-gray-500 mb-4">
            {profileData.experience
              ? `${profileData.experience} years of experience`
              : "Experience not specified"}
          </p>

          <div className="mb-4">
            <p className="text-gray-700 font-medium mb-1">About:</p>
            <p className="text-gray-600 text-sm leading-relaxed">
              {profileData.about || "No information provided."}
            </p>
          </div>

          <div className="mb-4">
            <p className="text-gray-700 font-medium mb-1">Consultation Fee:</p>
            <p className="text-gray-800 font-semibold">
              {currencySymbol}
              {profileData.fees || 0}
            </p>
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-5 h-5 text-blue-600" />
              <p className="text-gray-700 font-medium">Address:</p>
            </div>
            <div className="ml-7 text-gray-600 text-sm leading-relaxed">
              {profileData.address?.line1 ||
                profileData.address?.address1 ||
                "No address provided"}
              {profileData.address?.line2 || profileData.address?.address2 ? (
                <>
                  <br />
                  {profileData.address.line2 || profileData.address.address2}
                </>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              checked={profileData.available || false}
              onChange={toggleAvailability}
              className="w-4 h-4 accent-green-600 cursor-pointer"
            />
            <label
              className="text-gray-700 text-sm font-medium cursor-pointer"
              onClick={toggleAvailability}
            >
              {profileData.available
                ? "Available for Appointments"
                : "Currently Unavailable"}
            </label>
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition"
          >
            Edit Profile
          </button>
        </div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg">
            <button
              onClick={() => setIsEditing(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ✕
            </button>

            <h3 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
              Edit Profile
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Consultation Fee ({currencySymbol})
                </label>
                <input
                  type="number"
                  name="fees"
                  value={formData.fees}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 1
                </label>
                <input
                  type="text"
                  name="address1"
                  value={formData.address1}
                  onChange={handleChange}
                  placeholder="e.g. 24B, Broad Street"
                  className="w-full border rounded-lg px-3 py-2 mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 2
                </label>
                <input
                  type="text"
                  name="address2"
                  value={formData.address2}
                  onChange={handleChange}
                  placeholder="e.g. Lagos Island"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="available"
                  checked={formData.available}
                  onChange={handleChange}
                  className="w-4 h-4 accent-green-600"
                />
                <label className="text-gray-700 text-sm font-medium">
                  Available for Appointments
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-sm rounded-lg border text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorProfile;
