import React from 'react';
import Login from './pages/Login';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import { useContext } from 'react';
import { AdminContext } from './context/AdminContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { Routes, Route, Navigate } from 'react-router-dom';
import AllAppointments from './pages/Admin/AllAppointments';
import Dashboard from './pages/Admin/Dashboard';
import AddDoctor from './pages/Admin/AddDoctor';
import DoctorsList from './pages/Admin/DoctorsList';
import { DoctorContext } from './context/DoctorContext';
import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import DoctorAppointment from './pages/Doctor/DoctorAppointment';
import DoctorProfile from './pages/Doctor/DoctorProfile';
import AdminLayout from './layouts/AdminLayout';


const App = () => {

  const {aToken} = useContext(AdminContext);
  const {dToken} = useContext(DoctorContext);

  return  aToken || dToken ? (
    <div className='bg-[#F8F9FD]'>
      <ToastContainer /> 
      <Navbar/>
      <div className='flex items-start'>
        <Sidebar/>
        <Routes>
            {/* Redirects base "/" to /admin */}
        <Route path="/" element={<Navigate to="/admin" replace />} />

          {/* Admin Routes */}
        <Route path='/admin' element={<AdminLayout />}/>
        {/* Default route -> dashbaord */}
        <Route index element={<Dashboard />} />
        <Route path='/admin-dashboard' element={<Dashboard/>} />
        <Route path='/all-appointments' element={<AllAppointments />} />
        <Route path='/add-doctor' element={<AddDoctor />} />
        <Route path='/doctor-list' element={<DoctorsList />} />

        {/* Doctor Routes */}
        <Route path='/doctor-dashboard' element={<DoctorDashboard />} />
        <Route path='/doctor-appointment' element={<DoctorAppointment />} />
        <Route path='/doctor-profile' element={<DoctorProfile />} />

        </Routes>
      </div>

    </div>
  ) : (
    <>
    <Login />
    <ToastContainer /> 
    </>
  );
};

export default App;
