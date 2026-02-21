"use client";
import Header from "@/components/Header";
import NewFooter from "@/components/NewFooter";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

const AboutPage = () => {
  const router = useRouter();
  const about = [
    {
      title: "No Generic Advice",
      con: "Every report is personalized to your child's birth chart, body type, and planetary influences.",
    },
    {
      title: "Real Results",
      con: "93% of parents report better communication with their kids after using AstroKids.",
    },
    {
      title: "Satisfaction Guarantee",
      con: "Love your insights or get a full refund within 30 days — no questions asked.",
    },
  ];
  const team = [
    {
      title: "Siranjeevi Ramdoss",
      con: "CEO & Tech Parent",
      desc: "As a dad of two, I know parenting can feel overwhelming. We built AstroKids to turn cosmic insights into simple, daily wins",
    },
    {
      title: "Palani Kumar Murugesan",
      con: "CTO & Cosmic Code Wizard",
      desc: "Technology should empower, not complicate. Our AI models make Vedic astrology accessible to every family.",
    },
    {
      title: "Pragna T",
      con: "Lead Vedic Astrologer",
      desc: "Your child’s birth chart isn’t their destiny — it’s a roadmap to their strengths. Let’s walk this journey together.",
    },
  ];
  return (
    <div className="w-full h-full">
      <Header />
      <div className="w-screen h-[60vh] md:h-screen">
        <div className="w-screen h-[60vh] md:h-screen overflow-hidden relative">
          <Image
            src={`/images/new/about-hero.png`}
            fill
            className="object-cover mt-16"
            alt="Hero image"
          />
          <div className="w-screen h-[60vh] md:h-screen absolute top-0 left-0 bg-[#1B1F3B]/60"></div>
        </div>
        <div className="absolute top-0 text-white w-screen h-[60vh] md:h-screen flex flex-col gap-3 justify-center items-center">
          <p className="text-[14px] bg-white text-[#09090B] font-semibold px-4 py-1 rounded-xl">
            Based on Scientific Research
          </p>
          <h1 className="text-center leading-[1.2] font-bold text-[60px] px-3 md:text-[48px]">
            Guiding Parents
          </h1>
          <p className="font-bold text-[24px] uppercase tracking-[0] px-5 text-center leading-[1.2]">
            With <span className="text-[#FFEB3B]"> Wisdom, Science, </span>and{" "}
            {""}
            <span className="text-[#FFEB3B]">Heart💛</span>
          </p>
        </div>
      </div>
      <div className="px-5 md:p-16" id="our-mission">
        <div className="flex flex-col md:flex-row">
          <div className="flex flex-col w-full md:w-1/2 justify-center">
            <h1 className="text-[60px] text-[#02030B] font-semibold leading-[1.2]">
              Our Mission
            </h1>
            <p className="text-[#02030B]/50 font-medium text-[20px] mt-4">
              At AstroKids, we believe every child is born with a unique cosmic
              blueprint. By blending 5,000-year-old Vedic wisdom with modern AI
              technology, we empower parents to nurture their child’s mental,
              emotional, and physical well-being — holistically, confidently,
              and joyfully.
            </p>
          </div>
          <div className="w-full md:w-1/2 p-5 flex justify-end">
            <div className="w-[90%] md:w-[75%] aspect-square relative">
              <Image
                alt="about"
                src={"/images/new/about1.png"}
                fill
                className="object-contain absolute"
              />
              <Image
                alt="vector"
                src={"/images/new/about2.png"}
                width={120}
                height={120}
                className="aspect-square top-[50%] -translate-x-[50%] -translate-y-[50%] absolute"
              />
              <h1 className="absolute w-[70px] leading-[1.2] rotate-6 text-[20px] text-white font-[400] text-center top-[50%] -translate-x-[50%] -translate-y-[50%]">
                Happy Parent
              </h1>
            </div>
          </div>
        </div>
      </div>
      <div
        className="px-5 pb-4 md:p-16 flex flex-col justify-center items-center"
        id="trust-us"
      >
        <h1 className="text-[40px] font-bold leading-[1.2] text-center capitalize">
          Why Parents Trust Us
        </h1>
        <h1 className="text-[24px] mt-5 font-medium leading-[1.2] text-center capitalize">
          Always put your <span className="text-[#2DB787]">child first</span>
        </h1>
        <div className="flex flex-wrap gap-5 justify-center md:justify-around mt-7 items-center">
          {about.map((item, index) => (
            <div
              key={index}
              className="w-[80%] bg-[#FFEB3B] rounded-xl md:w-[22%] p-5 gap-4 flex flex-col"
            >
              <div className="w-[50px] aspect-square bg-[#2DB787] rounded-full flex justify-center items-center">
                <Image
                  src={`/images/new/about-icon${index + 1}.png`}
                  width={25}
                  height={25}
                  alt={index}
                />
              </div>
              <h1 className="text-[20px] font-bold leading-[1.2] capitalize">
                {item.title}
              </h1>
              <p className="text-[16px] font-normal text-[#888888] capitalize">
                {item.con}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="p-5 md:p-16 bg-[#02030B]" id="our-team">
        <h1 className="text-[40px] font-bold text-white leading-[1.2] text-center capitalize">
          Greet our squad!
        </h1>
        <div className="flex flex-wrap justify-around mt-7 gap-10">
          {team.map((item, index) => (
            <div key={index} className="w-[90%] md:w-[28%] h-full">
              <div className="w-full aspect-square relative">
                <Image
                  src={"/images/new/no-image.png"}
                  alt={`team${index}`}
                  fill
                  className="object-cover rounded-t-xl"
                />
                <div className="w-full p-3 h-max absolute left-0 bottom-0 z-10 bg-gradient-to-t from-[#151C52] to-transparent">
                  <h1 className="text-[30px] font-semibold text-white leading-[1.2] capitalize">
                    {item.title}
                  </h1>
                  <h1 className="text-[20px] font-medium text-white leading-[1.2] capitalize">
                    {item.con}
                  </h1>
                </div>
              </div>
              <div className="new-gradient min-h-[170px] px-3 py-2 rounded-b-xl font-normal text-[18px]">
                "{item.desc}"
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="p-5 md:p-16">
        <h1 className="text-[40px] font-bold text-[#02030B] leading-[1.2] text-center capitalize">
          Ready to Start Your Journey?
        </h1>
        <button
          className="px-4 mx-auto py-2 font-bold rounded-lg flex justify-center items-center gap-2 new-gradient hover:brightness-110 transition-all mt-5"
          onClick={() => router.push("/plans")}
        >
          Explore Plans Tailored to Your Child
          <ArrowUpRight size={20} />
        </button>
      </div>
      <NewFooter />
    </div>
  );
};

export default AboutPage;
