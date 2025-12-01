"use client";

import EnquiryAutomation from "@/components/EnquiryAutomation";
import Header from "@/components/Header";
import NewFooter from "@/components/NewFooter";
import Section1 from "@/components/Home/Section1";
import Section2 from "@/components/Home/Section2";
import Section3 from "@/components/Home/Section3";
import Section4 from "@/components/Home/Section4";
import Section5 from "@/components/Home/Section5";
import Section6 from "@/components/Home/Section6";
import Section7 from "@/components/Home/Section7";
import { useEffect, useState } from "react";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { CountrySelect } from "@/components/ChildDetailsComponent";
import { Label } from "@/components/ui/label";
import { DialogTitle } from "@radix-ui/react-dialog";

const NewPage = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [paymentCountry, setPaymentCountry] = useState({
    name: "India",
    isoCode: "IN",
    flag: "🇮🇳",
    phonecode: "91",
    currency: "INR",
    latitude: "20.00000000",
    longitude: "77.00000000",
    timezones: [
      {
        zoneName: "Asia/Kolkata",
        gmtOffset: 19800,
        gmtOffsetName: "UTC+05:30",
        abbreviation: "IST",
        tzName: "Indian Standard Time",
      },
    ],
  });

  useEffect(() => {
    const paymentCountryJSON = localStorage.getItem("paymentCountryData");
    if (!paymentCountryJSON) {
      setDialogOpen(true);
    }
  }, []);

  return (
    <>
      <div>
        <Header />
        <Section1 />
        <Section2 />
        <Section3 />
        <Section4 />
        <Section5 />
        <Section6 />
        <Section7 />
        <EnquiryAutomation />
        <NewFooter />
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTitle></DialogTitle>
          <DialogContent
            setOpen={setDialogOpen}
            className="w-[90%] max-w-xl border-none bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#312E81] text-white rounded-2xl p-0 shadow-2xl overflow-hidden"
          >
            <div className="px-6 pt-8 pb-6 text-center">
              <p className="text-sm tracking-wider uppercase text-indigo-300">
                🌙 AstroKids Guidance
              </p>
              <h1 className="text-2xl md:text-3xl font-bold mt-2 leading-tight">
                Select Your Country
              </h1>
              <p className="text-indigo-200 text-sm mt-2">
                to help us understand your child better
              </p>
            </div>

            <div className="bg-white text-black px-6 py-6 space-y-6 rounded-t-[30px]">
              <div
                onClick={() => setOpen(!open)}
                className="flex items-center justify-between w-full px-4 py-4 border border-indigo-100 rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-all"
              >
                <CountrySelect
                  paymentCountry={paymentCountry}
                  setpaymentCountry={setPaymentCountry}
                  open={open}
                  setOpen={setOpen}
                  isBordered={false}
                />

                <Label className="text-base flex-1 pl-2 font-semibold tracking-wide">
                  {paymentCountry?.name}
                </Label>

                <span
                  className={`transition-transform duration-300 ${
                    open ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </div>

              <p className="text-gray-600 text-sm text-center leading-relaxed px-2">
                Your selection helps us provide accurate birth-chart insights
                and meaningful parenting guidance aligned with{" "}
                <span className="font-semibold text-indigo-700">
                  your culture, time zone, and environment.
                </span>{" "}
              </p>

              <DialogClose asChild>
                <button
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-2xl text-lg font-semibold hover:scale-[1.02] hover:shadow-lg transition-all"
                  onClick={() => {
                    localStorage.setItem(
                      "paymentCountryData",
                      JSON.stringify(paymentCountry)
                    );
                  }}
                >
                  ✨ Save & Continue
                </button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default NewPage;
