"use client";

import { ArrowUpRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import Image from "next/image";
import Link from "next/link";
import { blogs } from "@/constant/constant";
import { useRouter } from "next/navigation";

const Section6 = () => {
  const router = useRouter();
  return (
    <div
      className="w-screen md:min-h-screen scroll-mt-16 xl:scroll-mt-10"
      id="blog"
    >
      <div className="p-5 md:p-10">
        <h1 className="title font-bold leading-[1.2] text-center capitalize">
          Freebie for better parenting
        </h1>
        <h1 className="text-[16px] md:text-[24px] mt-2 font-medium leading-[1.2] text-center capitalize">
          Because{" "}
          <span className="text-[#2DB787] font-bold">Great Parenting </span>{" "}
          Starts with{" "}
          <span className="text-[#2DB787] font-bold">Small Steps</span> 🌟
        </h1>
        <div className="hidden md:grid grid-cols-1 mt-7 mb-8 xl:mt-14 xl:mb-16 px-8 xl:px-16 md:grid-cols-2 xl:grid-cols-3 max-md:gap-10">
          {blogs.map((blog, index) => (
            <div
              key={index}
              className={`${
                index == 1 && "xl:row-span-2 xl:h-full"
              } relative w-full`}
            >
              <Link
                href={`/blogs/${blog.link}`}
                className="w-full h-full relative group"
              >
                <div
                  className={`${
                    index != 1
                      ? "xl:w-[80%] aspect-video mx-auto"
                      : "xl:w-[90%] h-[90%] mx-auto"
                  } relative max-md:w-full max-md:aspect-video`}
                >
                  <Image
                    src={`/images/new/blog${index + 1}.png`}
                    fill
                    alt={blog.title}
                    className="object-cover rounded-xl"
                  />
                  {index === 0 && (
                    <div className="absolute px-3 rounded-bl-xl rounded-tr-xl top-0 right-0 bg-[#FFEB3B] text-[16px]">
                      Popular
                    </div>
                  )}
                  {index === 1 && (
                    <div className="absolute px-3 rounded-bl-xl rounded-tr-xl top-0 right-0 bg-[#FFEB3B] text-[16px]">
                      Most Viewed
                    </div>
                  )}
                  {index === 4 && (
                    <div className="absolute px-3 rounded-bl-xl rounded-tr-xl top-0 right-0 bg-[#FFEB3B] text-[16px]">
                      Recently Added
                    </div>
                  )}
                </div>
                <h1
                  className={`text-[20px] font-normal leading-[1.2] mt-2 ${
                    index != 1 ? "xl:w-[80%] mx-auto" : "xl:w-full"
                  }`}
                >
                  {blog.title}.{" "}
                  <span
                    className="text-sm text-gray-700
                  "
                  >
                    Read More...
                  </span>
                </h1>
              </Link>
            </div>
          ))}
        </div>
        <Carousel
          opts={{ align: "start" }}
          className="w-[90%] mx-auto block md:hidden mt-5"
        >
          <CarouselContent className="w-[90%] mx-auto">
            {blogs.map((blog, index) => (
              <CarouselItem key={index} className="w-[80%] relative">
                <Link
                  href={`/blogs/${blog.link}`}
                  className="w-full h-full relative group"
                >
                  <div className="relative max-md:w-full max-md:aspect-video">
                    <Image
                      src={`/images/new/blog${index + 1}.png`}
                      fill
                      alt={blog.title}
                      className="object-cover rounded-xl"
                    />
                    {index === 0 && (
                      <div className="absolute px-3 rounded-bl-xl rounded-tr-xl top-0 right-0 bg-[#FFEB3B] text-[16px]">
                        Popular
                      </div>
                    )}
                    {index === 1 && (
                      <div className="absolute px-3 rounded-bl-xl rounded-tr-xl top-0 right-0 bg-[#FFEB3B] text-[16px]">
                        Most Viewed
                      </div>
                    )}
                    {index === 4 && (
                      <div className="absolute px-3 rounded-bl-xl rounded-tr-xl top-0 right-0 bg-[#FFEB3B] text-[16px]">
                        Recently Added
                      </div>
                    )}
                  </div>
                  <h1
                    className={`text-[20px] font-normal leading-[1.2] mt-2 ${
                      index != 1 ? "xl:w-[80%] mx-auto" : "xl:w-full"
                    }`}
                  >
                    {blog.title}.{" "}
                    <span
                      className="text-sm text-gray-700
                  "
                    >
                      Read More...
                    </span>
                  </h1>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="translate-x-[50%]" />
          <CarouselNext className="translate-x-[-50%]" />
        </Carousel>
        <button
          className="px-4 mx-auto py-2 group font-bold rounded-lg flex justify-center items-center gap-2 new-gradient hover:brightness-110 transition-all text-[18px] mt-5"
          onClick={() => router.push("/blogs")}
        >
          Explore More Resources
          <ArrowUpRight size={20} className="group-hover:animate-intro" />
        </button>
      </div>
    </div>
  );
};

export default Section6;
