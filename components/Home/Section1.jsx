"use client";
import { ArrowRightIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const Section1 = () => {
  const [imageIndex, setImageIndex] = useState(1);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setImageIndex((prev) => (prev === 5 ? 1 : prev + 1));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-screen h-max md:h-screen">
      <div className="w-screen h-[60vh] relative">
        <div className="w-screen h-full md:h-screen overflow-hidden relative">
          <Image
            src={`/images/new/hero${imageIndex}.png`}
            fill
            className="object-cover mt-0 md:mt-16"
            alt="Hero image"
          />
        </div>
        <div className="absolute top-0 text-white w-screen h-[60vh] md:h-screen flex flex-col gap-6 justify-end md:justify-center items-center py-8">
          <h1 className="italic text-center leading-[1.2] font-semibold text-[36px] px-3 md:text-[48px]">
            Nurturing <span className="text-[#FFEB3B]">Happy</span> &{" "}
            <span className="text-[#FFEB3B]">Confident</span> Kids <br />
            Holistically
          </h1>
          <div className="flex flex-col px-1 justify-center items-center mt-4 md:flex-row gap-5">
            <button
              className="relative flex items-center justify-between gap-2 p-0.5 font-bold text-black bg-white rounded-full transition-all overflow-hidden group hover:bg-transparent"
              onClick={() => {
                router.push("/plans");
              }}
            >
              <div className="absolute right-0.5 w-8 h-8 transition-all duration-300 ease-in-out rounded-full z-10 new-gradient group-hover:w-full group-hover:h-full group-hover:right-0"></div>

              <span className="px-2 z-20 transition-colors duration-300 ease-in-out group-hover:text-white">
                Discover your child Potential
              </span>

              <ArrowRightIcon
                className="z-20 text-white transition-all duration-300 ease-in-out group-hover:-rotate-45"
                size={30}
              />
            </button>
            <button
              className="relative flex items-center justify-between gap-2 p-0.5 font-bold text-black bg-white rounded-full transition-all overflow-visible group hover:bg-transparent"
              onClick={() => {
                localStorage.setItem("orderIndex", 0);
                router.push("/child-details");
              }}
            >
              {/* <div className="absolute transform -translate-y-full rotate-12 z-30 right-0 px-2 py-1 text-sm font-bold text-white bg-red-500 rounded animate-pulse">
                Free
              </div> */}
              <div className="absolute right-0.5 w-8 h-8 transition-all duration-300 ease-in-out rounded-full z-10 new-gradient group-hover:w-full group-hover:h-full group-hover:right-0"></div>

              <span className="px-2 z-20 text-xs md:text-lg font-bold transition-colors duration-300 ease-in-out group-hover:text-white">
                Get Your Child’s Free Premium Cosmic Insights
              </span>

              <ArrowRightIcon
                className="z-20 text-white transition-all duration-300 ease-in-out group-hover:-rotate-45"
                size={30}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Section1;
