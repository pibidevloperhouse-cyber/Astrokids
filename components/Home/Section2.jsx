"use client";

import EmblaCarousel from "../ui/EmblaCarousel";
import { ArrowUpRight } from "lucide-react";
import { slides } from "@/constant/constant";
import { useRouter } from "next/navigation";

const Section2 = () => {
  const OPTIONS = { containScroll: false };
  const router = useRouter();
  return (
    <div className="p-5 md:p-10">
      <h1 className="title font-bold leading-[1.2] text-center capitalize">
        Real Stories from AstroKids Families
      </h1>
      <h1 className="text-[16px] mb-5 md:text-[24px] mt-2 font-medium leading-[1.2] text-center capitalize">
        See How{" "}
        <span className="text-[#2DB787] font-bold">5,000+ Parents </span> Found{" "}
        <span className="text-[#2DB787] font-bold"> Clarity in the Stars</span>{" "}
        ✨
      </h1>
      <EmblaCarousel slides={slides} options={OPTIONS} />
      <div>
        <h1 className="text-[16px] md:text-[24px] leading-[1.2] mt-2 font-[500] text-center capitalize">
          Join the <span className="text-[#2DB787]">232 parents</span> who{" "}
          <span className="text-[#2DB787]">Transformed</span> their parenting
          journey last five months.
        </h1>
        <button
          className="px-4 mx-auto py-2 group font-bold rounded-lg flex justify-center items-center gap-2 new-gradient hover:brightness-110 transition-all text-[18px] mt-5"
          onClick={() => router.push("/child-details")}
        >
          Start Your journey Now
          <ArrowUpRight size={20} className="group-hover:animate-intro" />
        </button>
      </div>
    </div>
  );
};

export default Section2;
