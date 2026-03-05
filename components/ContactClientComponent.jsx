"use client";
import NewFooter from "@/components/NewFooter";
import Image from "next/image";
import { useState } from "react";
import { toast } from "react-toastify";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Header from "@/components/Header";

const ContactClientComponent = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    plan: "",
    details: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (value) => {
    setFormData({ ...formData, phone: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Form submitted successfully!", {
      position: "top-right",
      autoClose: 3000,
    });
  };

  return (
    <div>
      <Header />
      <div className="w-screen min-h-screen flex flex-col md:flex-row gap-5 pt-10 justify-center items-center px-5 xl:px-16">
        <div className="w-full mt-20 md:mt-0 h-full relative md:w-1/2 flex flex-col justify-center items-center">
          <h1 className="text-[42px] leading-[1.2] text-[#02030B] font-bold capitalize">
            Need Personalized Advice? Let's Connect
          </h1>
          <div className="w-full aspect-video mt-4 md:h-[400px] rounded-xl overflow-hidden relative">
            <Image
              src={`/images/new/contact-hero.png`}
              fill
              className="object-cover rounded-xl"
              alt="Hero image"
            />
          </div>
        </div>

        <div className="w-full h-full relative md:w-1/2 flex flex-col justify-center items-center gap-5">
          <div className="w-[90%] md:w-[60%] mx-auto h-full bg-[#02030B] text-white p-6 rounded-lg shadow-md">
            <h2 className="text-[24px] font-semibold text-center mb-4">
              Contact Us
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-white/50 rounded-xl bg-[#02030B] text-white"
                />
              </div>

              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-white/50 rounded-xl bg-[#02030B] text-white"
                />
              </div>

              <div>
                <PhoneInput
                  country={"in"}
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  inputClass="!w-full !bg-[#02030B] !mr-2 !text-white !border !border-white/50 !rounded-xl"
                  dropdownClass="!bg-[#02030B] !text-white hover:!bg-[#02030B]"
                  buttonClass="!bg-[#02030B] !border-white/50"
                  required
                />
              </div>

              <div>
                <select
                  name="plan"
                  value={formData.plan}
                  onChange={handleChange}
                  required
                  className="w-full p-2 py-3 border border-white/50 rounded-xl bg-[#02030B] text-white"
                >
                  <option value="">Select a Plan</option>
                  <option value="basic">Starter Parenting</option>
                  <option value="standard">Pro Parenting</option>
                  <option value="premium">Master Parenting</option>
                  <option value="ultimate">Ultimate Parenting</option>
                </select>
              </div>

              <div>
                <textarea
                  name="details"
                  placeholder="Give us more details"
                  value={formData.details}
                  onChange={handleChange}
                  className="w-full p-2 border border-white/50 rounded-xl bg-[#02030B] text-white"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full new-gradient p-2 rounded-xl text-white font-semibold"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
      <div className="p-5 md:p-16 w-full">
        <h1 className="text-[24px] font-medium leading-[1.2] text-center capitalize">
          Contact Info
        </h1>
        <h1 className="text-[40px] font-bold leading-[1.2] text-center capitalize">
          We are always happy to assist you
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 place-items-center mt-10">
          <div className="w-[100%] md:w-[70%] h-full p-5 bg-[#2DB787] rounded-xl text-white flex flex-col gap-5">
            <h1 className="text-[22px] font-semibold leading-[1.2]">
              Email Support
            </h1>
            <div className="w-10 h-1 bg-white rounded-xl"></div>
            <p className="text-[22px] font-semibold">support@astrokids.ai</p>
            <p className="text-[20px] font-normal leading-[1.2]">
              Assistance hours: Monday - Friday 6 am to 8 pm EST
            </p>
          </div>
          <div className="w-[100%] md:w-[70%] h-full p-5 bg-[#2DB787] rounded-xl text-white flex flex-col gap-5">
            <h1 className="text-[22px] font-semibold leading-[1.2]">
              Call Our Experts
            </h1>
            <div className="w-10 h-1 bg-white rounded-xl"></div>
            <p className="text-[22px] font-semibold">+91 98765 43210</p>
            <p className="text-[20px] font-normal leading-[1.2]">
              Assistance hours: Monday - Friday 6 am to 8 pm EST
            </p>
          </div>
        </div>
      </div>
      <NewFooter />
    </div>
  );
};

export default ContactClientComponent;
