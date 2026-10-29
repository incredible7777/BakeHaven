// Purpose: Interactive Contact Form (Submits to /api/contact)
import React, { useState } from "react";
import api from "../services/api";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      const res = await api.post("/contact", formData);
      setFeedback({ type: "success", text: res.data.message || "Message sent successfully!" });
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      setFeedback({
        type: "error",
        text: err.response?.data?.message || "Failed to send message. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="max-w-4xl mx-auto px-4 mt-24 font-uchen" data-aos="fade-up" data-aos-duration="1500">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-[#a16d0e] drop-shadow border-b-2 border-[#a16d0e] pb-3 mb-10 tracking-widest">
        CONTACT US
      </h2>

      {feedback && (
        <div
          className={`mb-6 p-3 rounded text-center text-sm font-bold ${
            feedback.type === "success"
              ? "bg-green-100 text-green-800 border border-green-300"
              : "bg-red-100 text-red-800 border border-red-300"
          }`}
        >
          {feedback.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
            required
            className="w-full bg-[#a16d0e] placeholder-white text-white font-semibold px-4 py-2.5 rounded focus:outline-none focus:ring-2 focus:ring-white shadow"
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            required
            className="w-full bg-[#a16d0e] placeholder-white text-white font-semibold px-4 py-2.5 rounded focus:outline-none focus:ring-2 focus:ring-white shadow"
          />
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone"
            required
            className="w-full bg-[#a16d0e] placeholder-white text-white font-semibold px-4 py-2.5 rounded focus:outline-none focus:ring-2 focus:ring-white shadow"
          />
        </div>

        <textarea
          name="message"
          rows="5"
          value={formData.message}
          onChange={handleChange}
          placeholder="Message"
          required
          className="w-full bg-[#a16d0e] placeholder-white text-white font-semibold px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-white shadow resize-none"
        ></textarea>

        <div className="text-center pt-2">
          <button
            type="submit"
            disabled={loading}
            className="border-2 border-white text-white hover:bg-[#a16d0e] font-bold tracking-widest px-10 py-2 rounded transition duration-300 shadow-lg disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default Contact;