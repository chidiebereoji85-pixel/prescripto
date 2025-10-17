import { createContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const currencySymbol = "$";

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
    image: "",
    address: { line1: "", line2: "" },
  });
  const [token, setToken] = useState(localStorage.getItem("token") || false);

  /* ============================================================
     🔐 Persist token in localStorage
  ============================================================ */
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  /* ============================================================
     🧭 Fetch all available doctors
  ============================================================ */
  const getDoctorsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await axios.get(`${backendUrl}/api/doctor/list`);

      if (data.success && Array.isArray(data.doctors)) {
        setDoctors(data.doctors);
      } else {
        throw new Error(data.message || "Failed to fetch doctors");
      }
    } catch (err) {
      console.error("Error fetching doctors:", err);
      toast.error(err.message || "Error fetching doctors");
      setError(err.message || "Error fetching doctors");
    } finally {
      setLoading(false);
    }
  }, [backendUrl]);

  /* ============================================================
     👤 Load logged-in user profile
  ============================================================ */
  const loadUserProfileData = useCallback(async () => {
    if (!token) return;

    try {
      const { data } = await axios.get(`${backendUrl}/api/user/get-profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setUserData({
          ...data.userData,
          address: data.userData.address || { line1: "", line2: "" },
        });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Profile Fetch Error:", error);
      toast.error(error.response?.data?.message || error.message);
    }
  }, [backendUrl, token]);

  /* ============================================================
     🔄 Load doctors initially + auto-refresh on update
  ============================================================ */
  useEffect(() => {
    getDoctorsData();

    const handleStorageChange = (e) => {
      if (e.key === "doctorUpdated") {
        console.log("🔁 Doctor update detected — refreshing doctor list...");
        getDoctorsData();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [getDoctorsData]);

  /* ============================================================
     🔄 Load user profile when token changes
  ============================================================ */
  useEffect(() => {
    if (token) {
      loadUserProfileData();
      getDoctorsData();
    } else {
      setUserData(false);
    }
  }, [token, loadUserProfileData, getDoctorsData]);

  /* ============================================================
     🌍 Provide everything to children components
  ============================================================ */
  const value = {
    doctors,
    setDoctors,
    getDoctorsData,
    loading,
    error,
    currencySymbol,
    backendUrl,
    token,
    setToken,
    userData,
    setUserData,
    loadUserProfileData,
  };

  return (
    <AppContext.Provider value={value}>{children}</AppContext.Provider>
  );
};

export default AppContextProvider;
