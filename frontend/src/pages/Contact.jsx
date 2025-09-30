import React from 'react';
import { assets } from '../assets/assets_frontend/assets';

const Contact = () => {
  return (
    <section className="px-6 md:px-20 py-20 bg-white">
      {/* Section Header */}
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-gray-800">
          Contact <span className="text-primary">Us</span>
        </h2>
        <p className="text-gray-500 mt-3 text-base max-w-xl mx-auto">
          Whether you have questions, feedback, or opportunities – we’re here to listen.
        </p>
      </div>

      {/* Content Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
        {/* Left: Image */}
        <div>
          <img
            src={assets.contact_image}
            alt="Contact Illustration"
            className="w-full h-auto rounded-xl shadow-lg transition-transform duration-300 hover:scale-[1.015]"
          />
        </div>

        {/* Right: Text Content */}
        <div className="space-y-10 text-gray-700">
          {/* Office Info */}
          <div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">Our Office</h3>
            <p className="text-gray-600 leading-relaxed">
              54709 Willms Station<br />
              Suite 350, Washington, USA
            </p>
            <p className="text-gray-600 mt-4">
              Tel: <span className="font-medium">(415) 555-0132</span><br />
              Email:{' '}
              <a href="mailto:bora@gmail.com" className="text-primary hover:underline">
                bora@gmail.com
              </a>
            </p>
          </div>

          {/* Careers Section */}
          <div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">Careers at <span className="text-primary">PRESCRIPTO</span></h3>
            <p className="text-gray-600 leading-relaxed mb-5">
              We’re always looking for talented people. Join our mission to transform healthcare.
            </p>
            <button className="inline-block bg-primary text-white px-6 py-3 rounded-full font-medium hover:bg-black transition-all">
              Explore Jobs
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
