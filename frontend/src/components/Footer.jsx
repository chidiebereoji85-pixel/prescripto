import React from 'react';
import { assets } from '../assets/assets_frontend/assets';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="mt-32 bg-neutral-900 text-gray-300 pt-16 px-6 md:px-16">
      {/* This wrapper makes the footer full-width */}
      <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-12 text-sm">
        {/* Logo & About */}
        <div>
          <img src={assets.logo} alt="Prescripto Logo" className="w-36 mb-4" />
          <p className="leading-relaxed text-gray-400">
            Prescripto is committed to transforming healthcare through technology. Our mission is to provide accessible, affordable, and reliable medical services for all.
          </p>
          <div className="flex gap-4 mt-4 text-lg text-gray-400">
            <a href="#"><FaFacebookF className="hover:text-white transition" /></a>
            <a href="#"><FaTwitter className="hover:text-white transition" /></a>
            <a href="#"><FaLinkedinIn className="hover:text-white transition" /></a>
            <a href="#"><FaInstagram className="hover:text-white transition" /></a>
          </div>
        </div>

        {/* Company Links */}
        <div>
          <h4 className="text-white text-lg font-semibold mb-4">Company</h4>
          <ul className="space-y-3 text-gray-400">
            <li><a href="#" className="hover:text-white transition">Home</a></li>
            <li><a href="#" className="hover:text-white transition">About Us</a></li>
            <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
            <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
          </ul>
        </div>

        {/* Services */}
        <div>
          <h4 className="text-white text-lg font-semibold mb-4">Services</h4>
          <ul className="space-y-3 text-gray-400">
            <li><a href="#" className="hover:text-white transition">Online Consultation</a></li>
            <li><a href="#" className="hover:text-white transition">Medicine Delivery</a></li>
            <li><a href="#" className="hover:text-white transition">Health Packages</a></li>
            <li><a href="#" className="hover:text-white transition">Emergency Care</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-white text-lg font-semibold mb-4">Get in Touch</h4>
          <ul className="space-y-3 text-gray-400">
            <li><a href="tel:+2347045894393" className="hover:text-white transition">+234-704-5894-393</a></li>
            <li><a href="mailto:support@prescripto.com" className="hover:text-white transition">support@prescripto.com</a></li>
            <li>Mon – Fri: 9:00 AM – 6:00 PM</li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mt-12 border-t border-gray-700 pt-6 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} Prescripto – All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
