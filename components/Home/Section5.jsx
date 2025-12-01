import { plans } from "@/constant/constant";
import {
  ArrowUpRight,
  GraduationCap,
  Heart,
  Smile,
  Trophy,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { FaArrowUpRightDots, FaPerson } from "react-icons/fa6";
import { IoIosPlanet } from "react-icons/io";
import { PiPath } from "react-icons/pi";
import { MdLockPerson, MdPersonSearch } from "react-icons/md";
import { LuCalendarCheck } from "react-icons/lu";
import PriceCarousel from "./PriceCarousel";
import { TbRibbonHealth } from "react-icons/tb";

const Section5 = () => {
  const icons = [
    <FaPerson />,
    <IoIosPlanet />,
    <PiPath />,
    <TbRibbonHealth />,
    <MdPersonSearch />,
    <Smile />,
    <GraduationCap />,
    <Trophy />,
    <MdLockPerson />,
    <FaArrowUpRightDots />,
    <Heart />,
    <LuCalendarCheck />,
  ];

  const router = useRouter();
  return (
    <div
      className="w-screen min-h-screen scroll-mt-16 xl:scroll-mt-10"
      id="choose-your-plan"
    >
      <div className="p-5 md:p-10">
        <h1 className="title  font-bold leading-[1.2] text-center capitalize">
          Choose your child's plan
        </h1>
        <h1 className="text-[16px] md:text-[28px] mt-2 font-medium leading-[1.2] text-center capitalize">
          Because Every <span className="text-[#2DB787]"> Child's </span> Path
          is <span className="text-[#2DB787]">different</span> 🌟
        </h1>
        <div className="grid px-5 md:px-10 py-10 grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-10 mt-0 md:mt-10">
          {plans.map((p, ind) => (
            <div
              key={ind}
              className="bg-[#FFEB3B] h-full relative p-5 rounded-xl border border-black flex flex-col items-center justify-center"
            >
              <h1 className="text-[24px] font-bold leading-[1.2] mt-4">
                {p.title}
              </h1>
              {/* <div className="my-3 flex items-center gap-2">
                <h2 className="text-[26px] font-bold leading-[1.2]">
                  {p.price}
                </h2>
                <p className="text-[#6F6C90] text-[16px]">/ Life Time</p>
              </div> */}
              <p className="text-[16px] font-medium text-center mt-3">
                {p.content}
              </p>
              {/* <div className="w-[60%] mt-3 mx-auto aspect-square relative">
                <Image
                  alt={p.title}
                  src={`/images/book-cover${ind}.png`}
                  fill
                  className="object-cover"
                />
              </div> */}
              {ind !== 0 && (
                <p>
                  Includes Everything in{" "}
                  {plans
                    .slice(0, ind)
                    .map((pl) => pl.title.replace(" Parenting", ""))
                    .join(", ")}{" "}
                  Parenting
                </p>
              )}
              <div className="w-[100%] overflow-hidden flex-1 flex justify-end flex-col">
                <PriceCarousel
                  features={p.features}
                  icons={icons}
                  index={ind}
                />
              </div>

              <div className="py-2"></div>
              <button
                className={`absolute bottom-0 rounded-xl flex justify-center text-white py-2 items-center gap-2 bg-black hover:new-gradient text-[18px] font-semibold hover:brightness-110 transition-all w-max px-5 h-max translate-y-1/2 left-1/2 -translate-x-1/2`}
                onClick={() => router.push("/plans")}
              >
                Compare Plans
                <ArrowUpRight size={20} />
              </button>
              {ind === 0 && (
                <div className="absolute px-3 rounded-bl-xl rounded-tr-xl top-0 right-0 new-gradient text-white text-[16px]">
                  Parent's Most Explored
                </div>
              )}
              {ind === 2 && (
                <div className="absolute px-3 rounded-bl-xl rounded-tr-xl top-0 right-0 new-gradient text-white text-[16px]">
                  Parents' Choice
                </div>
              )}
              {ind === 1 && (
                <div className="absolute px-3 rounded-bl-xl rounded-tr-xl top-0 right-0 new-gradient text-white text-[16px]">
                  Popular
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Section5;
