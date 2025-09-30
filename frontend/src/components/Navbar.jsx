import React, { useEffect, useState } from 'react'
import { assets } from '../assets/assets_frontend/assets'
import { NavLink, useNavigate } from 'react-router-dom'

const Navbar = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [token, setToken] = useState(true);

  const navLinkClass = ({ isActive }) =>
    isActive
      ? 'relative after:content-[""] after:block after:h-0.5 after:w-3/5 after:bg-primary after:mx-auto'
      : ''

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = showMenu ? 'hidden' : 'auto'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [showMenu])

  // Auto close menu on desktop resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowMenu(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className='max-w-screen-xl mx-auto flex items-center justify-between px-4 sm:px-6 md:px-8 text-sm py-4 mb-5 border-b border-b-gray-400'>
      <img onClick={() => navigate('/')} className='w-44 cursor-pointer' src={assets.logo} />

      {/* Desktop Nav */}
      <ul className='hidden md:flex items-center gap-x-6 font-medium ml-6'>
        <li><NavLink to='/' className={navLinkClass}>HOME</NavLink></li>
        <li><NavLink to='/doctors' className={navLinkClass}>ALL DOCTORS</NavLink></li>
        <li><NavLink to='/about' className={navLinkClass}>ABOUT</NavLink></li>
        <li><NavLink to='/contact' className={navLinkClass}>CONTACT</NavLink></li>
      </ul>

      <div className='flex items-center gap-4'>
        {token ? (
          <div className='flex items-center gap-2 cursor-pointer group relative whitespace-nowrap ml-4'>
            <img className='w-8 rounded-full' src={assets.profile_pic} />
            <img className='w-2.5' src={assets.dropdown_icon} />
            <div className='absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block'>
              <div className='min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4'>
                <p onClick={() => navigate('/my-profile')} className='hover:text-black cursor-pointer'>My Profile</p>
                <p onClick={() => navigate('/my-appointments')} className='hover:text-black cursor-pointer'>My Appointments</p>
                <p onClick={() => setToken(false)} className='hover:text-black cursor-pointer'>Logout</p>
              </div>
            </div>
          </div>
        ) : (
          <button onClick={() => navigate('/login')} className='bg-primary text-white px-6 py-2 rounded-full text-sm font-light whitespace-nowrap hidden md:block ml-6'>Create Account</button>
        )}
        {/* Mobile Menu Icon */}
        <img onClick={() => setShowMenu(true)} className='w-6 md:hidden' src={assets.menu_icon} alt='menu-icon' />
      </div>

      {showMenu && (
  <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col p-6 animate-slide-in">
    {/* Header */}
    <div className="flex items-center justify-between mb-6">
      <img className="w-36" src={assets.logo} alt="Prescripto Logo" />
      <img
        className="w-7 cursor-pointer transition-transform hover:rotate-90"
        onClick={() => setShowMenu(false)}
        src={assets.cross_icon}
        alt="close"
      />
    </div>

    {/* Navigation Links */}
    <ul className="flex flex-col gap-5 mt-4 text-lg font-semibold text-neutral-800">
      <NavLink
        to="/"
        onClick={() => setShowMenu(false)}
        className="px-4 py-2 rounded hover:bg-blue-100 w-full transition"
      >
        HOME
      </NavLink>
      <NavLink
        to="/doctors"
        onClick={() => setShowMenu(false)}
        className="px-4 py-2 rounded hover:bg-blue-100 w-full transition"
      >
        ALL DOCTORS
      </NavLink>
      <NavLink
        to="/about"
        onClick={() => setShowMenu(false)}
        className="px-4 py-2 rounded hover:bg-blue-100 w-full transition"
      >
        ABOUT
      </NavLink>
      <NavLink
        to="/contact"
        onClick={() => setShowMenu(false)}
        className="px-4 py-2 rounded hover:bg-blue-100 w-full transition"
      >
        CONTACT
      </NavLink>
    </ul>

    {!token && (
      <button
        onClick={() => {
          setShowMenu(false);
          navigate('/login');
        }}
        className="bg-primary text-white px-6 py-3 rounded-full mt-10 shadow hover:opacity-90 transition w-full text-center"
      >
        Create Account
      </button>
    )}
  </div>
)}
    </div>
  )
}

export default Navbar
