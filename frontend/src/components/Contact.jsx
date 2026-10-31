// Purpose: Interactive Contact Form (Submits to /api/contact) Matching Original Style 1:1
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
      setFeedback({ type: "success", text: res.data.message || "Thank you! Your message has been received by our bakery." });
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      setFeedback({
        type: "error",
        text: err.response?.data?.message || "Failed to send message. Please check details and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="max-w-4xl mx-auto px-4 mt-28 font-uchen" data-aos="fade-up" data-aos-duration="1500">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-[#a16d0e] drop-shadow border-b-2 border-[#a16d0e] pb-3 mb-12 tracking-widest uppercase">
        Contact Us
      </h2>

      {feedback && (
        <div
          className={`mb-6 p-4 rounded-xl text-center text-sm font-bold flex items-center justify-center space-x-2 shadow-md ${
            feedback.type === "success"
              ? "bg-green-100 text-green-800 border border-green-300"
              : "bg-red-100 text-red-800 border border-red-300"
          }`}
        >
          <i className={`bx ${feedback.type === "success" ? "bx-check-circle" : "bx-error-circle"} text-lg`}></i>
          <span>{feedback.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
            required
            className="w-full bg-[#a16d0e] placeholder-white/90 text-white font-medium px-4 py-3 rounded-lg border border-black/15 focus:outline-none focus:ring-2 focus:ring-white shadow-md transition"
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            required
            className="w-full bg-[#a16d0e] placeholder-white/90 text-white font-medium px-4 py-3 rounded-lg border border-black/15 focus:outline-none focus:ring-2 focus:ring-white shadow-md transition"
          />
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone"
            required
            className="w-full bg-[#a16d0e] placeholder-white/90 text-white font-medium px-4 py-3 rounded-lg border border-black/15 focus:outline-none focus:ring-2 focus:ring-white shadow-md transition"
          />
        </div>

        <textarea
          name="message"
          rows="5"
          value={formData.message}
          onChange={handleChange}
          placeholder="Message"
          required
          className="w-full bg-[#a16d0e] placeholder-white/90 text-white font-medium px-4 py-3.5 rounded-lg border border-black/15 focus:outline-none focus:ring-2 focus:ring-white shadow-md resize-none transition"
        ></textarea>

        <div id="messagebtn" className="text-center pt-3">
          <button
            type="submit"
            disabled={loading}
            className="border-2 border-white text-white hover:bg-[#a16d0e] active:scale-95 font-bold tracking-[3px] uppercase text-sm px-10 py-2.5 rounded-lg transition duration-300 shadow-xl disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Sending..." : "Message"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default Contact;
