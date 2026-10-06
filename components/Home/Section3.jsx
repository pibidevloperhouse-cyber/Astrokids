"use client";

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

const Section3 = () => {
  const router = useRouter();
  return (
    <div
      className="w-screen md:min-h-screen scroll-mt-16 xl:scroll-mt-10"
      id="why-astrokids"
    >
      <div className="bg-[#02030B] text-white md:p-10">
        <h1 className="text-[24px] px-3 py-2 md:text-[40px] leading-[1.2] font-semibold text-center capitalize">
          Astrokids Report Benefits
        </h1>
        <div className="flex justify-center items-center flex-wrap py-5 gap-5 md:gap-10 px-2">
          <div
            className="w-[45%] py-4 px-3 flex flex-col md:py-8 group cursor-pointer overflow-hidden  md:px-6 new-gradient rounded-2xl relative group"
            onClick={() => router.push("/child-details")}
          >
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="relative w-full h-full">
                <Image
                  src={"/images/new/spark.png"}
                  fill
                  alt="Why 1"
                  className="object-cover"
                />
              </div>
            </div>
            <div className="absolute top-0 right-0">
              <div className="relative w-[80px] h-[80px]">
                <Image
                  src={"/images/new/why1.png"}
                  fill
                  alt="Why 1"
                  className="object-contain"
                />
              </div>
            </div>
            <div className="z-10 relative">
              <h1 className="text-[30px] md:text-[60px] font-bold leading-[1.2]">
                1800+
              </h1>
              <p className="w-[80%] text-[16px] md:text-[30px] leading-[1.2] font-bold">
                Happy Kids & Parents
              </p>
            </div>
            <button className="relative md:absolute self-end mt-2 md:bottom-5 md:right-5 p-1 group-hover:bg-white group-hover:text-black bg-white/30 rounded-full">
              <ArrowUpRight
                size={30}
                className="group-hover:rotate-45 transition duration-200"
              />
            </button>
          </div>
          <div
            className="w-[45%] py-4 flex flex-col md:py-8 group cursor-pointer overflow-hidden px-3 md:px-6 new-gradient rounded-2xl relative group"
            onClick={() => router.push("/child-details")}
          >
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="relative w-full h-full">
                <Image
                  src={"/images/new/spark.png"}
                  fill
                  alt="Why 1"
                  className="object-cover"
                />
              </div>
            </div>
            <div className="absolute top-0 right-0">
              <div className="relative w-[80px] h-[80px]">
                <Image
                  src={"/images/new/why2.png"}
                  fill
                  alt="Why 1"
                  className="object-contain"
                />
              </div>
            </div>
            <div className="z-10 relative">
              <h1 className="text-[30px] md:text-[60px] leading-[1.2] font-bold">
                95%
              </h1>
              <p className="text-[16px] md:text-[30px] leading-[1.2] font-bold">
                Parents See Happier Kids
              </p>
            </div>
            <button className="relative md:absolute self-end mt-2 md:bottom-5 md:right-5 p-1 group-hover:bg-white group-hover:text-black bg-white/30 rounded-full">
              <ArrowUpRight
                size={30}
                className="group-hover:rotate-45 transition duration-200"
              />
            </button>
          </div>
          <div
            className="w-[95%] md:w-[50%] py-4 px-3 flex flex-col md:py-8 overflow-hidden cursor-pointer md:px-6 bg-gradient-to-br from-[#2B2B2B] to-[#3E3E3E] text-white rounded-2xl relative group"
            onClick={() => router.push("/child-details")}
          >
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="relative w-full h-full">
                <Image
                  src={"/images/new/spark.png"}
                  fill
                  alt="Why 1"
                  className="object-cover"
                />
              </div>
            </div>
            <div className="absolute top-0 right-0">
              <div className="relative w-[60px] h-[60px]">
                <Image
                  src={"/images/new/why3.png"}
                  fill
                  alt="Why 3"
                  className="object-cover"
                />
              </div>
            </div>
            <div className="z-10 relative">
              <h1 className="text-[30px] md:text-[60px] font-bold leading-[1.2]">
                5,000-year-old
              </h1>
              <p className="text-[16px] md:text-[30px] leading-[1.2] font-bold">
                Ancient Wisdom + Modern Science
              </p>
            </div>
            <button className="relative md:absolute self-end mt-2 md:bottom-5 md:right-5 p-1 group-hover:bg-white group-hover:text-black bg-white/30 rounded-full">
              <ArrowUpRight
                size={30}
                className="group-hover:rotate-45 transition duration-200"
              />
            </button>
          </div>
          <div
            className="w-[45%] md:w-[40%] py-8 overflow-hidden cursor-pointer px-6 bg-gradient-to-tr from-[#1B1F3B] via-[#011498] to-[#6F8BEF] text-white rounded-2xl relative group"
            onClick={() => router.push("/child-details")}
          >
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="relative w-full h-full">
                <Image
                  src={"/images/new/spark.png"}
                  fill
                  alt="Why 1"
                  className="object-cover"
                />
              </div>
            </div>
            <div className="absolute top-0 right-0">
              <div className="relative w-[80px] h-[80px]">
                <Image
                  src={"/images/new/why4.png"}
                  fill
                  alt="Why 1"
                  className="object-contain"
                />
              </div>
            </div>
            <div className="z-10 relative">
              <h1 className="text-[30px] md:text-[60px] font-bold leading-[1.2]">
                15-Mins
              </h1>
              <p className="text-[16px] md:text-[30px] leading-[1.2] font-bold">
                Insights, Lifetime Impact
              </p>
            </div>
            <div className="absolute bottom-2 -right-5">
              <div className="relative w-[80px] h-[80px]">
                <Image
                  src={"/images/new/why5.png"}
                  fill
                  alt="Why 1"
                  className="object-contain"
                />
              </div>
            </div>
          </div>
          <div
            className="w-[45%] md:w-[30%] py-4 px-3 flex flex-col md:py-8 overflow-hidden cursor-pointer md:px-6 bg-gradient-to-br from-[#2B2B2B] to-[#3E3E3E] text-white rounded-2xl relative group"
            onClick={() => router.push("/child-details")}
          >
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="relative w-full h-full">
                <Image
                  src={"/images/new/spark.png"}
                  fill
                  alt="Why 1"
                  className="object-cover"
                />
              </div>
            </div>
            <div className="absolute top-0 right-0">
              <div className="relative w-[60px] h-[60px]">
                <Image
                  src={"/images/new/why6.png"}
                  fill
                  alt="Why 3"
                  className="object-cover"
                />
              </div>
            </div>
            <div className="z-10 relative">
              <h1 className="text-[30px] md:text-[60px] leading-[1.2] font-bold">
                78%
              </h1>
              <p className="text-[16px] md:text-[30px] leading-[1.2] font-bold">
                Better Academic
              </p>
            </div>
            <button className="relative md:absolute self-end mt-2 md:bottom-5 md:right-5 p-1 group-hover:bg-white group-hover:text-black bg-white/30 rounded-full">
              <ArrowUpRight
                size={30}
                className="group-hover:rotate-45 transition duration-200"
              />
            </button>
          </div>
          <div
            className="w-[45%] md:w-[32.5%] md:py-8 py-4 px-3 flex flex-col overflow-hidden cursor-pointer md:px-6 new-gradient rounded-2xl relative group"
            onClick={() => router.push("/child-details")}
          >
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="relative w-full h-full">
                <Image
                  src={"/images/new/spark.png"}
                  fill
                  alt="Why 1"
                  className="object-cover"
                />
              </div>
            </div>
            <div className="absolute top-0 -right-3">
              <div className="relative w-[70px] h-[70px]">
                <Image
                  src={"/images/new/why7.png"}
                  fill
                  alt="Why 3"
                  className="object-contain"
                />
              </div>
            </div>
            <div className="z-10 relative">
              <h1 className="text-[30px] md:text-[60px] font-bold leading-[1.2]">
                24/7
              </h1>
              <p className="text-[16px] md:text-[30px] leading-[1.2] font-bold">
                Expert Support
              </p>
            </div>
          </div>
          <div
            className="w-[45%] md:w-[25%] overflow-hidden cursor-pointer md:py-8 py-4 px-3 flex flex-col md:px-6 bg-white text-black rounded-2xl relative group"
            onClick={() => router.push("/child-details")}
          >
            <div className="absolute top-0 right-0">
              <div className="relative w-[60px] h-[60px]">
                <Image
                  src={"/images/new/why7.png"}
                  fill
                  alt="Why 3"
                  className="object-cover"
                />
              </div>
            </div>
            <div className="z-10 relative">
              <h1 className="text-[30px] md:text-[60px] font-bold leading-[1.2]">
                100%
              </h1>
              <p className="text-[16px] md:text-[30px] leading-[1.2] font-bold">
                Data Security
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Section3;
