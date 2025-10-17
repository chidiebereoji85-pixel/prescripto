import { useState, useEffect, createContext, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AdminContext = createContext();

const AdminContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [aToken, setAToken] = useState(localStorage.getItem("aToken") || "");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [dashData, setDashData ] = useState(false);

  // 🔹 Fetch all doctors
  const getAllDoctors = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.post(
        `${backendUrl}/api/admin/all-doctors`,
        {},
        { headers: { Authorization: `Bearer ${aToken}` } }
      );

      if (data.success) {
        setDoctors(data.doctors);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [backendUrl, aToken]);

  // 🔹 Change doctor availability
  const changeAvailability = useCallback(
    async (docId) => {
      setLoading(true);
      try {
        const { data } = await axios.post(
          `${backendUrl}/api/admin/change-availability`,
          { docId },
          { headers: { Authorization: `Bearer ${aToken}` } }
        );
  
        if (data.success) {
          toast.success(data.message);
          getAllDoctors(); // refresh updated doctor list
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        console.error("Availability error:", error.response?.data || error.message);
        toast.error(error.response?.data?.message || "Failed to change availability");
      } finally {
        setLoading(false);
      }
    },
    [backendUrl, aToken, getAllDoctors]
  );
  

  // Get all Appointment
  const getAllAppointments = async () => {
    try {
      
      const {data} = await axios.get(`${backendUrl}/api/admin/appointments`, 
        { headers: { Authorization: `Bearer ${aToken}` } }
      )

      if(data.success){
        setAppointments(data.appointments)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  const getDashData  = async () => {
      try {
        const {data} = await axios.get(`${backendUrl}/api/admin/dashboard`, 
          {headers: { Authorization: `Bearer ${aToken}` }}
        )

        if(data.success) {
          setDashData(data.dashData);
          console.log(data.dashData)
        } else{
          toast.error(data.message)

        }
      } catch (error) {
        toast.error(error.message);

      }
  }
  // 🔹 Sync token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("aToken");
    if (storedToken && storedToken !== aToken) {
      setAToken(storedToken);
    }
  }, []);

  // 🔹 Optional: logout helper
  const logoutAdmin = () => {
    localStorage.removeItem("aToken");
    setAToken("");
    setDoctors([]);
  };

  const value = {
    aToken,
    setAToken,
    backendUrl,
    doctors,
    loading,
    getAllDoctors,
    changeAvailability,
    logoutAdmin,
    appointments,
    setAppointments,
    getAllAppointments,
    dashData,
    getDashData

  };

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
};

export default AdminContextProvider;
