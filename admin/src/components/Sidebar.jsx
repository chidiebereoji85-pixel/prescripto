import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import { AdminContext } from "../context/AdminContext";
import { DoctorContext } from "../context/DoctorContext";
import { assets } from "../assets/assets";

const Sidebar = () => {
  const { aToken } = useContext(AdminContext);
  const { dToken } = useContext(DoctorContext);

  // ✅ Admin nav items
  const adminNav = [
    { to: "/admin-dashboard", icon: assets.home_icon, label: "Dashboard" },
    { to: "/all-appointments", icon: assets.appointment_icon, label: "Appointments" },
    { to: "/add-doctor", icon: assets.add_icon, label: "Add Doctor" },
    { to: "/doctor-list", icon: assets.people_icon, label: "List Doctor" }, // NEW
  ];

  // ✅ Doctor nav items
  const doctorNav = [
    { to: "/doctor-dashboard", icon: assets.home_icon, label: "Dashboard" },
    { to: "/doctor-appointment", icon: assets.appointment_icon, label: "Appointments" },
    { to: "/doctor-profile", icon: assets.people_icon, label: "Profile" }, // NEW
  ];

  // ✅ Decide which set to render
  const navItems = aToken ? adminNav : dToken ? doctorNav : [];

  if (!aToken && !dToken) return null;

  return (
    <aside className="min-h-screen bg-white border-r border-gray-200">
      <nav className="mt-6">
        <ul className="space-y-1">
          {navItems.map(({ to, icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `
                  flex items-center gap-3 px-5 py-3.5 
                  font-medium text-gray-600 
                  transition-all duration-200 rounded-r-full
                  hover:bg-gray-50 hover:text-indigo-600
                  ${isActive ? "bg-indigo-50 text-indigo-600 border-r-4 border-indigo-500" : ""}
                  `
                }
              >
                <img src={icon} alt="" className="w-5 h-5 opacity-80" />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
