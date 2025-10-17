import { useState, useEffect, createContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const DoctorContext = createContext();

const DoctorContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // === STATES ===
  const [dToken, setDToken] = useState(localStorage.getItem("dToken") || "");
  const [appointments, setAppointments] = useState([]);
  const [dashData, setDashData] = useState(null);
  const [profileData, setProfileData] = useState(false)

  // === KEEP TOKEN IN SYNC ===
  useEffect(() => {
    if (dToken) {
      localStorage.setItem("dToken", dToken);
    } else {
      localStorage.removeItem("dToken");
    }
  }, [dToken]);

  // === GET DOCTOR APPOINTMENTS ===
  const getAppointments = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/appointments`, {
        headers: { Authorization: `Bearer ${dToken}` },
      });

      if (data.success) {
        setAppointments(data.appointments);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error(error.response?.data?.message || "Failed to fetch appointments");
    }
  };

  // === TOGGLE COMPLETE APPOINTMENT ===
  const toggleCompleteAppointment = async (appointmentId, extraData = {}) => {
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/doctor/toggle-complete`,
        { appointmentId, ...extraData },
        { headers: { Authorization: `Bearer ${dToken}` } }
      );

      if (data.success) {
        toast.success(data.message);
        getAppointments();
        getDashData(); // ✅ refresh dashboard too
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error toggling appointment:", error);
      toast.error(error.response?.data?.message || "Error toggling appointment");
    }
  };

  // === CANCEL APPOINTMENT ===
  const cancelAppointment = async (appointmentId) => {
    if (!appointmentId) {
      toast.error("Invalid appointment ID");
      return;
    }

    try {
      const { data } = await axios.put(
        `${backendUrl}/api/doctor/cancel-appointment`,
        { appointmentId },
        {
          headers: { Authorization: `Bearer ${dToken}` },
        }
      );

      if (data.success) {
        toast.success(data.message || "Appointment cancelled");
        getAppointments();
        getDashData(); // ✅ refresh dashboard data too
      } else {
        toast.error(data.message || "Failed to cancel appointment");
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  // === GET DASHBOARD DATA ===
  const getDashData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/dashboard`, {
        headers: { Authorization: `Bearer ${dToken}` },
      });

      if (data.success) {
        setDashData(data.dashData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error(error.response?.data?.message || "Failed to fetch dashboard");
    }
  };

  const getProfileData = async () => {
    try {
        
        const {data} = await axios.get(`${backendUrl}/api/doctor/profile`, 
            {headers: {Authorization: `Bearer ${dToken}`}});

            if(data.success) {
                setProfileData(data.profileData);
                console.log(data.profileData)
            }

    } catch (error) {
        console.error("Error fetching Docprofile data:", error);
      toast.error(error.response?.data?.message || "Failed to fetch Profile");

    }
  }


  // === CONTEXT VALUE ===
  const value = {
    backendUrl,
    dToken,
    setDToken,
    appointments,
    setAppointments,
    getAppointments,
    toggleCompleteAppointment,
    cancelAppointment,
    dashData,
    setDashData,
    getDashData,
    getProfileData,
    setProfileData,
    profileData
  };

  return (
    <DoctorContext.Provider value={value}>{children}</DoctorContext.Provider>
  );
};

export default DoctorContextProvider;
