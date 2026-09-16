"use client";

import { steps } from "@/constant/constant";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";

const Section4 = () => {
  const router = useRouter();
  return (
    <div
      className="w-screen md:min-h-screen scroll-mt-16 xl:scroll-mt-10"
      id="how-it-works"
    >
      <div className="p-5 md:p-10">
        <h1 className="text-[40px] font-bold leading-[1.2] text-center capitalize">
          How It Works
        </h1>
        <h1 className="text-[28px] mt-2 font-medium leading-[1.2] text-center capitalize">
          Simple <span className="text-[#2DB787]">3-Step</span> Process
        </h1>
        <div className="hidden md:flex flex-col p-5 mt-5 md:flex-row gap-10 justify-center items-center">
          {steps.map((step, index) => (
            <div
              key={index}
              className="p-0.5 w-[80%] md:w-[30%] rounded-lg bg-gradient-to-br from-[#2DB787] to-[#FFEB3B]"
            >
              <div className="flex px-5 py-3 bg-white rounded-lg flex-col gap-5">
                <div className="flex gap-2 justify-start w-full items-end">
                  <div className="text-[#2DB787] text-[50px] md:text-[60px] leading-[0.8]">
                    0<span>{index + 1}</span>
                  </div>
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i <= index ? "bg-[#2DB787]" : "bg-black"
                      }`}
                    ></div>
                  ))}
                </div>
                <h1 className="text-[32px] md:text-[46px] font-semibold leading-[1.2] capitalize">
                  {step.title}
                </h1>
                <div className="relative w-[100px] self-end h-[100px]">
                  <Image
                    src={step.image}
                    fill
                    alt={step.title}
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="block md:hidden p-5 w-[90%] mx-auto my-5">
          <Carousel opts={{ align: "start" }}>
            <CarouselContent>
              {steps.map((step, index) => (
                <CarouselItem key={index}>
                  <div
                    key={index}
                    className="p-0.5 w-[90%] mx-auto rounded-lg bg-gradient-to-br from-[#2DB787] to-[#FFEB3B]"
                  >
                    <div className="flex px-5 py-3 bg-white rounded-lg flex-col gap-5">
                      <div className="flex gap-2 justify-start w-full items-end">
                        <div className="text-[#2DB787] text-[30px] leading-[0.8]">
                          0<span>{index + 1}</span>
                        </div>
                        {[...Array(3)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i <= index ? "bg-[#2DB787]" : "bg-black"
                            }`}
                          ></div>
                        ))}
                      </div>
                      <h1 className="text-[23px] font-semibold leading-[1.2] capitalize">
                        {step.title}
                      </h1>
                      <div className="relative w-[100px] self-end h-[100px]">
                        <Image
                          src={step.image}
                          fill
                          alt={step.title}
                          className="object-contain"
                        />
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="translate-x-[50%]" />
            <CarouselNext className="translate-x-[-50%]" />
          </Carousel>
        </div>
        <h1 className="text-[16px] md:text-[28px] mt-2 font-medium leading-[1.2] text-center capitalize">
          It's like having a parenting manual written{" "}
          <span className="text-[#2DB787]"> just for your child.</span>
        </h1>
        <button
          className="px-4 mx-auto py-2 font-bold rounded-lg flex justify-center items-center gap-2 new-gradient hover:brightness-110 transition-all mt-5"
          onClick={() => router.push("/child-details")}
        >
          Unlock Their Potential
          <ArrowUpRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default Section4;
