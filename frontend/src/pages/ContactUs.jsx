import React, { useState } from 'react';
import httpClient from '../httpClient';
import useDocTitle from '../hooks/useDocTitle';
import img from '../assets/contactus.jpg';

const AlertMessage = ({ type, message }) => {
  const alertStyles = {
    success: "bg-green-100 border-l-4 border-green-500 text-green-700",
    error: "bg-red-100 border-l-4 border-red-500 text-red-700"
  };

  return (
    <div className={`p-4 my-4 ${alertStyles[type]}`}>
      <p className="font-medium">{message}</p>
    </div>
  );
};

const ContactUs = () => {
  useDocTitle('Contact Us - TelMedSphere');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await httpClient.post('/contact', formData);
      if (response.status === 200) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      }
    } catch (error) {
      setSubmitStatus('error');
    }
  };

  return (
    <section className="py-20 bg-gradient-to-r from-[#f8fbff] to-white flex justify-center items-center">
    <div className="container mx-auto px-4 max-w-screen-lg">
      <h1 className="text-5xl text-center mb-8 text-[#53779c]">Contact Us</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-10 w-full">
        {/* Contact Info */}
        <div className="p-10 bg-white rounded-2xl shadow-lg flex flex-col justify-between items-center text-center md:col-span-1">
          <h3 className="text-3xl text-[#53779c] mb-4">Get in Touch</h3>
          <p className="text-lg">Have questions? We're here to help!</p>
          
          <div className="mt-8 space-y-4">
            <div>
              <p className="text-lg">telmedsphere489@gmail.com</p>
            </div>
            <div>
              <p className="text-lg">+91 12345 67890</p>
            </div>
            <div>
              <img src={img} alt="Contact Us" className="w-full rounded-lg" />
            </div>
          </div>
        </div>
  
        {/* Contact Form */}
        <div className="p-10 bg-white rounded-2xl shadow-lg md:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Your Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full p-4 text-base border-2 border-gray-200 rounded-lg transition-all duration-300 focus:border-[#3b6fa6] focus:ring-2 focus:ring-[#4f80b5] focus:ring-opacity-20 outline-none"
              />
            </div>
            <div>
              <input
                type="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full p-4 text-base border-2 border-gray-200 rounded-lg transition-all duration-300 focus:border-[#3b6fa6] focus:ring-2 focus:ring-[#4f80b5] focus:ring-opacity-20 outline-none"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
                className="w-full p-4 text-base border-2 border-gray-200 rounded-lg transition-all duration-300 focus:border-[#3b6fa6] focus:ring-2 focus:ring-[#4f80b5] focus:ring-opacity-20 outline-none"
              />
            </div>
            <div>
              <textarea
                placeholder="Your Message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                className="w-full p-4 text-base border-2 border-gray-200 rounded-lg transition-all duration-300 focus:border-[#3b6fa6] focus:ring-2 focus:ring-[#4f80b5] focus:ring-opacity-20 outline-none min-h-[150px] resize-y"
              />
            </div>
            <button
              type="submit"
              className="px-10 py-4 bg-[#3e6b9c] text-white rounded-lg text-lg font-semibold cursor-pointer transition-all duration-300 uppercase tracking-wider hover:bg-[#4a7fc0] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-300/40"
            >
              Send Message
            </button>
          </form>
  
          {submitStatus && (
            <AlertMessage
              type={submitStatus}
              message={submitStatus === 'success' 
                ? 'Message sent successfully!' 
                : 'Failed to send message. Please try again.'
              }
            />
          )}
        </div>
      </div>
    </div>
  </section>
  
  );
};

export default ContactUs;
