"use client";

import { reviews, shapes } from "@/constant/constant";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const Section7 = () => {
  const router = useRouter();
  return (
    <div className="p-5 md:p-10">
      <h1 className="title font-semibold leading-[1.2] text-center capitalize">
        What parents say
      </h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-20 py-10">
        {reviews.map((review, index) => (
          <div
            key={index}
            className={`w-[100%] mx-auto ${
              index % 2 === 0 ? "bg-[#2DB787]" : "bg-[#FFEB3B]"
            } ${
              shapes[index]
            } aspect-square overflow-hidden relative cursor-pointer group`}
          >
            <div className="absolute inset-0 transition-transform duration-500 group-hover:translate-y-full">
              <Image
                src={`/images/new/say${index}.png`}
                fill
                alt="Parent"
                className="object-contain absolute translate-y-[5%]"
              />
            </div>

            <div
              className={`opacity-0 group-hover:opacity-100 transition-all duration-500 absolute inset-0 flex flex-col justify-center p-4 text-center items-center gap-2 translate-y-[-100%] ${
                index % 2 == 0 ? "text-white" : "text-black"
              } group-hover:translate-y-0 ${
                index % 2 === 0 ? "bg-[#2DB787]" : "bg-[#FFEB3B]"
              } ${shapes[index]} justify-between py-10`}
            >
              <div className="bg-white text-[12px] md:text-[18px] text-black px-2 rounded-xl">
                <span>⭐</span> {review.rating}
              </div>
              <h1 className="font-normal leading-[1.2] text-[11px] capitalize md:text-[18px]">
                {review.review}
              </h1>
              <h1 className="font-normal text-[12px] md:text-[18px]">
                - {review.name}
              </h1>
            </div>
          </div>
        ))}
      </div>
      <button
        className="px-4 mx-auto py-2 group font-bold rounded-lg flex justify-center items-center gap-2 new-gradient hover:brightness-110 transition-all text-[18px] mt-5"
        onClick={() => router.push("/child-details")}
      >
        Start Your journey Now
        <ArrowUpRight size={20} className="group-hover:animate-intro" />
      </button>
    </div>
  );
};

export default Section7;
